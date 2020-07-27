import re

from girder.api import access
from girder.api.describe import Description, autoDescribeRoute, describeRoute
from girder.api.rest import Resource
from girder.constants import AccessType
from girder.models.folder import Folder
from girder.models.item import Item

from viame_tasks.tasks import (
    convert_images,
    convert_video,
    run_pipeline,
    train_pipeline,
)

from .model.attribute import Attribute
from .transforms import (
    GetPathFromFolderId,
    GetPathFromItemId,
    GirderUploadToFolder,
)
from .utils import (
    get_or_create_auxiliary_folder,
    move_existing_result_to_auxiliary_folder,
    csv_detection_file,
    training_output_folder,
    webValidImageFormats,
    validImageFormats,
    validVideoFormats,
)

from typing import Dict, List
from typing_extensions import TypedDict


class PipelineDescription(TypedDict):
    name: str
    type: str
    pipe: str


class PipelineDict(TypedDict):
    pipes: List[PipelineDescription]
    description: str


def load_pipelines(pipeline_paths):
    main_pipeline_path, trained_pipeline_path = pipeline_paths

    pipelist = []
    if main_pipeline_path is not None:
        allowed = r"^detector_.+|tracker_.+"
        disallowed = r".*local.*|detector_svm_models.pipe|tracker_svm_models.pipe"
        pipelist.extend(
            [
                path.name
                for path in main_pipeline_path.glob("./*.pipe")
                if re.match(allowed, path.name) and not re.match(disallowed, path.name)
            ]
        )

    if trained_pipeline_path is not None:
        pipelist.extend([path.name for path in trained_pipeline_path.glob("./*.pipe")])

    pipedict: Dict[str, PipelineDict] = {}
    for pipe in pipelist:
        pipe_type, *nameparts = pipe.replace(".pipe", "").split("_")
        pipe_info: PipelineDescription = {
            "name": " ".join(nameparts),
            "type": pipe_type,
            "pipe": pipe,
        }

        if pipe_type in pipedict:
            pipedict[pipe_type]["pipes"].append(pipe_info)
        else:
            pipedict[pipe_type] = {"pipes": [pipe_info], "description": ""}

    return pipedict


