import {
  TOKEN_CHANGED,
  SEND_REQUEST,
} from './types';

export function tokenChanged() {
  return { type: TOKEN_CHANGED, changeTime: new Date() };
}

export function sendRequest(request) {
  return { type: SEND_REQUEST, request };
}
