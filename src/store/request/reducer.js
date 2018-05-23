import { randomURL } from 'utils/request';
import {
  EXECUTE_REQUEST,
  RECEIVE_INTERCEPTED_RESPONSE,
  PUSH_REDIRECT_CHAIN,
  RECEIVE_RESPONSE,
  CLEAR_RESPONSE,
  REQUEST_FAILED,
} from './types';

const initialState = {
  placeholderUrl: process.env.NODE_ENV !== 'test'
    ? randomURL()
    : 'https://example.com',
  request: null,
  response: null,
  interceptedResponse: null,
  redirectChain: [],
  lastRequestTime: null,
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXECUTE_REQUEST:
      return Object.assign({}, state, {
        loading: true,
        response: null,
        interceptedResponse: null,
        redirectChain: [],
        lastRequestTime: action.lastRequestTime,
        error: undefined,
      });

    case RECEIVE_RESPONSE:
      return Object.assign({}, state, {
        response: action.response,
        loading: false,
      });

    case RECEIVE_INTERCEPTED_RESPONSE:
      return Object.assign({}, state, {
        interceptedResponse: action.response,
      });

    case PUSH_REDIRECT_CHAIN:
      return Object.assign({}, state, {
        lastRequestTime: Date.now(),
        redirectChain: !state.redirectChain
          ? [action.response]
          : [...state.redirectChain, action.response],
      });

    case CLEAR_RESPONSE:
      return Object.assign({}, state, {
        response: null,
        loading: false,
        error: undefined,
      });

    case REQUEST_FAILED:
      return Object.assign({}, state, {
        error: action.error,
      });

    default:
      return state;
  }
}

