/* eslint-disable class-methods-use-this */
import BaseLayer, { LayerStyle, BaseLayerParams } from '@/components/layers/BaseLayer';
import { FrameDataTrack } from '@/components/layers/LayerTypes';
import Vue from 'vue';
import AnnotationMenu from './AnnotationMenu.vue';

interface HTMLData{
  trackId: number;
  selected: boolean;
  editing: boolean;
  confidencePairs: [string, number] | null;
  keyframe?: boolean;
  position?: {x: number; y: number};
}

/**
 * Idea is that this Canvas Layer is used to improved editing of annnotations, as well as provide
 * An area for displaying a context menu for selected annotations.
 */
export default class HTMLLayer extends BaseLayer<HTMLData> {
  htmlLayer: Record<string, any>;

  props: Record<string, any>;

  constructor(params: BaseLayerParams) {
    super(params);
    this.featureLayer = this.annotator.geoViewer.createLayer('ui', { zIndex: 3 });
    this.htmlLayer = this.featureLayer.createWidget('dom', { position: { x: 0, y: 0 } });
    const htmlPosition = this.htmlLayer.position;
    this.htmlLayer.position = (pos, actualValue) => {
      let subpos = pos;
      if (pos === undefined && !actualValue) {
        subpos = this.annotator.geoViewer.gcsToDisplay(htmlPosition(undefined, true));
        return {
          left: subpos.x,
          top: null,
          right: null,
          bottom: this.annotator.geoViewer.size().height - subpos.y,
        };
      }
      return htmlPosition.call(this.htmlLayer, pos, actualValue);
    };

    this.htmlLayer.canvas().id = 'annotationMenu';
    this.props = {
      keyframe: false,
      position: { x: 0, y: 0 },
    };

    const ComponentClass = Vue.extend(AnnotationMenu);

    const propsRef = this.props;
    const instance = new ComponentClass({
      data() {
        return propsRef;
      },
    });

    instance.$mount();
    document.getElementById('annotationMenu').appendChild(instance.$el);

    this.initialize();
  }

  initialize() {
    super.initialize();
  }

  formatData(frameData: FrameDataTrack[]) {
    const arr: RectGeoJSData[] = [];
    frameData.forEach((track: FrameDataTrack) => {
      if (track.features && track.features.bounds) {
        console.log(track.features.bounds);
        const annotation: HTMLData = {
          trackId: track.trackId,
          selected: track.selected,
          editing: track.editing,
          confidencePairs: track.confidencePairs,
          keyframe: track.features.keyframe,
          position: ({
            x: track.features.bounds[1],
            y: track.features.bounds[2],
          }),
        };
        arr.push(annotation);
      }
    });
    return arr;
  }

  redraw() {
    this.updateElementPos(this.formattedData[0]);
  }

  updateElementPos(frameData: HTMLData) {
    //Lets take the props ref and place the menu
    console.log(`x: ${frameData.position?.x} y:${frameData.position.y}`);
    this.props.keyframe = frameData.keyframe;
    this.props.position = frameData.position;
  }

  createStyle(): LayerStyle<HTMLData> {
    return {
      ...super.createStyle(),
      // Style conversion to get array objects to work in geoJS
      position: (point) => ({ x: point[0], y: point[1] }),
      strokeColor: (_point, _index, data) => {
        if (data.selected) {
          return this.stateStyling.selected.color;
        }
        if (data.confidencePairs) {
          return this.typeStyling.value.color(data.confidencePairs[0]);
        }
        return this.typeStyling.value.color('');
      },
      fill: (data) => {
        if (data.confidencePairs) {
          return this.typeStyling.value.fill(data.confidencePairs[0]);
        }
        return this.stateStyling.standard.fill;
      },
      fillColor: (_point, _index, data) => {
        if (data.confidencePairs) {
          return this.typeStyling.value.color(data.confidencePairs[0]);
        }
        return this.typeStyling.value.color('');
      },
      fillOpacity: (_point, _index, data) => {
        if (data.confidencePairs) {
          return this.typeStyling.value.opacity(data.confidencePairs[0]);
        }
        return this.stateStyling.standard.opacity;
      },
      strokeOpacity: (_point, _index, data) => {
        if (data.selected) {
          return this.stateStyling.selected.opacity;
        }
        if (data.confidencePairs) {
          return this.typeStyling.value.opacity(data.confidencePairs[0]);
        }

        return this.stateStyling.standard.opacity;
      },
      strokeOffset: (_point, _index, data) => {
        if (data.selected) {
          return this.stateStyling.selected.strokeWidth;
        }
        if (data.confidencePairs) {
          return this.typeStyling.value.strokeWidth(data.confidencePairs[0]);
        }
        return this.stateStyling.standard.strokeWidth;
      },
      strokeWidth: (_point, _index, data) => {
        if (data.selected) {
          return this.stateStyling.selected.strokeWidth;
        }
        if (data.confidencePairs) {
          return this.typeStyling.value.strokeWidth(data.confidencePairs[0]);
        }
        return this.stateStyling.standard.strokeWidth;
      },
    };
  }
}