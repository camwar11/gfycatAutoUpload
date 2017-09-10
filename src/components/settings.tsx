import * as console from 'console';
import Form from './reuse/form';
import Input from './reuse/input';
import { BreadCrumb } from './reuse/breadcrumb';
import { GET_USERNAME, GfycatClientSettingsFromRender, SETTINGS_CHANGED } from '../settingsHandler';
import * as React from 'react';
import { ipcRenderer } from 'electron';

export default class Settings extends React.Component<any, {userName: string}> {
  constructor(props: any) {
    super(props);

    this.state = {userName: this.getUsername()};
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
        <Form userName={this.state.userName} handleSubmit={this.handleSubmit.bind(this)} />
      </div>
    );
  }

  handleSubmit(event: GfycatClientSettingsFromRender) {
    //history.pushState('/', 'Home');
    ipcRenderer.send(SETTINGS_CHANGED, event);
    this.updateUserName(event.userName);
  }

  getUsername(): string {
    return ipcRenderer.sendSync(GET_USERNAME);
  }

  updateUserName(value: string) {
    this.setState((prev) => {
      return {...prev, userName: value};
    });
  }
}
