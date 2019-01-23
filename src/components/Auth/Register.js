import React, { Component } from 'react';

import md5 from 'md5';
import { Link } from 'react-router-dom';
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react';
import firebase from 'lib/firebase';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    let result = true;
    if (password.length < 6) result = false;
    else if (password !== passwordConfirmation) result = false;
    return result;
  };

  isFormValid = () => {
    let errors = [];
    let error;
    let result = true;

    if (this.isFormEmpty(this.state)) {
      error = { message: 'Fill in all fields' };
      this.setState({ errors: errors.concat(error) });
      result = false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: 'Password is invalid' };
      this.setState({ errors: errors.concat(error) });
      result = false;
    }
    return result;
  };

  handleInputError = (errors, inputName) => {
    return errors.some(err => err.message.toLowerCase().includes(inputName))
      ? 'error'
      : '';
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };
  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ errors: [], loading: true });

    if (this.isFormValid()) {
      let createdUser;
      try {
        createdUser = await firebase
          .auth()
          .createUserWithEmailAndPassword(
            this.state.email,
            this.state.password
          );
      } catch (error) {
        console.log(error);
        this.setState({
          errors: this.state.errors.concat(error),
          loading: false
        });
      }

      try {
        console.log(createdUser);
        await createdUser.user.updateProfile({
          displayName: this.state.username,
          photoURL: `http://gravatar.com/avatar/${md5(
            createdUser.user.email
          )}?d=identicon`
        });
        try {
          await this.saveUser(createdUser);
          console.log('user saved');
          this.setState({ loading: false });
        } catch (error) {
          console.log(error);
          this.setState({
            errors: this.state.errors.concat(error),
            loading: false
          });
        }
      } catch (error) {
        console.log(error);
        this.setState({
          errors: this.state.errors.concat(error),
          loading: false
        });
      }
    }
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="black" textAlign="center">
            <Icon name="comments" color="black" />
            Register for SlackChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                value={username}
                type="text"
              />
              <Form.Input
                fluid
                name="email"
                className={this.handleInputError(errors, 'email')}
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                type="email"
              />
              <Form.Input
                fluid
                name="password"
                className={this.handleInputError(errors, 'password')}
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                type="password"
              />
              <Form.Input
                fluid
                name="passwordConfirmation"
                className={this.handleInputError(errors, 'password')}
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                value={passwordConfirmation}
                type="password"
              />
              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                fluid
                color="black"
                size="large"
              >
                Register
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Errors</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
