import { combineReducers } from 'redux';
import { penderReducer } from 'redux-pender';
import user from './user';
import channel from './channel';
import color from './color';

export default combineReducers({
  user,
  channel,
  color,
  pender: penderReducer
});
