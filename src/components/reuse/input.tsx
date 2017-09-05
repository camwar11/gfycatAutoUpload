import * as React from 'react';

export default class Input extends React.Component<{label: string, onChange?: (value: string) => void }, any> {
  constructor(props) {
    super(props);

    this.state = {value: ''};
  }

  render() {
    return (
      <div>
        <h4 className='list-group-item-heading'>{this.props.label}</h4>
        <input value={this.state.value} onChange={this.onInputChange.bind(this)}/>
      </div>
    );
  }

  onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      this.setState({value: event.target.value});
      if (this.state.onChange) {
        this.state.onChange(event.target.value);
      }
  }
}
