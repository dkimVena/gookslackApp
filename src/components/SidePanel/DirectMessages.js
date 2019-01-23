import React, { Component } from 'react';

import firebase from 'lib/firebase';
import { Menu, Icon } from 'semantic-ui-react';

import { ChannelActions } from 'store/actionCreators';

class DirectMessages extends Component {
  state = {
    users: [],
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence'),
    activeChannel: ''
  };

  componentDidMount() {
    if (this.props.currentUser) {
      this.addListeners(this.props.currentUser.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.connectedRef.off();
    this.state.presenceRef.off();
  };

  addListeners = currentUserUid => {
    let loadedUsers = [];
    this.state.usersRef.on('child_added', snap => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });

    this.state.presenceRef.on('child_added', snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUsers(snap.key);
      }
    });

    this.state.presenceRef.on('child_removed', snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUsers(snap.key, false);
      }
    });
  };

  addStatusToUsers = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user['status'] = connected ? 'online' : 'offline';
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = user => user && user.status === 'online';

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };
    ChannelActions.set_current_channel(channelData);
    ChannelActions.set_private_channel(true);
    this.setActiveChannel(user.uid);
  };

  setActiveChannel = userId => {
    this.setState({ activeChannel: userId });
  };

  getChannelId = userUid => {
    const currentUserUid = this.props.currentUser.uid;
    return userUid < currentUserUid
      ? `${userUid}/${currentUserUid}`
      : `${currentUserUid}/${userUid}`;
  };

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> Direct Messages
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            styles={{ opacity: 0.7, fontStyle: 'italic' }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? 'green' : 'red'}
            />{' '}
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default DirectMessages;
