import PropTypes from 'prop-types';

const { string, shape, arrayOf, number, bool } = PropTypes;

export const redirectShape = {
  frameId: number.isRequired,
  fromCache: bool.isRequired,
  method: string.isRequired,
  originUrl: string,
  parentFrameId: number.isRequired,
  redirectUrl: string.isRequired,
  requestId: string.isRequired,
  responseHeaders: arrayOf(
    shape({
      name: string.isRequired,
      value: string.isRequired,
    }).isRequired,
  ).isRequired,
  tabId: number.isRequired,
  time: number.isRequired,
  timeStamp: number.isRequired,
  type: string.isRequired,
  url: string.isRequired,
  // Not present on HSTS upgrade requests in Firefox
  ip: string,
  statusCode: number,
  statusLine: string,
};

export default shape(redirectShape);

