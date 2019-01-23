import React, { Component } from 'react';

import uuidv4 from 'uuid/v4';
import { Button, Segment, Input } from 'semantic-ui-react';
import { Picker, emojiIndex } from 'emoji-mart';

import ProgressBar from './ProgressBar';
import firebase from 'lib/firebase';
import FileModal from './FileModal';

import 'emoji-mart/css/emoji-mart.css';

class MessageForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref('typing'),
    uploadTask: null,
    uploadState: '',
    message: '',
    loading: false,
    errors: [],
    modal: false,
    percentUploaded: 0,
    emojiPicker: false
  };

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  addTyping = (currentChannel, currentUser) => {
    const { typingRef } = this.state;
    typingRef
      .child(currentChannel.id)
      .child(currentUser.uid)
      .set(currentUser.displayName);
  };

  removeTyping = (currentChannel, currentUser) => {
    const { typingRef } = this.state;
    typingRef
      .child(currentChannel.id)
      .child(currentUser.uid)
      .remove();
  };

  handleKeyDown = e => {
    if (e.ctrlKey && e.keyCode === 13) {
      this.sendMessage();
      return;
    }

    const { message } = this.state;
    const { currentChannel, currentUser } = this.props;

    if (message) {
      this.addTyping(currentChannel, currentUser);
    } else {
      this.removeTyping(currentChannel, currentUser);
    }
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, '');
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== 'undefined') {
        let unicode = emoji.native;
        if (typeof unicode !== 'undefined') {
          return unicode;
        }
      }
      x = ':' + x + ':';
      return x;
    });
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  createMessage = (fileURL = null) => {
    const { uid, displayName, photoURL } = this.props.currentUser;

    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: uid,
        name: displayName,
        avatar: photoURL
      }
    };

    if (fileURL !== null) {
      message['image'] = fileURL;
    } else {
      message['content'] = this.state.message;
    }

    return message;
  };
  sendMessage = () => {
    const { currentChannel, currentUser } = this.props;
    const { message } = this.state;

    if (message) {
      this.setState({ loading: true });

      this.props
        .getMessagesRef()
        .child(currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] });
          this.removeTyping(currentChannel, currentUser);
        })
        .catch(err => {
          console.log(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: 'Add a message' })
      });
    }
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private/${this.props.currentChannel.id}`;
    } else {
      return 'chat/public';
    }
  };
  uploadFile = (file, metaData) => {
    const pathToUpload = this.props.currentChannel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: 'uploading',
        uploadTask: this.state.storageRef.child(filePath).put(file, metaData)
      },
      () => {
        this.state.uploadTask.on(
          'state_changed',
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: 'error',
              uploadTask: null
            });
          },
          async () => {
            try {
              let downloadURL = await this.state.uploadTask.snapshot.ref.getDownloadURL();
              this.sendFileMessage(downloadURL, ref, pathToUpload);
            } catch (err) {
              this.setState({
                errors: this.state.errors.concat(err),
                uploadState: 'error',
                uploadTask: null
              });
            }
          }
        );
      }
    );
  };

  sendFileMessage = (fileURL, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileURL))
      .then(() => {
        this.setState({ uploadState: 'done' });
      })
      .catch(err => {
        this.setState({ errors: this.state.errors.concat(err) });
      });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker
    } = this.state;

    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="apple"
            className="emojiPicker"
            title="Pick your emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input
          fluid
          name="message"
          style={{ marginBottom: '0.7em' }}
          value={message}
          ref={node => (this.messageInputRef = node)}
          label={
            <Button
              icon={emojiPicker ? 'close' : 'add'}
              content={emojiPicker ? 'Close' : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          placeholder="Write your message"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          className={
            errors.some(error => error.message.includes('message'))
              ? 'error'
              : ''
          }
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            disabled={loading}
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
          />
          <Button
            color="teal"
            disabled={uploadState === 'uploading'}
            content="Upload Media"
            labelPosition="right"
            icon={'cloud upload'}
            onClick={this.openModal}
          />
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Button.Group>
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessageForm;
