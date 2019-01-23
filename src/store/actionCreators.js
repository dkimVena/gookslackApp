import { bindActionCreators } from 'redux';

import * as userActions from './modules/user';
import * as channelActions from './modules/channel';
import * as colorActions from './modules/color';

import store from './index';

const { dispatch } = store;

export const UserActions = bindActionCreators(userActions, dispatch);
export const ChannelActions = bindActionCreators(channelActions, dispatch);
export const ColorActions = bindActionCreators(colorActions, dispatch);
