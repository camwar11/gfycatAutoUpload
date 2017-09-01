import * as React from 'react';

export interface Items<T> {
  items: T[];
  keyfinder?(item: T): string;
  mapper?(item: T): any;
}

export default class List<T> extends React.Component<Items<T>, any> {
  private static readonly noMapping = (item: any) => { return item; };

  constructor(props: Items<T>) {
    super(props);
  }

  render() {
    let mapper = this.props.mapper;
    let keyfinder = this.props.keyfinder;

    if (mapper === undefined) {
      mapper = List.noMapping;
    }
    if (keyfinder === undefined) {
      keyfinder = List.noMapping;
    }
    const mapped = this.props.items.map((value) => {
      return <li key={keyfinder(value)}>{mapper(value)}</li>;
    });

    return (
      <div>
          <ul>
            {mapped}
          </ul>
      </div>
    );
  }
}
