import UIHandler from './UIHandler';

export default class NewTrackSettingsHandler {
    newTrack: boolean;
    newDetection: boolean;
    subscribers: [string];
    uiHandler: UIHandler;

    constructor(){
        this.newTrack = false,
        this.newDetection = false,
        this.subscribers=['beforeAddTrack','afterAddTrack', before]
    }
}