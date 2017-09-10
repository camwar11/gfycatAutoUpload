import * as React from 'react';
import {Link} from 'react-router-dom';
import {Breadcrumb, BreadcrumbItem} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export interface BreadCrumbItems {
  [key: string]: any;
  items: BreadCrumbItem[];
}

export interface BreadCrumbItem {
  active: boolean;
  route: string;
  name: string;
}

export class BreadCrumb extends React.Component<BreadCrumbItems, any> {

  render_old() {
    if (!this.props.items) {
        return <noscript />;
    }

    return (
      <nav className='breadcrumb'>
        {this.props.items.map(val => {
          if (val.active) {
            return (
              <span key={val.name} className='breadcrumb-item active'>
                <button className='btn btn-primary btn-sm disabled' style={{boxShadow: '0 0 0 2px rgba(2,117,216,.5)'}}>
                  {val.name}
                </button>
              </span>
            );
          } else {
            return (
              <span key={val.name} className='breadcrumb-item'>
                <Link className='btn btn-primary btn-sm' to={val.route}>
                  {val.name}
                </Link>
              </span>
            );
          }
        }) }
      </nav>
    );
  }

  render() {
    if (!this.props.items) {
      return <noscript />;
    }
    return (
      <Breadcrumb>
        {this.props.items.map(val => {
          return (
            <LinkContainer key={val.name} to={val.route}>
              <BreadcrumbItem active={val.active} title={val.name}>
                {val.name}
              </BreadcrumbItem>
            </LinkContainer>);
        }) }
      </Breadcrumb>
    );
  }
}
