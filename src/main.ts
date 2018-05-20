import { GfycatClientWrapper } from './app/src/gfycatClientWrapper';
import { SettingsHandler } from './settingsHandler';
import * as Electron from 'electron';
import { UICreator } from './uiCreator';

let uiCreator: UICreator;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
Electron.app.on('ready', () => {
  Electron.app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
    args: [
      '--minimized'
    ]
  });

  uiCreator = new UICreator();
});

// We don't want to quit when all windows are closed, since the app is still running
// in the tray. This needs to stay here and do nothing or else Electron kills the app.
Electron.app.on('window-all-closed', () => {
  // do nothing
 });

Electron.app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  uiCreator.openWindow(false);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const settingsHandler = new SettingsHandler();
const wrapper = new GfycatClientWrapper(settingsHandler.getSettings());
settingsHandler.subscribeToSettingsChanged((val) => wrapper.updateSettings(val));
wrapper.start();