class Viame(Resource):
    def __init__(self, pipeline_paths=()):
        super(Viame, self).__init__()
        self.resourceName = "viame"
        self.pipeline_paths = pipeline_paths

        self.route("GET", ("pipelines",), self.get_pipelines)
        self.route("POST", ("pipeline",), self.run_pipeline_task)
        self.route("POST", ("train",), self.run_training)
        self.route("POST", ("conversion",), self.run_conversion_task)
        self.route("POST", ("image_conversion",), self.convert_folder_images)
        self.route("POST", ("attribute",), self.create_attribute)
        self.route("GET", ("attribute",), self.get_attributes)
        self.route("PUT", ("attribute", ":id"), self.update_attribute)
        self.route("DELETE", ("attribute", ":id"), self.delete_attribute)
        self.route("GET", ("valid_filetypes",), self.get_valid_filetypes)

    @access.user
    @describeRoute(Description("Get available pipelines"))
    def get_pipelines(self, params):
        return load_pipelines(self.pipeline_paths)

    @access.user
    @autoDescribeRoute(
        Description("Run viame pipeline")
        .modelParam(
            "folderId",
            description="Folder id of a video clip",
            model=Folder,
            paramType="query",
            required=True,
            level=AccessType.READ,
        )
        .param(
            "pipeline",
            "Pipeline to run against the video",
            default="detector_simple_hough.pipe",
        )
    )
    def run_pipeline_task(self, folder, pipeline):
        user = self.getCurrentUser()
        move_existing_result_to_auxiliary_folder(folder, user)
        input_type = folder["meta"]["type"]
        result_metadata = {
            "detection": str(folder["_id"]),
            "pipeline": pipeline,
        }
        return run_pipeline.delay(
            GetPathFromFolderId(str(folder["_id"])),
            pipeline,
            input_type,
            girder_job_title=("Running {} on {}".format(pipeline, str(folder["name"]))),
            girder_result_hooks=[
                GirderUploadToFolder(
                    str(folder["_id"]), result_metadata, delete_file=True
                )
            ],
        )

    @access.user
    @autoDescribeRoute(
        Description("Run training on a folder")
        .modelParam(
            "folderId",
            description="The folder containing the training data",
            model=Folder,
            paramType="query",
            required=True,
            level=AccessType.READ,
        )
        .param(
            "pipelineName",
            description="The name of the resulting pipeline",
            paramType="query",
            required=True,
        )
    )
    def run_training(self, folder, pipelineName):
        user = self.getCurrentUser()
        upload_token = self.getCurrentToken()
        # move_existing_result_to_auxiliary_folder(folder, user)

        detections = list(
            Item().find({"meta.detection": str(folder["_id"])}).sort([("created", -1)])
        )
        detection = detections[0] if detections else None

        if not detection:
            raise Exception(f"No detections for folder {folder['name']}")

        # Ensure detection has a csv format
        csv_detection_file(detection, user)

        # Get relative path to the folder containing the detection item
        path_from_root = [x["object"] for x in Item().parentsToRoot(detection)]
        folder_index = next(
            i for i, x in enumerate(path_from_root) if x["_id"] == folder["_id"]
        )

        # Get path with folder at the root
        path_names = [x["name"] for x in path_from_root[folder_index + 1 :]]

        if path_names:
            # Detection item is not in the root folder (in a sub directory)
            path_names.append(detection["name"])
            groundtruth_path = "/".join(path_names)
        else:
            # Detection item is in root folder
            groundtruth_path = detection["name"]

        # Ensure the folder to upload results to exists
        results_folder = training_output_folder(folder, user)

        return train_pipeline.delay(
            folder,
            groundtruth_path,
            pipelineName,
            girder_client_token=str(upload_token["_id"]),
            girder_job_title=(f"Running training on folder: {str(folder['name'])}"),
            girder_result_hooks=[
                GirderUploadToFolder(
                    str(results_folder["_id"]), metadata={}, delete_file=True
                )
            ],
        )

    @access.user
    @autoDescribeRoute(
        Description("Convert video to a web friendly format").modelParam(
            "itemId",
            description="Item ID for a video",
            model=Item,
            paramType="query",
            required=True,
            level=AccessType.READ,
        )
    )
    def run_conversion_task(self, item):
        user = self.getCurrentUser()
        folder = Folder().findOne({"_id": item["folderId"]})
        auxiliary = get_or_create_auxiliary_folder(folder, user)
        upload_token = self.getCurrentToken()
        convert_video.delay(
            GetPathFromItemId(str(item["_id"])),
            str(item["folderId"]),
            str(upload_token["_id"]),
            auxiliary["_id"],
            girder_job_title=(
                "Converting {} to a web friendly format".format(str(item["_id"]))
            ),
        )

    @access.user
    @autoDescribeRoute(
        Description("Convert a folder of images into a web friendly format").modelParam(
            "folder",
            description="Folder containing the images to convert",
            model=Folder,
            paramType="query",
            required=True,
            level=AccessType.WRITE,
        )
    )
    def convert_folder_images(self, folder):
        upload_token = self.getCurrentToken()
        convert_images.delay(
            folder["_id"],
            girder_client_token=str(upload_token["_id"]),
            girder_job_title=f"Converting {folder['_id']} to a web friendly format",
        )

    @access.user
    @autoDescribeRoute(
        Description("").jsonParam("data", "", requireObject=True, paramType="body")
    )
    def create_attribute(self, data, params):
        attribute = Attribute().create(
            data["name"], data["belongs"], data["datatype"], data["values"]
        )
        return attribute

    @access.user
    @autoDescribeRoute(Description(""))
    def get_attributes(self):
        return Attribute().find()

    @access.user
    @autoDescribeRoute(
        Description("")
        .modelParam("id", model=Attribute, required=True)
        .jsonParam("data", "", requireObject=True, paramType="body")
    )
    def update_attribute(self, data, attribute, params):
        if "_id" in data:
            del data["_id"]
        attribute.update(data)
        return Attribute().save(attribute)

    @access.user
    @autoDescribeRoute(Description("").modelParam("id", model=Attribute, required=True))
    def delete_attribute(self, attribute, params):
        return Attribute().remove(attribute)

    @access.user
    @describeRoute(Description("Get Valid Image/Video filetypes for uploading"))
    def get_valid_filetypes(self, params):
        return {
            "image": validImageFormats,
            "video": validVideoFormats,
            "web": webValidImageFormats,
        }
