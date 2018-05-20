import * as path from 'path';
import { GfycatClientWrapper } from './app/src/gfycatClientWrapper';
import { SettingsHandler } from './settingsHandler';
import * as Electron from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import { MenuItem } from 'react-bootstrap';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow;
let icon;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
  enableLiveReload({strategy: 'react-hmr'});
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new Electron.BrowserWindow({
    width: 900,
    height: 700,
    resizable: true,
    title: 'GfycatAutoUploader',
    modal: true,
    autoHideMenuBar: true,
    center: true,
    titleBarStyle: 'hidden',
    darkTheme: true,
    backgroundColor: '#37393d',
    frame: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode && (process.env.OPEN_DEV_TOOLS === 'true')) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Stop pages from hi-jacking the title.
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  mainWindow.on('minimize', () => {
    mainWindow.hide();
  });
};

const createTrayIcon = () => {
  icon = new Electron.Tray(`${__dirname}/../images/tray-icon.png`);
  icon.setToolTip('Gfycat Auto Uploader');
  icon.on('click', () => {
    if (mainWindow != null) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      createWindow();
    }
  });

  let menu = new Electron.Menu();
  menu.append(new Electron.MenuItem({label: 'Settings', click: handleSettingsClick}));
  menu.append(new Electron.MenuItem({label: 'Exit', click: () => {Electron.app.quit(); }}));

  icon.setContextMenu(menu);
};

const handleSettingsClick = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.Event) => {
  createWindow();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
Electron.app.on('ready', () => {
  createTrayIcon();

  Electron.app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
    args: [
      '--minimized'
    ]
  });

  return createWindow();
});

// We don't want to quit when all windows are closed, since the app is still running
// in the tray. This needs to stay here and do nothing or else Electron kills the app.
Electron.app.on('window-all-closed', () => {
  // do nothing
 });

Electron.app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const settingsHandler = new SettingsHandler();
const wrapper = new GfycatClientWrapper(settingsHandler.getSettings());
settingsHandler.subscribeToSettingsChanged((val) => wrapper.updateSettings(val));
wrapper.start();
