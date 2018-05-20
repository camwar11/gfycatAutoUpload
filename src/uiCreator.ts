import * as path from 'path';
import { GfycatClientWrapper } from './app/src/gfycatClientWrapper';
import { SettingsHandler } from './settingsHandler';
import * as Electron from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import { MenuItem } from 'react-bootstrap';


export class UICreator {

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  private _mainWindow: Electron.BrowserWindow;
  private _trayIcon: Electron.Tray;

  private static readonly isDevMode = process.execPath.match(/[\\/]electron/);

  constructor() {
    if (UICreator.isDevMode) {
      enableLiveReload({strategy: 'react-hmr'});
    }

    this.createTrayIcon();
  }

  private async createWindow(): Promise<void> {
    let self = this;
    // Create the browser window.
    this._mainWindow = new Electron.BrowserWindow({
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
      frame: false,
      icon: `${__dirname}/../images/tray-icon.png`
    });

    // and load the index.html of the app.
    this._mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    //if (isDevMode && (process.env.OPEN_DEV_TOOLS === 'true')) {
      await installExtension(REACT_DEVELOPER_TOOLS);
      this._mainWindow.webContents.openDevTools();
    //}

    // Emitted when the window is closed.
    this._mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      self._mainWindow = null;
    });

    // Stop pages from hi-jacking the title.
    this._mainWindow.on('page-title-updated', (event) => {
      event.preventDefault();
    });

    this._mainWindow.on('minimize', () => {
      self._mainWindow.hide();
    });

    return;
  }

  private createTrayIcon(): void {
    let self = this;
    this._trayIcon = new Electron.Tray(`${__dirname}/../images/tray-icon.png`);
    this._trayIcon.setToolTip('Gfycat Auto Uploader');
    this._trayIcon.on('click', () => self.openWindow(true));

    let menu = new Electron.Menu();
    menu.append(new Electron.MenuItem({label: 'Settings', click: self.handleSettingsClick.bind(self)}));
    menu.append(new Electron.MenuItem({label: 'Exit', click: () => {Electron.app.quit(); }}));

    this._trayIcon.setContextMenu(menu);
  }

  public openWindow(toggle: boolean): void {
    if (this._mainWindow) {
      if (this._mainWindow.isVisible() && toggle) {
        this._mainWindow.hide();
      } else {
        this._mainWindow.show();
      }
    } else {
      this.createWindow();
    }
  }

  private handleSettingsClick(menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.Event): void {
    this.openWindow(false);
  }
}
