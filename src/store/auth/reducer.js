import { combineReducers } from 'redux';
import {
  APS_BROWSER_DATA_RECEIVED,
  APS_SET_AUTO_REFRESH,
  APS_TOKEN_REFRESH_START,
  APS_TOKEN_REFRESH_ERROR,
  APS_TOKEN_REFRESH_END,
  APS_TOKEN_CHANGED,
  APS_SET_TOKEN_EXPIRED,
} from './types';

const apsTokenInitialState = {
  fetchedToken: null,
  autoRefresh: false,
  tokenChangedTime: null,
  tokenExpired: false,
  loading: false,
  error: null,
};

function apsToken(state = apsTokenInitialState, action) {
  switch (action.type) {
    case APS_BROWSER_DATA_RECEIVED:
      return action.token ? Object.assign({}, state, {
        fetchedToken: {
          time: action.token.time,
          value: action.token.value,
          type: action.token.type,
          params: action.token.params,
          origin: 'browser',
          url: action.token.url,
        },
        tokenChangedTime: action.token.time,
      }) : state;

    case APS_SET_AUTO_REFRESH:
      return Object.assign({}, state, {
        autoRefresh: action.autoRefresh,
      });

    case APS_TOKEN_REFRESH_START:
      return Object.assign({}, state, {
        loading: true,
        error: null,
      });

    case APS_TOKEN_REFRESH_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
        autoRefresh: false,
      });

    case APS_TOKEN_REFRESH_END:
      return Object.assign({}, state, {
        loading: false,
        fetchedToken: {
          time: action.time,
          value: action.value,
          type: action.tokenType,
          params: action.params,
          origin: 'api',
          url: action.url,
        },
        tokenChangedTime: action.time,
        autoRefresh: true,
      });

    case APS_TOKEN_CHANGED:
      return Object.assign({}, state, {
        autoRefresh: (state.fetchedToken && (state.fetchedToken.value === action.value)) || false,
        tokenChangedTime: action.time,
      });

    case APS_SET_TOKEN_EXPIRED:
      return Object.assign({}, state, {
        tokenExpired: action.tokenExpired,
      });

    default:
      return state;
  }
}

export default combineReducers({
  apsToken,
});
