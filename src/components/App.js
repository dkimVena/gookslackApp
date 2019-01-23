import React, { Component } from 'react';

import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel';
import SidePanel from './SidePanel';
import Messages from './Messages';
import MetaPanel from './MetaPanel';

class App extends Component {
  render() {
    const {
      currentUser,
      currentChannel,
      isPrivateChannel,
      userPosts,
      primaryColor,
      secondaryColor
    } = this.props;

    return (
      <Grid
        columns="equal"
        className="app"
        style={{ background: secondaryColor }}
      >
        <ColorPanel
          key={currentUser && currentUser.name}
          currentUser={currentUser}
        />
        <SidePanel
          key={currentUser && currentUser.uid}
          currentUser={currentUser}
          primaryColor={primaryColor}
        />
        <Grid.Column style={{ marginLeft: 320, height: '100%' }}>
          <Messages
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser={currentUser}
            isPrivateChannel={isPrivateChannel}
          />
        </Grid.Column>
        <Grid.Column style={{ width: 4 }}>
          <MetaPanel
            key={currentChannel && currentChannel.id}
            isPrivateChannel={isPrivateChannel}
            currentChannel={currentChannel}
            userPosts={userPosts}
          />
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(({ user, channel, color }) => {
  const { currentUser } = user;
  const { currentChannel, isPrivateChannel, userPosts } = channel;
  const { primaryColor, secondaryColor } = color;

  return {
    currentUser,
    currentChannel,
    isPrivateChannel,
    userPosts,
    primaryColor,
    secondaryColor
  };
})(App);
