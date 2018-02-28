const getAuth = state => state.auth.apsToken;
export const getFetchedToken = state => getAuth(state).fetchedToken;
export const getAutoRefresh = state => getAuth(state).autoRefresh;
export const getTokenChangedTime = state => getAuth(state).tokenChangedTime;
export const getTokenExpired = state => getAuth(state).tokenExpired;
export const isLoading = state => getAuth(state).loading;
export const getError = state => getAuth(state).error;
