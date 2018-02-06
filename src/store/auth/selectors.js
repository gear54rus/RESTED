const getAPSTokenAuth = state => state.auth.apsToken;
export const apsGetAutoRefresh = state => getAPSTokenAuth(state).autoRefresh;
export const apsIsLoading = state => getAPSTokenAuth(state).loading;
export const apsGetError = state => getAPSTokenAuth(state).error;
export const apsGetFetchedToken = state => getAPSTokenAuth(state).fetchedToken;
export const apsGetTokenChangedTime = state => getAPSTokenAuth(state).tokenChangedTime;
export const apsGetTokenExpired = state => getAPSTokenAuth(state).tokenExpired;
