import Track, { TrackId } from '@/lib/track';
import { RectBounds } from '@/utils';
import { Ref } from '@vue/composition-api';

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

    processsSettings(){

    }

    selectTrack(trackId: TrackId | null, edit = false) {
      this.external.selectTrack(trackId, edit);
    }

    //Handles adding a new track with the NewTrack Settings
    addTrack() {
      if (this.processSettings('beforeAddTrack')) {
        this.external.selectTrack(
          this.external.addTrack(
            this.external.frame.value,
            this.defaultTrackType,
          ).trackId, true,
        );
        this.processSettings('afterAddTrack');
      }
    }

    trackTypeChange({ trackId, value }: { trackId: TrackId; value: string }) {
      this.external.getTrack(trackId).setType(value);
    }

    removeTrack(trackId: TrackId) {
      // if removed track was selected, unselect before remove
      if (this.external.selectedTrackId.value === trackId) {
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
