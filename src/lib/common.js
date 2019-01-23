import { pender } from 'redux-pender';

export function applyPenders(reducer, penders) {
  const updaters = Object.assign({}, ...penders.map(pender));
  return (state, action) => {
    if (updaters[action.type]) {
      return updaters[action.type](state, action);
    }
    return reducer(state, action);
  };
}
