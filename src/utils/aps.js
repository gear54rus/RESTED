import tokenPayloads from 'constants/apsRequestPayloads';

export function isValidAPSToken(string) {
  return Boolean(string);
}

export const apsTokenTypes = {
  account: {
    caption: 'Account[, Subscription]',
    payload: tokenPayloads.account,
  },
  applicationInstance: {
    caption: 'Application instance',
    payload: tokenPayloads.applicationInstance,
  },
  public: {
    caption: 'Public',
    payload: tokenPayloads.public,
  },
  serviceTemplate: {
    caption: 'Service template',
    payload: tokenPayloads.serviceTemplate,
  },
  subscription: {
    caption: 'Subscription',
    payload: tokenPayloads.subscription,
  },
  user: {
    caption: 'User[, Subscription]',
    payload: tokenPayloads.user,
  },
};
