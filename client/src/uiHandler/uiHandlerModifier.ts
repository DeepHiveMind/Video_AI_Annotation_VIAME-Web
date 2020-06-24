/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RectBounds } from '@/utils';
import type UIHandler from './uiHandler';


export default abstract class UIHandlerModifier {
    subscriptions: Record<string, boolean>;

    name: string;

    constructor() {
      this.subscriptions = {};
      this.name = 'Abstract';
    }

    beforeaddTrack(uiHandler: UIHandler) {
      return true;
    }

    afteraddTrack(uiHandler: UIHandler, selectedTrackId: number) {

    }

    beforeselectTrack(uiHandler: UIHandler, trackId: number, editing: boolean) {
      return true;
    }

    afterselectTrack(uiHandler: UIHandler, trackId: number, editing: boolean) {

    }

    beforeupdateRectBounds(uiHandler: UIHandler, frameNumber: number, rectBounds: RectBounds) {
      return true;
    }

    afterupdateRectBounds(uiHandler: UIHandler, frameNumber: number, rectBounds: RectBounds) {
    }
}
