import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import { applyPenders } from 'lib/common';

const SET_CURRENT_CHANNEL = 'channel/SET_CURRENT_CHANNEL';
const SET_PRIVATE_CHANNEL = 'channel/SET_PRIVATE_CHANNEL';
const SET_USER_POSTS = 'channel/SET_USER_POSTS';

export const set_current_channel = createAction(SET_CURRENT_CHANNEL);
export const set_private_channel = createAction(SET_PRIVATE_CHANNEL);
export const set_user_posts = createAction(SET_USER_POSTS);

const initialState = {
  currentChannel: null,
  isPrivateChannel: false,
  loading: true,
  userPosts: null
};

const reducer = handleActions(
  {
    [SET_CURRENT_CHANNEL]: (state, { payload }) => {
      return produce(state, draft => {
        draft.currentChannel = payload;
        draft.loading = false;
      });
    },
    [SET_PRIVATE_CHANNEL]: (state, { payload }) => {
      return produce(state, draft => {
        draft.isPrivateChannel = payload;
      });
    },
    [SET_USER_POSTS]: (state, { payload }) => {
      return produce(state, draft => {
        draft.userPosts = payload;
      });
    }
  },
  initialState
);

export default applyPenders(reducer, [
  {
    // type: FETCH_USER,
    // onSuccess: (state, { payload: { data } }) => {
    //   return produce(state, draft => {
    //     draft.userData = data;
    //   });
    // }
  }
]);
