import firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

let config = {
  apiKey: 'AIzaSyACv_E_9gQXGMs2qRuGwgkZN8JZujVm8-w',
  authDomain: 'slackapp-1d94b.firebaseapp.com',
  databaseURL: 'https://slackapp-1d94b.firebaseio.com',
  projectId: 'slackapp-1d94b',
  storageBucket: 'slackapp-1d94b.appspot.com',
  messagingSenderId: '161138321852'
};
firebase.initializeApp(config);

export default firebase;
