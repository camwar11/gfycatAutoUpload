import * as React from 'react';

interface InputProps {
  label: string;
  type: string;
  value?: string;
  onChange?: (value: string) => void;
  selectDirectory?: boolean;
}

export default class Input extends React.Component<InputProps, any> {
  constructor(props: InputProps) {
    super(props);

    this.state = {value: props.value ? props.value : ''};
  }

  componentDidMount() {
    if (this.props.selectDirectory) {
      (this.refs.newInput as any).webkitdirectory = true;
    }
  }

  render() {
    return (
      <div className='form-group row'>
        <label className='col-form-label col-xs-2'>{this.props.label}</label>
        <div className='col-xs-10'>
          <input className='form-control' type={this.props.type} value={this.state.value}
            onChange={this.onInputChange.bind(this)} ref='newInput'/>
        </div>
      </div>
    );
  }

  onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      let value = event.target.value;

      if (event.target.files && event.target.files.length > 0) {
        value = event.target.files[0].path;
      }


      this.setState({value: value});
      if (this.props.onChange) {
        this.props.onChange(value);
      }
  }
}
