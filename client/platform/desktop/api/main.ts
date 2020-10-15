import { TrackData } from 'vue-media-annotator/track';
import {
  Attribute, DatasetMeta, DatasetMetaMutable, Pipelines, SaveDetectionsArgs,
} from 'viame-web-common/apispec';
// eslint-disable-next-line
import { remote } from 'electron';
// import fs from 'fs';

function readToBlob(path: string) {
  const blob = new Blob(['something'], { type: 'video/mp4' });
  // blob.slice = (start: number, end: number, contentType: string) => {
  //   throw new Error(`${start} ${end} ${contentType}`);
  // };
  // blob.stream = () => {
  //   throw new Error('readableStream');
  // };
  return URL.createObjectURL(blob);
}

async function getAttributes() {
  return Promise.resolve([] as Attribute[]);
}
async function getPipelineList() {
  return Promise.resolve({} as Pipelines);
}
// eslint-disable-next-line
async function runPipeline(itemId: string, pipeline: string) {
  return Promise.resolve();
}
// eslint-disable-next-line
async function loadDetections(datasetId: string) {
  return Promise.resolve({} as { [key: string]: TrackData });
}
// eslint-disable-next-line
async function saveDetections(datasetId: string, args: SaveDetectionsArgs) {
  return Promise.resolve();
}
// eslint-disable-next-line
async function loadMetadata(datasetId: string): Promise<DatasetMeta> {
  // const currentWindow = remote.
  // console.log(currentWindow);
  // if (currentWindow === null) {
  //   throw new Error('BrowserWindow focused was null');
  // }
  // const results = await remote.dialog.showOpenDialog({
  //   properties: ['openFile'],
  // });
  // console.log(results);
  return Promise.resolve({
    type: 'video',
    fps: 30,
  });
}
// eslint-disable-next-line
async function saveMetadata(datasetId: string, metadata: DatasetMetaMutable) {
  return Promise.resolve();
}

export {
  readToBlob,
  getAttributes,
  getPipelineList,
  runPipeline,
  loadDetections,
  saveDetections,
  loadMetadata,
  saveMetadata,
};
