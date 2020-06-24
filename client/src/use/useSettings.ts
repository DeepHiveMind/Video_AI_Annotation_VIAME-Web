import uiHandlers from '@/uiHandler/uiHandlerDecorator';
import useNewTrackSettings from './Settings/newTrackSettings';


export default function useSettings() {
  function saveSettings(name: string, settingsJSON: string) {
    //Get all settings
    const Settings: Record<string, string> = {};
    Settings[name] = JSON.parse(settingsJSON);
    localStorage.setItem('Settings', JSON.stringify(Settings));
  }

  //Load default settings initially
  function loadSettings(name: string) {
    const storedSettings = localStorage.getItem('Settings');
    if (storedSettings) {
      const defaultSettings = JSON.parse(storedSettings);
      return defaultSettings[name];
    }
    return null;
  }

  const newTrackSettings = useNewTrackSettings({ saveSettings, loadSettings });
  uiHandlers.addModifier(newTrackSettings.handler);

  return { newTrackSettings };
}
