import { createSelector } from 'reselect';
import { DARK_THEMES, DEFAULT_HISTORY_SIZE, DEFAULT_APS_TOKEN_TTL } from 'constants/constants';

export const getOptions = state => state.options;

export const getURLHash = createSelector(
  [getOptions],
  options => options && options.get('urlHash'),
);

export const getActiveTab = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'activeTab'], 'collections'),
);

export const getTheme = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'theme'], 'retro'),
);

export const isDarkTheme = createSelector(
  [getTheme],
  theme => DARK_THEMES.includes(theme),
);

export const getHighlightStyle = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'highlightStyle'], 'default'),
);

export const getCollectionsMinimized = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'collectionsMinimized'], false),
);

export const getHistorySize = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'historySize'], DEFAULT_HISTORY_SIZE),
);

export const getAPSTokenTTL = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'apsTokenTTL'], DEFAULT_APS_TOKEN_TTL),
);

export const getBodyType = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'bodyType'], 'json'),
);

export const isDisabledHighlighting = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'disableHighlighting'], false),
);

export const isWrapResponse = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'wrapResponse'], false),
);

export const isDefaultCompact = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'defaultCompact'], false),
);

export const isHeaderDescriptionEnabled = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'headerDescriptionEnabled'], true),
);

export const getIgnoreCache = createSelector(
  [getOptions],
  options => options && options.getIn(['options', 'ignoreCache'], false),
);
