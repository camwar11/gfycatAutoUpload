import * as React from 'react';
import Input from './input';
import { default as List, Items } from './list';

export default class App extends React.Component {
  render() {
    let myList: Items<string> = {
      items: new Array<string>(),
      mapper: (item) => { return <Input label={item} />; }
    };

    myList.items.push('one');
    myList.items.push('two');
    myList.items.push('three');

    return (
      <div>
        <h2>Welcome to React!</h2>
        <List {...myList}/>
      </div>
    );
  }
}
