import { BreadCrumb } from './reuse/breadcrumb';
import * as React from 'react';

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
      </div>
    );
  }
}
