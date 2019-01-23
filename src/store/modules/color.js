import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import { applyPenders } from 'lib/common';

const SET_COLORS = 'color/SET_COLORS';

export const set_colors = createAction(SET_COLORS);

const initialState = {
  primaryColor: '#4c3c4c',
  secondaryColor: '#eee'
};

const reducer = handleActions(
  {
    [SET_COLORS]: (state, { payload }) => {
      return produce(state, draft => {
        draft.primaryColor = payload.primaryColor;
        draft.secondaryColor = payload.secondaryColor;
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
