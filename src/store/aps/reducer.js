import {
  TOKEN_CHANGED,
  EXECUTE_REQUEST,
  TOKEN_FETCHED,
  FETCH_ERROR,
} from './types';

const initialState = {
  loading: false,
  lastTokenChangedTime: null,
  fetchedTokenDescription: null,
  error: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case TOKEN_CHANGED:
      return Object.assign({}, state, {
        lastTokenChangedTime: action.changeTime,
      });

    case EXECUTE_REQUEST:
      return Object.assign({}, state, {
        loading: true,
        error: null,
      });

    case TOKEN_FETCHED:
      return Object.assign({}, state, {
        loading: false,
        lastTokenChangedTime: action.fetchTime,
        fetchedTokenDescription: action.description,
      });

    case FETCH_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
      });

    default:
      return state;
  }
}

