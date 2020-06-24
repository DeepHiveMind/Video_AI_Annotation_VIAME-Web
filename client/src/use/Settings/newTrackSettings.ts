import {
  reactive, ref,
} from '@vue/composition-api';
import UIHandlerModifier from '@/uiHandler/uiHandlerModifier';
import UIHandler from '@/uiHandler/uiHandler';
import { RectBounds } from '@/utils';

export interface NewTrackSettings {
    mode: string;
    type: string;
    modeSettings: {
      Track: {
        autoAdvanceFrame: boolean;
      };
      Detection: {
        continuous: boolean;
      };
    };
  }

class NewTrackSettingsHandler extends UIHandlerModifier {
  newTrack = false;

  newDetection = false;

  settings: NewTrackSettings;

  constructor(settings: NewTrackSettings) {
    super();
    this.settings = settings;
    this.name = 'newTrackSettings';
    this.subscriptions = {
      beforeaddTrack: true,
      beforeselectTrack: true,
      beforeupdateRectBounds: true,
      afterupdateRectBounds: true,
    };
  }

  beforeaddTrack(uiHandler: UIHandler) {
    this.newTrack = true;
    if (this.settings.type) {
      // eslint-disable-next-line no-param-reassign
      uiHandler.defaultTrackType = this.settings.type;
    }
    return true;
  }

  beforeselectTrack(uiHandler: UIHandler, selectedTrackId: number, editing: boolean) {
    if (this.newTrack && !editing) {
      this.newTrack = false;
    }
    return true;
  }

  beforeupdateRectBounds(uiHandler: UIHandler, frameNumber: number, _rect: RectBounds) {
    if (uiHandler.external.selectedTrackId.value !== null) {
      const track = uiHandler.external.trackMap.get(uiHandler.external.selectedTrackId.value);
      if (track) {
        const features = track.getFeature(frameNumber);
        if (!features || features.bounds === undefined) {
          //We are creating a brand new track and should apply the newTrackSettings
          this.newDetection = true;
        }
      }
    }
    return true;
  }

  afterupdateRectBounds(uiHandler: UIHandler, _frameNumber: number, _rect: RectBounds) {
    if (this.newTrack && this.settings !== null) {
      if (this.settings.mode === 'Track' && this.settings.modeSettings.Track.autoAdvanceFrame) {
        uiHandler.external.playbackComponent.value.nextFrame();
      } else if (this.settings.mode === 'Detection') {
        if (this.settings.modeSettings.Detection.continuous) {
          uiHandler.addTrack();
        } else { //Stop editing the new Track
          uiHandler.selectTrack(uiHandler.external.selectedTrackId.value, false);
        }
      }
    }
  }
}

interface UseParams {
  saveSettings: (_name: string, _json: string) => void;
  loadSettings: (_name: string) => NewTrackSettings|null;
}

export default function useNewTrackSettings({ saveSettings, loadSettings }: UseParams) {
  const newTrackSettings = reactive({
    mode: ref('Track'),
    type: ref('unknown'),
    modeSettings: {
      Track: {
        autoAdvanceFrame: ref(false),
      },
      Detection: {
        continuous: ref(true),
      },
    },
  });


  function updateNewTrackSettings(updatedNewTrackSettings: NewTrackSettings) {
    newTrackSettings.mode = updatedNewTrackSettings.mode;
    newTrackSettings.type = updatedNewTrackSettings.type;
    // eslint-disable-next-line max-len
    newTrackSettings.modeSettings.Track.autoAdvanceFrame = updatedNewTrackSettings.modeSettings.Track.autoAdvanceFrame;
    // eslint-disable-next-line max-len
    newTrackSettings.modeSettings.Detection.continuous = updatedNewTrackSettings.modeSettings.Detection.continuous;

    //Handle Saving of the data
    saveSettings('newTrackSettings', JSON.stringify(newTrackSettings));
  }

  const defaultVals = loadSettings('newTrackSettings');
  if (defaultVals) {
    updateNewTrackSettings(defaultVals);
  }

  const newTrackHandler = new NewTrackSettingsHandler(newTrackSettings);

  return { settings: newTrackSettings, update: updateNewTrackSettings, handler: newTrackHandler };
}
