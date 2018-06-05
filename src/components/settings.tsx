import Form from './reuse/form';
import Input from './reuse/input';
import { BreadCrumb } from './reuse/breadcrumb';
import { GET_SETTINGS, GfycatClientSettingsFromRender, SETTINGS_CHANGED, SettingsBase } from '../settingsHandler';
import * as React from 'react';
import { ipcRenderer } from 'electron';

export default class Settings extends React.Component<any, {userName: string, apiId: string, paths: string[]}> {
  constructor(props: any) {
    super(props);

    this.state = this.getSavedSettings();
  }

  render() {
    return (
      <div className='container'>
        <h2>Settings</h2>
        <Form userName={this.state.userName} paths={this.state.paths} handleSubmit={this.handleSubmit.bind(this)} />
      </div>
    );
  }

  handleSubmit(event: GfycatClientSettingsFromRender) {
    //history.pushState('/', 'Home');
    ipcRenderer.send(SETTINGS_CHANGED, event);
    this.updateState({userName: event.userName, apiId: event.apiId, paths: event.paths});
  }

  getSavedSettings(): SettingsBase {
    let settings = ipcRenderer.sendSync(GET_SETTINGS);
    return settings ? settings : {userName: '', apiId: '', paths: []};
  }

  updateState(value: SettingsBase) {
    this.setState((prev) => {
      let newState = {...prev, userName: value.userName, apiId: value.apiId};
      newState = {...newState, paths: [...value.paths]};
      return newState;
    });
  }
}
