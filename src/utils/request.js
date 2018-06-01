import { PLACEHOLDER_URLS } from 'constants/constants';

/**
 * Prepend http:// if missing from url
 * Make sure to allow https
 */
export function prependHttp(url) {
  let result = url;
  if (!(/^https?:\/\//.test(url))) {
    result = `http://${url}`;
  }

  return result;
}

/**
 * Takes an url in the form of site.com/{{key}} and
 * maps the key up against a variable in the params
 * object. It then returns the complete URL.
 *
 * The function also collapses {{key}} to nothing
 * if key is missing, and removes any double slashes
 * left behind.
 */
export function mapParameters(url, params) {
  if (!url) return null;

  return url.replace(/\{\{(\w+)\}\}/g, (match, capture) => {
    const param = params ? params[capture] : null;
    return param || '';
  }).replace(/([^:]\/)\/+/g, '$1');
}

/**
 * According to MDN, this makes us more adherent
 * to RFC 3986, which is good, I guess?!
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 */
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => (
    `%${c.charCodeAt(0).toString(16)}`
  ));
}

function assignUrlVariables(header, params) {
  return {
    name: header.name,
    value: mapParameters(header.value, params),
  };
}

/**
 * Translates data from the way we can use it
 * effectively to the way fetch takes data.
 *
 * Object:
 * {
 *   headerName: value
 * }
 */
export function reMapHeaders(headers, parameters) {
  if (!headers) {
    return {};
  }

  return headers
    .filter(header => header && header.name)
    .map(variable => assignUrlVariables(variable, parameters))
    .reduce((result, header) => ({
      ...result,
      [header.name]: header.value,
    }), {});
}

/**
 * Generate random placeholder URL and cache it so we don't fetch every digest.
 */
let placeholder;
export function randomURL() {
  if (!placeholder) {
    placeholder = PLACEHOLDER_URLS[Math.floor(Math.random() * PLACEHOLDER_URLS.length)];
  }

  return placeholder;
}


/**
 * Take an array of objects and transform it into
 * a URL encoded form data string suitable to be
 * posted to a server.
 */
export function formDataToFormString(formData) {
  if (!formData) {
    return '';
  }

  const result = formData
    .filter(item => item && item.name)
    .reduce((prev, item, i) => (
      `${prev}${i !== 0 ? '&' : ''}` +
      `${fixedEncodeURIComponent(item.name)}=${item.value ? fixedEncodeURIComponent(item.value) : ''}`
    ), '');

  return result.replace(/%20/g, '+');
}

/**
 * Take an array of objects and transform it into
 * a string of headers, suitable for being exported
 * to postman json.
 */
export function headersToHeaderString(headers) {
  if (!headers) {
    return '';
  }

  const result = headers
    .filter(item => item && item.name)
    .reduce((prev, { name, value }) => (
      `${prev ? `${prev}\n` : ''}${name}: ${value || ''}`
    ), '');

  return `${result}\n`;
}

export function setLocationHash(value, replace) {
  const normalized = value || '';
  const { location, history, URL } = window;
  const { pushState, replaceState } = history;
  const url = new URL(location);

  if (normalized === url.hash.slice(1)) {
    return;
  }

  url.hash = normalized;
  (replace ? replaceState : pushState).call(history, null, '', url.toString());
}

export function focusUrlField() {
  document.querySelector('input[type="text"][name="url"]').focus();
}

export function isRequestID(string) {
  return /^[a-z0-9]{8}$/i.test(string);
}

function enumRange(start, end) {
  const result = [];

  for (
    let i = String(start).charCodeAt(0);
    i <= String(end).charCodeAt(0);
    i += 1
  ) {
    result.push(String.fromCharCode(i));
  }

  return result;
}

export function requestID() {
  if (process.env.NODE_ENV === 'test') {
    return 'tstREQID';
  }

  const range = enumRange('0', '9').concat(
    enumRange('a', 'z'),
    enumRange('A', 'Z'),
  );

  const result = [];

  for (let i = 0; i < 8; i += 1) {
    result.push(
      range[Math.floor(Math.random() * range.length)],
    );
  }

  return result.join('');
}
