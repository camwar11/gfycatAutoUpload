import * as React from 'react';
import Input from './input';

export default class Form extends React.Component<{handleSubmit?: (event: any) => void }, any> {
  constructor(props) {
    super(props);

    this.state = {userName: '', password: ''};
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit.bind(this)}>
          <div className='form-group'>
            <Input label='User Name:' type='input' onChange={this.updateUserName.bind(this)}/>
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
      console.log(`userName: ${value}`);
      return {...prev, userName: value};
    });
  }

  updatePassword(value: string) {
    this.setState((prev) => {
      console.log(`password: ${value}`);
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
