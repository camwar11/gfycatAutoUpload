var watchr = require('watchr');
export class FileWatcher {
    private _stalker: any;

    constructor(private _dir: string, private _onCreateHandler: (path: string) => void) {
        this._stalker = watchr.open(_dir, (changeType: any, fullPath: string, currentStat: any, previousStat: any) =>
                this.listener(changeType, fullPath, currentStat, previousStat, _onCreateHandler),
            (err: any) => this.next(err, _dir));
    }

    public dispose() {
        this._stalker.close();
    }

    private listener (changeType: any, fullPath: string, currentStat: any, previousStat: any, onCreateHandler: (path: string) => void) {
        switch ( changeType ) {
            case 'create':
                console.log('the file', fullPath, 'was created', currentStat);
                onCreateHandler(fullPath);
                break;
        }
    }
    private next (err: any, dir: string) {
        if ( err )  {
            return console.log('watch failed on', dir, 'with error', err);
        }
        console.log('watch successful on', dir);
    }
}
