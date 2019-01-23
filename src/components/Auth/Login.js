import React, { Component } from 'react';

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

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  isFormValid = ({ email, password }) => email && password;

  handleInputError = (errors, inputName) => {
    return errors.some(err => err.message.toLowerCase().includes(inputName))
      ? 'error'
      : '';
  };

  handleSubmit = async e => {
    e.preventDefault();

    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password);
      } catch (err) {
        console.log(err);
        this.setState({
          errors: this.state.errors.concat(err),
          loading: false
        });
      }
    }
  };

  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="black" textAlign="center">
            <Icon name="comments" color="black" />
            Login to SlackChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
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
              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                fluid
                color="black"
                size="large"
              >
                Login
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
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
