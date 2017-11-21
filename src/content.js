import { CONTENT_SCRIPT_NS } from 'constants/constants';

function $(selector) { return document.querySelector(selector); }

function getOAInfo() {
  const result = {};
  let temp;

  temp = [ // Login page
    'html > head > script[src^="/aps/2/ui/runtime/client/aps/aps.webgate.js"]',
    'html > head > script[src^="/webgate/static/js/common_script.js"]',
    'html > body.loginBody > div#login-page button#login[name="login"]', // CP1
    'html > body.ccp-frame > div#ccp-login button#login[name="login"]', // CP2
  ].map($);

  if (temp[0] && temp[1] && (temp[2] ? !temp[3] : temp[3])) { // CP1 xor CP2
    result.page = `lcp${temp[2] ? 1 : 2}`;
    result.oaVersion = temp[1].getAttribute('src').split('?')[1];
    result.runtimeVersion = temp[0].getAttribute('src').split('?')[1].slice(result.oaVersion.length);

    return result;
  }

  temp = [ // CP1 logged in
    'html > head > script[src^="/pem/common/js/tools.js"]',
    'html > head > script[src^="/pem/common/js/pem.js"]',
    'html > frameset#master frame[name="topFrame"]',
    'html > frameset#master frame[name="leftFrame"]',
    'html > frameset#master frame[name="mainFrame"]',
  ].map($);

  if (temp[0] && temp[1] && temp[2] && temp[4]) {
    result.page = temp[3] ? 'pcp' : '*cp1'; // leave for topFrame to fill
    result.oaVersion = temp[1].getAttribute('src').split('?')[1];

    return result;
  }

  temp = [ // CP2 logged in
    'html > head > script[src^="/aps/2/ui/runtime/client/"]',
    'html > body.ccp-frame > div#ccp-wrapper',
    `div#ccp-sidebar ul#ccp-navigation li#${CSS.escape('http://www.parallels.com/ccp-dashboard#home-navigation')}:first-child`, // CCP
    `div#ccp-sidebar ul#ccp-navigation li#${CSS.escape('http://www.parallels.com/ccp-users#myprofile-navigation')}`, // MyCP
  ].map($);

  if (temp[0] && temp[1] && (temp[2] ? !temp[3] : temp[3])) { // CCP xor MyCP
    result.page = temp[2] ? 'ccp2' : 'mycp2';
    result.runtimeVersion = temp[0].getAttribute('src').split('?')[1].split('=')[1];

    return result;
  }

  return null; // not an OA page
}

(function getAPSData() { // detect where we are and run the appripriate function
  let globalData;

  if (top === window) { // we're top window, check where we are and setup env
    const port = chrome.runtime.connect();
    const oaInfo = getOAInfo();

    if (!oaInfo) { return; } // not OA page, stop all operations

    globalData = {
      ...oaInfo,
      data: {},
      send(deactivate) { // deactivate fetching and badge
        const data = Object.assign({}, globalData);

        delete data.send;

        port.postMessage(deactivate ? null : data);
      },
    };

    globalData.send();

    window[CONTENT_SCRIPT_NS] = globalData; // OA found, run child frame scripts too
  } else if (top[CONTENT_SCRIPT_NS]) { // not top
    globalData = top[CONTENT_SCRIPT_NS];
  } else { // and can't find our env, cease operation
    // return;
  }
}());
