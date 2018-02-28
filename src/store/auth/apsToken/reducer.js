import {
  BROWSER_DATA_RECEIVED,
  SET_AUTO_REFRESH,
  TOKEN_CHANGED,
  SET_TOKEN_EXPIRED,
  TOKEN_REFRESH_START,
  TOKEN_REFRESH_ERROR,
  TOKEN_REFRESH_END,
} from './types';

const initialState = {
  fetchedToken: null,
  autoRefresh: false,
  tokenChangedTime: null,
  tokenExpired: false,
  loading: false,
  error: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case BROWSER_DATA_RECEIVED:
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

    case SET_AUTO_REFRESH:
      return Object.assign({}, state, {
        autoRefresh: action.autoRefresh,
      });

    case TOKEN_CHANGED:
      return Object.assign({}, state, {
        autoRefresh: (state.fetchedToken && (state.fetchedToken.value === action.value)) || false,
        tokenChangedTime: action.time,
      });

    case SET_TOKEN_EXPIRED:
      return Object.assign({}, state, {
        tokenExpired: action.tokenExpired,
      });

    case TOKEN_REFRESH_START:
      return Object.assign({}, state, {
        loading: true,
        error: null,
      });

    case TOKEN_REFRESH_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
        autoRefresh: false,
      });

    case TOKEN_REFRESH_END:
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

    default:
      return state;
  }
}
