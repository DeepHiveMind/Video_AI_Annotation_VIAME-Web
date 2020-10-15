import { TrackData } from 'vue-media-annotator/track';
import {
  Attribute, DatasetMeta, DatasetMetaMutable, Pipelines, SaveDetectionsArgs,
} from 'viame-web-common/apispec';

async function getAttributes() {
  return Promise.resolve([] as Attribute[]);
}
async function getPipelineList() {
  return Promise.resolve({} as Pipelines);
}
async function runPipeline(itemId: string, pipeline: string) {
  return Promise.resolve();
}
async function loadDetections(datasetId: string) {
  return Promise.resolve({} as { [key: string]: TrackData });
}
async function saveDetections(datasetId: string, args: SaveDetectionsArgs) {
  return Promise.resolve();
}
async function loadMetadata(datasetId: string): Promise<DatasetMeta> {
  return Promise.resolve({
    type: 'video',
    fps: 30,
  });
}
async function saveMetadata(datasetId: string, metadata: DatasetMetaMutable) {
  return Promise.resolve();
}

export {
  getAttributes,
  getPipelineList,
  runPipeline,
  loadDetections,
  saveDetections,
  loadMetadata,
  saveMetadata,
};
