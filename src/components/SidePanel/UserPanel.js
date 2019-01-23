import React, { Component } from 'react';

import {
  Grid,
  Icon,
  Header,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';
import firebase from 'lib/firebase';

class UserPanel extends Component {
  state = {
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob: '',
    uploadedCroppedImage: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref('users'),
    metadata: {
      contentType: 'image/jpeg'
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => {
    this.setState({
      modal: false,
      previewImage: '',
      croppedImage: '',
      blob: ''
    });
  };

  dropdownOptions = () => [
    {
      key: 'user',
      text: (
        <span>
          Signed in as <strong>User</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: 'avatar',
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: 'signout',
      text: <span onClick={this.handleSignOut}>Sign Out</span>
    }
  ];

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef
      .child(`avatars/user/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({ photoURL: this.state.uploadedCroppedImage })
      .then(() => {
        console.log('photoURL updated');
        this.closeModal();
      })
      .catch(err => {
        console.log(err);
      });

    this.state.usersRef
      .child(this.state.userRef.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log('User avatar updated');
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log('signed out'));
  };

  render() {
    const {
      currentUser: { displayName, photoURL, primaryColor }
    } = this.props;
    const { modal, previewImage, croppedImage } = this.state;

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: '0' }}>
            <Header inverted floated="left" as="h2">
              <Icon name="comments" />
              <Header.Content>GookChat</Header.Content>
            </Header>
          </Grid.Row>
          <Header inverted style={{ padding: '0.25em' }} as="h4">
            <Dropdown
              trigger={
                <span>
                  <Image src={photoURL} spaced="right" avatar />
                  {displayName}
                </span>
              }
              options={this.dropdownOptions()}
            />
          </Header>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5em auto' }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.uploadCroppedImage}
                >
                  <Icon name="save" />
                  Change Avatar
                </Button>
              )}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" />
                Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" />
                Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
