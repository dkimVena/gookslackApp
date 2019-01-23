import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from 'react-router-dom';
import { connect } from 'react-redux';
import { UserActions } from 'store/actionCreators';
import App from 'components/App';
import Login from 'components/Auth/Login';
import Register from 'components/Auth/Register';
import Spinner from 'components/Spinner';
import firebase from 'lib/firebase';
import './index.scss';

class Root extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        UserActions.set_user(user);
        this.props.history.push('/');
      } else {
        this.props.history.push('/login');
        UserActions.clear_user();
      }
    });
  }
  render() {
    const { loading } = this.props;

    return loading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

export default withRouter(
  connect(({ user }) => {
    const { loading } = user;

    return {
      loading
    };
  })(Root)
);
