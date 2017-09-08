import * as React from 'react';
import Input from './input';

export default class Form extends React.Component<{userName?: string, handleSubmit?: (event: any) => void }, any> {
  constructor(props) {
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
          <button type='submit' className='btn btn-default'>Submit</button>
        </form>
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

  onSubmit(event) {
    event.preventDefault();
      if (this.props.handleSubmit) {
        console.log(`form: ${event.toString()}`);
        this.props.handleSubmit({userName: this.state.userName, password: this.state.password});
      }
  }
}
