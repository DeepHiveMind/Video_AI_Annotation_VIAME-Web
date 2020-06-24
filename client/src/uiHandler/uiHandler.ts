import Track, { TrackId } from '@/lib/track';
import { RectBounds } from '@/utils';
import { Ref } from '@vue/composition-api';
import uiHandlers from './uiHandlerDecorator';

export interface Seeker {
    seek(frame: number): void;
    nextFrame(): void;
  }

  interface ExternalReferences {
    selectedTrackId: Ref<TrackId | null>;
    editingTrack: Ref<boolean>;
    frame: Ref<number>;
    trackMap: Map<TrackId, Track>;
    playbackComponent: Ref<Seeker>;
    selectTrack: (trackId: TrackId | null, edit: boolean) => void;
    getTrack: (trackId: TrackId) => Track;
    selectNextTrack: (delta?: number) => TrackId | null;
    addTrack: (frame: number, defaultType: string) => Track;
    removeTrack: (trackId: TrackId) => void;
  }

export default class UIHandler {
    external: ExternalReferences;

    defaultTrackType: string;


    constructor({
      selectedTrackId,
      editingTrack,
      frame,
      trackMap,
      playbackComponent,
      selectTrack,
      getTrack,
      selectNextTrack,
      addTrack,
      removeTrack,
    }: {
          selectedTrackId: Ref<TrackId | null>;
          editingTrack: Ref<boolean>;
          frame: Ref<number>;
          trackMap: Map<TrackId, Track>;
          playbackComponent: Ref<Seeker>;
          selectTrack: (trackId: TrackId | null, edit: boolean) => void;
          getTrack: (trackId: TrackId) => Track;
          selectNextTrack: (delta?: number) => TrackId | null;
          addTrack: (frame: number, defaultType: string) => Track;
          removeTrack: (trackId: TrackId) => void;
      }) {
      this.external = {
        selectedTrackId,
        editingTrack,
        frame,
        trackMap,
        playbackComponent,
        selectTrack,
        getTrack,
        selectNextTrack,
        addTrack,
        removeTrack,
      };
      this.defaultTrackType = 'unknown';
    }

    @uiHandlers.uiHandlerDecorator()
    selectTrack(trackId: TrackId | null, edit = false) {
      this.external.selectTrack(trackId, edit);
    }

    @uiHandlers.uiHandlerDecorator()
    addTrack() {
      this.external.selectTrack(
        this.external.addTrack(
          this.external.frame.value,
          this.defaultTrackType,
        ).trackId, true,
      );
    }

    trackTypeChange({ trackId, value }: { trackId: TrackId; value: string }) {
      this.external.getTrack(trackId).setType(value);
    }

    @uiHandlers.uiHandlerDecorator()
    updateRectBounds(frameNum: number, bounds: RectBounds) {
      if (this.external.selectedTrackId.value !== null) {
        const track = this.external.trackMap.get(this.external.selectedTrackId.value);
        if (track) {
          track.setFeature({
            frame: frameNum,
            bounds,
          });
        }
      }
    }

    removeTrack(trackId: TrackId) {
      // if removed track was selected, unselect before remove
      if (this.external.selectedTrackId.value === trackId) {
        // eslint-disable-next-line max-len
        const newTrack = this.external.selectNextTrack(1) !== null ? this.external.selectNextTrack(1) : this.external.selectNextTrack(-1);
        if (newTrack !== null) {
          this.external.selectTrack(newTrack, false);
        }
      }
      this.external.removeTrack(trackId);
    }

    trackEdit(trackId: TrackId) {
      const track = this.external.getTrack(trackId);
      this.external.playbackComponent.value.seek(track.begin);
      this.external.selectTrack(trackId, true);
    }

    trackClick(trackId: TrackId) {
      const track = this.external.getTrack(trackId);
      this.external.playbackComponent.value.seek(track.begin);
      this.external.selectTrack(trackId, this.external.editingTrack.value);
    }

    selectNext(delta: number) {
      const newTrack = this.external.selectNextTrack(delta);
      if (newTrack !== null) {
        this.external.selectTrack(newTrack, false);
        const track = this.external.getTrack(newTrack);
        this.external.playbackComponent.value.seek(track.begin);
      }
    }
}
