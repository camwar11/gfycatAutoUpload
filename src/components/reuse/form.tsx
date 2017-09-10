import * as React from 'react';
import Input from './input';

interface FormProps {
  userName?: string;
  handleSubmit?: (event: any) => void;
}

interface FormState {
  userName: string;
  password: string;
  paths?: string[];
}

export default class Form extends React.Component<FormProps, FormState> {
  constructor(props: FormProps) {
    super(props);

    this.state = {userName: props.userName ? props.userName : '', password: ''};
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
          <button type='submit' className='btn btn-default'>Submit</button>
        </form>
      </div>
    );
  }

  renderPathInputs() {
    if (!this.state.paths) {
      return (
        <div className='form-group'>
          <Input label='Watch Directory #1' type='file' onChange={(path) => this.updatePaths(0, path)} selectDirectory={true}/>;
        </div>
      );
    }

    const newIndex = this.state.paths.length + 1;

    return (
      <div className='form-group'>
        { this.state.paths.map((val, idx) => {
              return <Input key={idx} label={`Watch Directory #${idx + 1}`} type='file'
                onChange={(path) => this.updatePaths(idx, path)} selectDirectory={true}/>;
          })
        }

        <Input key={newIndex} label={`Watch Directory #${newIndex}`} type='file' onChange={(path) => this.updatePaths(newIndex, path)}
          selectDirectory={true}/>
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
