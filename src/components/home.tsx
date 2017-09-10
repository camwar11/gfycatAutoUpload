import * as React from 'react';
import { Link } from 'react-router-dom';
import { BreadCrumb, BreadCrumbItems } from './reuse/breadcrumb';

export default class Home extends React.Component {
  render() {
    const nav = [{active: true, route: '/', name: 'Home'}];

    return (
      <div className='container'>
        <BreadCrumb items={nav} />
        <h2>Welcome to Home!</h2>
        <Link className='text-xs-right btn btn-primary' to='/settings'>
          Settings
        </Link>
      </div>
    );
  }
}
