import {
  APS_SET_AUTO_REFRESH,
  APS_TOKEN_REFRESH_START,
  APS_TOKEN_CHANGED,
  APS_SET_TOKEN_EXPIRED,
} from './types';

export function apsRefreshToken() {
  return { type: APS_TOKEN_REFRESH_START };
}

export function apsSetAutoRefresh(autoRefresh) {
  return { type: APS_SET_AUTO_REFRESH, autoRefresh: Boolean(autoRefresh) };
}

export function apsTokenChanged(value) {
  return { type: APS_TOKEN_CHANGED, value, time: (new Date()).getTime() };
}

export function apsSetTokenExpired(tokenExpired) {
  return { type: APS_SET_TOKEN_EXPIRED, tokenExpired: Boolean(tokenExpired) };
}
