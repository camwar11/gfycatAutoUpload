import * as React from 'react';
import {Link} from 'react-router-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Image } from 'react-bootstrap';
import { IndexLinkContainer } from 'react-router-bootstrap';

export class GfycatUploaderNavBar extends React.Component<any, any> {
  private home: any;
  constructor(props: any) {
    super(props);
    this.state = {activeItem: 1};
  }

  render() {
    return (
      <Navbar inverse fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
              <Link to='/'>
                  <Image id='homeIcon' alt='GfycatUploader' src='../images/tray-icon.png' circle />
              </Link>
          </Navbar.Brand>
        </Navbar.Header>
        {this.renderNav()}
      </Navbar>
    );
  }

  renderNav() {
    return (
      <Nav bsStyle='pills' activeKey={this.state.activeItem} onSelect={this.handleItemChanged.bind(this)}>
        <IndexLinkContainer to='/'>
          <NavItem eventKey={1}>Home</NavItem>
        </IndexLinkContainer>
        <IndexLinkContainer to='/settings'>
          <NavItem eventKey={2}>Settings</NavItem>
        </IndexLinkContainer>
      </Nav>
    );
  }

  handleItemChanged(idx: number) {
    this.setState({activeItem: idx});
  }
}
