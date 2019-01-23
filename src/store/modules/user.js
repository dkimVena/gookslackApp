import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import * as AuthAPI from 'lib/api/auth';
import { applyPenders } from 'lib/common';

const SET_USER = 'user/SET_USER';
const CLEAR_USER = 'user/CLEAR_USER';

export const set_user = createAction(SET_USER);
export const clear_user = createAction(CLEAR_USER);

const initialState = {
  currentUser: null,
  loading: true
};

const reducer = handleActions(
  {
    [SET_USER]: (state, { payload }) => {
      return produce(state, draft => {
        draft.currentUser = payload;
        draft.loading = false;
      });
    },
    [CLEAR_USER]: state => {
      return produce(state, draft => {
        draft.currentUser = null;
        draft.loading = false;
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
