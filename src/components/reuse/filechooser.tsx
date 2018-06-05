import * as React from 'react';

interface InputProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  onDelete?: () => void;
  selectDirectory?: boolean;
}

export default class FileChooser extends React.Component<InputProps, any> {
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
    const hasValue = this.state && this.state.value;
    const displayText = hasValue ? this.state.value : 'Select a directory';
    const css = hasValue ? 'alert-success' : 'alert-warning';

    return (
      <div className={'container'}>
        <div className={`row alert ${css}`}>
          <div className={'col-xs-9'} onClick={this.openInput.bind(this)}>
            {displayText}
          </div>
          <div className={'col-xs-3'}>
            {hasValue ? this.renderDeleteButton() : <noscript />}
          </div>
        </div>
        <input style={{display: 'none'}} type='file' onChange={this.onInputChange.bind(this)} ref='newInput'/>
      </div>
    );
  }

  renderDeleteButton() {
    return <button className='btn btn-danger btn-block float-right' onClick={this.onDelete.bind(this)}>
      <span className='glyphicon glyphicon-trash'></span>&nbsp;Delete</button>;
  }

  openInput() {
    (this.refs.newInput as any).click();
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

  onDelete(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();

    if (this.props.onDelete) {
      this.props.onDelete();
    }
  }
}
