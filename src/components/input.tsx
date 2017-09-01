import * as React from 'react';

export default class Input extends React.Component<{label: string}, any> {
  constructor(props) {
    super(props);

    this.state = {value: ''};
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input value={this.state.value} onChange={this.onInputChange}/>
      </div>
    );
  }

  onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({value: event.target.value});
  }
}
