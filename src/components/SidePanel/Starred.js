import React, { Component } from 'react';

import firebase from 'lib/firebase';
import { ChannelActions } from 'store/actionCreators';
import { Menu, Icon } from 'semantic-ui-react';

class Starred extends Component {
  state = {
    usersRef: firebase.database().ref('users'),
    starredChannels: [],
    activeChannel: ''
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.child(`${this.props.currentUser.uid}/starred`).off();
  };

  addListeners = () => {
    this.state.usersRef
      .child(this.props.currentUser.uid)
      .child('starred')
      .on('child_added', snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });
    this.state.usersRef
      .child(this.props.currentUser.uid)
      .child('starred')
      .on('child_removed', snap => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(channel => {
          return channel.id !== channelToRemove.id;
        });
        this.setState({ starredChannels: filteredChannels });
      });
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    ChannelActions.set_current_channel(channel);
    ChannelActions.set_private_channel(false);
  };

  displayChannels = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ));

  render() {
    const { starredChannels } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{' '}
          ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

export default Starred;
