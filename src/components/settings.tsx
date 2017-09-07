import * as console from 'console';
import Form from './reuse/form';
import Input from './reuse/input';
import { BreadCrumb } from './reuse/breadcrumb';
import * as React from 'react';
import { ipcRenderer } from 'electron';

export default class Settings extends React.Component {
  render() {
    const nav = [
      {active: false, route: '/', name: 'Home'},
      {active: true, route: '/settings', name: 'Settings'}
    ];
    return (
      <div className='container'>
        <BreadCrumb items={nav} />
        <h2>Welcome to Settings!</h2>
        <Form handleSubmit={this.handleSubmit.bind(this)} />
      </div>
    );
  }

  handleSubmit(event: any) {
    console.log(`settings: ${event}`);
    //history.pushState('/', 'Home');
    ipcRenderer.send('settings-changed', event);
  }
}
