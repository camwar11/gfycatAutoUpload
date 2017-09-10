import Form from './reuse/form';
import Input from './reuse/input';
import { BreadCrumb } from './reuse/breadcrumb';
import { GET_SETTINGS, GfycatClientSettingsFromRender, SETTINGS_CHANGED, SettingsBase } from '../settingsHandler';
import * as React from 'react';
import { ipcRenderer } from 'electron';

export default class Settings extends React.Component<any, {userName: string, paths: string[]}> {
  constructor(props: any) {
    super(props);

    this.state = this.getSavedSettings();
  }

  render() {
    const nav = [
      {active: false, route: '/', name: 'Home'},
      {active: true, route: '/settings', name: 'Settings'}
    ];

    return (
      <div className='container'>
        <BreadCrumb items={nav} />
        <h2>Welcome to Settings!</h2>
        <Form userName={this.state.userName} paths={this.state.paths} handleSubmit={this.handleSubmit.bind(this)} />
      </div>
    );
  }

  handleSubmit(event: GfycatClientSettingsFromRender) {
    //history.pushState('/', 'Home');
    ipcRenderer.send(SETTINGS_CHANGED, event);
    this.updateState({userName: event.userName, paths: event.paths});
  }

  getSavedSettings(): SettingsBase {
    return ipcRenderer.sendSync(GET_SETTINGS);
  }

  updateState(value: SettingsBase) {
    this.setState((prev) => {
      let newState = {...prev, userName: value.userName};
      newState = {...newState, paths: [...value.paths]};
      return newState;
    });
  }
}
