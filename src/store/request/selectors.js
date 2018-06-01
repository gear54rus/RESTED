import { getFormValues } from 'redux-form';

export const getSelected = state => state.request.selected;
export const getPlaceholderUrl = state => state.request.placeholderUrl;
export const getResponse = state => state.request.response;
export const getInterceptedResponse = state => state.request.interceptedResponse;
export const getRedirectChain = state => state.request.redirectChain;
export const getLoading = state => state.request.loading;

const getValues = getFormValues('request');
export const getRequest = state => getValues(state);
export const getURL = state => getValues(state).url;
export const getHeaders = state => getValues(state).headers;
export const getAuthType = state => getValues(state).auth.type;
export const getBodyType = state => getValues(state).bodyType;

export const getAPSTokenType = state => {
  const { apsToken } = getValues(state).auth;

  return apsToken && apsToken.token && apsToken.token.type;
};
