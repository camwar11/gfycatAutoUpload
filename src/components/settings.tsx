import Form from './reuse/form';
import Input from './reuse/input';
import { BreadCrumb } from './reuse/breadcrumb';
import { GET_SETTINGS, GfycatClientSettingsFromRender, SETTINGS_CHANGED, RETURN_SETTINGS } from '../settingsHandler';
import * as React from 'react';
import { ipcRenderer } from 'electron';

export default class Settings extends React.Component<any, GfycatClientSettingsFromRender> {
  _defaultSettings: GfycatClientSettingsFromRender = {userName: '', apiId: '', password: '', apiSecret: '', paths: []};

  constructor(props: any) {
    super(props);

    this.state = this._defaultSettings;

    ipcRenderer.on(RETURN_SETTINGS, (event: any, args: GfycatClientSettingsFromRender) => {
      this.updateState(args);
    });
  }

  render() {
    return (
      <div className='container'>
        <h2>Settings</h2>
        <Form userName={this.state.userName} paths={this.state.paths} apiId={this.state.apiId} password={this.state.password}
          apiSecret={this.state.apiSecret} handleSubmit={this.handleSubmit.bind(this)} />
      </div>
    );
  }

  componentDidMount() {
    this.getSavedSettings();
  }

  handleSubmit(event: GfycatClientSettingsFromRender) {
    //history.pushState('/', 'Home');
    ipcRenderer.send(SETTINGS_CHANGED, event);
    this.updateState({...event, password: this.state.password, apiSecret: this.state.apiSecret});
  }

  getSavedSettings() {
    ipcRenderer.send(GET_SETTINGS);
  }

  updateState(value: GfycatClientSettingsFromRender) {
    this.setState((prev) => {
      let newState = {...prev, ...value};
      newState = {...newState, paths: [...value.paths]};
      return newState;
    });
  }
}
