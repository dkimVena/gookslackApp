import React, { Component } from 'react';

import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from 'semantic-ui-react';
import firebase from 'lib/firebase';
import { ColorActions } from 'store/actionCreators';
import { HuePicker } from 'react-color';

class ColorPanel extends Component {
  state = {
    modal: false,
    primaryColor: '',
    secondaryColor: '',
    usersRef: firebase.database().ref('users'),
    userColors: []
  };

  componentDidMount() {
    if (this.props.currentUser) {
      this.addListeners(this.props.currentUser.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.props.currentUser.uid}/colors`).off();
  };

  addListeners = userId => {
    let userColors = [];
    this.state.usersRef.child(`${userId}/colors`).on('child_added', snap => {
      userColors.unshift(snap.val());
      this.setState({ userColors });
    });
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleSaveColor = () => {
    const { primaryColor, secondaryColor } = this.state;
    if (primaryColor && secondaryColor) {
      this.saveColor(primaryColor, secondaryColor);
    }
  };

  saveColor = (primaryColor, secondaryColor) => {
    this.state.usersRef
      .child(`${this.props.currentUser.uid}/colors`)
      .push()
      .update({
        primaryColor,
        secondaryColor
      })
      .then(() => {
        console.log('color added');
        this.closeModal();
      })
      .catch(err => {
        console.log(err);
      });
  };

  setColors = (primaryColor, secondaryColor) => {
    ColorActions.set_colors({ primaryColor, secondaryColor });
  };

  handleChangePrimary = color => this.setState({ primaryColor: color.hex });

  handleChangeSecondary = color => this.setState({ secondaryColor: color.hex });

  displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() =>
            this.setColors(color.primaryColor, color.secondaryColor)
          }
        >
          <div
            className="color__square"
            style={{ background: color.primaryColor }}
          >
            <div
              className="color__overlay"
              style={{ background: color.secondaryColor }}
            />
          </div>
        </div>
      </React.Fragment>
    ));

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    const { modal, primaryColor, secondaryColor, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        inverted
        icon="labeled"
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Color</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" />
              <HuePicker
                onChange={this.handleChangePrimary}
                color={primaryColor}
              />
            </Segment>
            <Segment inverted>
              <Label content="Secondary Color" />
              <HuePicker
                onChange={this.handleChangeSecondary}
                color={secondaryColor}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColor}>
              <Icon name="checkmark" /> Save Color
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default ColorPanel;
