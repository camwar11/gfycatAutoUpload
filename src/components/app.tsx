import { GfycatUploaderNavBar } from './reuse/navBar';
import Settings from './settings';
import * as React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Home from './home';
import { Redirect } from 'react-router';

export default class App extends React.Component {
  render() {
    return (
        <BrowserRouter>
          <div className='container'>
            <GfycatUploaderNavBar />
            <Redirect from='/index.html' to='/' />
            <Switch>
              <Route path='/settings' component={Settings} />
              <Route path='/' component={Home} />
            </Switch>
          </div>
        </BrowserRouter>
    );
  }
}
