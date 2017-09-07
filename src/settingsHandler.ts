import { ipcMain } from 'electron';
import * as keyTar from 'keytar';

export class SettingsHandler {
    constructor() {
        ipcMain.on('settings-changed', (event, arg) => {
            keyTar.setPassword('GfycatAutoUploader', arg.userName, arg.password);
            // tslint:disable-next-line:no-console
            console.debug(`settings-changed: ${arg}`);

            let pass = keyTar.getPassword('GfycatAutoUploader', arg.userName)
            .then((pass) => {
                console.log(`set: ${arg.userName}:${pass}`);
            });
        });
    }
}
