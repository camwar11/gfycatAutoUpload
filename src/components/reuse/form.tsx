import FileChooser from './filechooser';
import * as React from 'react';
import Input from './input';
import * as _ from 'lodash';

interface FormProps {
  userName?: string;
  handleSubmit?: (event: any) => void;
  paths?: string[];
}

interface FormState {
  userName: string;
  password: string;
  paths?: string[];
}

export default class Form extends React.Component<FormProps, FormState> {
  constructor(props: FormProps) {
    super(props);

    this.state = {
      userName: props.userName ? props.userName : '',
      password: '',
      paths: props.paths ? props.paths : []};
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <div className='form-group'>
            <Input label='User Name:' type='input' value={this.state.userName} onChange={this.updateUserName.bind(this)}/>
          </div>
          <div className='form-group'>
            <Input label='Password:' type='password' onChange={this.updatePassword.bind(this)}/>
          </div>
          {this.renderPathInputs()}
          <button type='submit' className='btn btn-success'>Save</button>
        </form>
      </div>
    );
  }

  renderPathInputs() {
    if (!this.state.paths) {
      return (
        <div className='form-group'>
          <FileChooser key={0} label='Watch Directory #1' onChange={(path) => this.updatePaths(0, path)} selectDirectory={true}
            onDelete={() => this.deletePath(0)}/>;
        </div>
      );
    }

    const newIndex = this.state.paths.length;

    return (
      <div className='form-group'>
        { this.state.paths.map((val, idx) => {
              return <FileChooser key={idx} label={`Watch Directory #${idx + 1}`}
                onChange={(path) => this.updatePaths(idx, path)} selectDirectory={true} value={val}
                onDelete={() => this.deletePath(idx)}/>;
          })
        }

        <FileChooser key={newIndex} label={`Watch Directory #${newIndex + 1}`} onChange={(path) => this.updatePaths(newIndex, path)}
          selectDirectory={true} onDelete={() => this.deletePath(newIndex)}/>
      </div>
    );
  }

  updateUserName(value: string) {
    this.setState((prev) => {
      return {...prev, userName: value};
    });
  }

  updatePassword(value: string) {
    this.setState((prev) => {
      return {...prev, password: value};
    });
  }

  deletePath(index: number) {
    this.setState((prev) => {
      return {...prev,
        paths: _.filter(prev.paths, (value, idx) => {
          return index !== idx;
      })};
    });
  }

  updatePaths(index: number, newValue: string) {
    this.setState((prev) => {
      if (!this.state.paths) {
        return {...prev, paths: [newValue]};
      }

      const newPaths = this.state.paths.map((val, idx) => {
        if (idx === index) {
          return newValue;
        }
        return val;
      });

      if (index >= newPaths.length - 1) {
        newPaths.push(newValue);
      }

      return {...prev, paths: newPaths};
    });
  }

  onSubmit(event: any) {
    event.preventDefault();
      if (this.props.handleSubmit) {
        console.log(`form: ${event.toString()}`);
        this.props.handleSubmit({userName: this.state.userName, password: this.state.password, paths: this.state.paths});
      }
  }
}
