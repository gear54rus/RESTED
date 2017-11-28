import { CONTENT_SCRIPT_NS, OA_CP_TYPES } from 'constants/constants';

function $(selector) { return document.querySelector(selector); }

function getAPSData({ page }) { // the BS we are reduced to by the stupid WebExtensions sandbox
  const randomID = Math.random().toString(36).substring(7);
  const eventID = `${CONTENT_SCRIPT_NS}/TOKEN_RECEIVED`;

  const pullAPSDataFromPage = (function () { // eslint-disable-line func-names
    const timeout = 250;
    const cpTypes = JSON.parse('$CP_TYPES');
    const cpType = '$CP_TYPE';
    const body = document.body;
    const transferNode = document.createElement('div');
    const data = {};

    transferNode.hidden = true;
    transferNode.id = '$RANDOM_ID';

    const interval = setInterval(() => { // no sooner than 250ms
      requestIdleCallback(() => {
        if (!(window.aps && window.aps.context)) { return; } // Context not loaded yet

        let complete = true; // is another run required?
        const context = window.aps.context;

        if (context._token) { // eslint-disable-line no-underscore-dangle
          data.apsToken = {
            value: context._token, // eslint-disable-line no-underscore-dangle
            receivedAt: Date.now(), // no 'new Date()', everything needs to be serializable
          };
        } else { complete = false; }

        if ([cpTypes.CCP2, cpTypes.MYCP2].includes(cpType)) {
          if (context.user) {
            data.userID = context.user.userId;

            if (cpType === cpTypes.CCP2) {
              data.accountID = context.user.memberId;
            }
          } else { complete = false; }
        }

        if (complete) {
          transferNode.textContent = JSON.stringify(data);
          body.appendChild(transferNode);
          document.dispatchEvent(new Event('$EVENT_ID'));
          body.removeChild(transferNode);
          clearInterval(interval);
        }
      }, { timeout }); // and no later than 500ms
    }, timeout);
  }).toString() // the only way to push code to page
    .replace('$CP_TYPES', JSON.stringify(OA_CP_TYPES))
    .replace('$CP_TYPE', page)
    .replace('$RANDOM_ID', randomID)
    .replace('$EVENT_ID', eventID);

  const body = document.body;
  const pageScript = document.createElement('script');

  pageScript.type = 'text/javascript';
  pageScript.textContent = `(${pullAPSDataFromPage})()`;

  return new Promise(resolve => {
    document.addEventListener(eventID, () => { // the only way to get data from page
      resolve(JSON.parse(document.getElementById(randomID).textContent));
    });

    body.removeChild(body.appendChild(pageScript));
  });
}

function getOAInfo() {
  const result = {
    versions: {},
  };
  let temp;

  temp = [ // login page
    ':root > head > script[src^="/aps/2/ui/runtime/client/aps/aps.webgate.js"]',
    ':root > head > script[src^="/webgate/static/js/common_script.js"]',
    ':root > body.loginBody > div#login-page button#login[name="login"]', // CP1
    ':root > body.ccp-frame > div#ccp-login button#login[name="login"]', // CP2
  ].map($);

  if (temp[0] && temp[1] && (temp[2] ? !temp[3] : temp[3])) { // CP1 xor CP2
    result.page = temp[2] ? OA_CP_TYPES.LCP1 : OA_CP_TYPES.LCP2;
    result.versions.oa = temp[1].getAttribute('src').split('?')[1];
    result.versions.runtime = temp[0].getAttribute('src').split('?')[1].slice(result.versions.oa.length);

    return result;
  }

  temp = [ // CP1 logged in
    ':root > head > script[src^="/pem/common/js/tools.js"]',
    ':root > head > script[src^="/pem/common/js/pem.js"]',
    ':root > frameset#master frame[name="topFrame"]',
    ':root > frameset#master frame[name="leftFrame"]',
    ':root > frameset#master frame[name="mainFrame"]',
  ].map($);

  if (temp[0] && temp[1] && temp[2] && temp[4]) {
    const url = new URL(location);

    result.page = url.searchParams.get('cp') ? OA_CP_TYPES.PCP : OA_CP_TYPES.ANYCP1; // leave for topFrame to determine
    result.versions.oa = temp[1].getAttribute('src').split('?')[1];

    return result;
  }

  temp = [ // CP2 logged in
    ':root > head > script[src^="/aps/2/ui/runtime/client/"]',
    ':root > body.ccp-frame > div#ccp-wrapper',
    `div#ccp-sidebar ul#ccp-navigation li#${CSS.escape('http://www.parallels.com/ccp-dashboard#home-navigation')}:first-child`, // CCP
    `div#ccp-sidebar ul#ccp-navigation li#${CSS.escape('http://www.parallels.com/ccp-users#myprofile-navigation')}`, // MyCP
  ];

  temp[2] = `${temp[1]} > ${temp[2]}`; // append to CCP2 generic
  temp[3] = `${temp[1]} > ${temp[3]}`;
  temp = temp.map($);

  if (temp[0] && temp[1] && (temp[2] ? !temp[3] : temp[3])) { // CCP xor MyCP
    result.page = temp[2] ? OA_CP_TYPES.CCP2 : OA_CP_TYPES.MYCP2;
    result.versions.runtime = temp[0].getAttribute('src').split('?')[1].split('=')[1];

    return result;
  }

  return null; // not an OA page
}

function topWindow(globalData) {
  globalData.send();

  if ([OA_CP_TYPES.CCP2, OA_CP_TYPES.MYCP2].includes(globalData.page)) {
    getAPSData(globalData).then(apsData => {
      Object.assign(globalData.data, apsData); // eslint-disable-line no-param-reassign
      globalData.send();
    });
  }
}

function topFrame(globalData) { /* eslint-disable no-param-reassign */
  if (globalData.page === OA_CP_TYPES.ANYCP1) { // CP1, not PCP
    const userInfo = $('html > body li#userName div#user_name > b').textContent;
    const subscriptionSelector = $('html > body li#userName div#sel_sub_cell select');

    if (subscriptionSelector) {
      globalData.page = OA_CP_TYPES.CCP1;
      globalData.data.accountID = /.* \(Account ID: (\d+)\)/.exec(userInfo)[1];

      if (subscriptionSelector.value === '0') { // 'All Domains' or whatever
        delete globalData.data.subscriptionID;
      } else {
        globalData.data.subscriptionID = subscriptionSelector.value;
      }
    } else {
      globalData.page = OA_CP_TYPES.MYCP1;
      globalData.data.userID = /.* \(User ID: (\d+)\)/.exec(userInfo)[1];
    }
  }

  globalData.send();
} /* eslint-enable no-param-reassign */

function aps2UI(globalData) {
  getAPSData(globalData).then(apsData => {
    Object.assign(globalData.data, apsData); // eslint-disable-line no-param-reassign
    globalData.send();
  });
}

function apsUI0(globalData) {
  aps2UI(globalData);
}

(() => { // detect where we are
  let globalData;

  if (top === window) { // we're top window, check where we are and setup env
    const port = chrome.runtime.connect();
    const oaInfo = getOAInfo();

    globalData = {
      send(deactivate) { // deactivate fetching and badge
        const data = Object.assign({}, globalData);

        delete data.send;
        port.postMessage(deactivate ? null : data);
      },
    };

    if (!oaInfo) { // not OA page,
      globalData.send(true); // unregister this tab
      return; // and stop all operations
    }

    Object.assign(globalData, {
      ...oaInfo,
      url: location.href,
      data: {},
    });

    window[CONTENT_SCRIPT_NS] = globalData; // OA found, run child frame handlers too
    topWindow(globalData);
  } else if (top[CONTENT_SCRIPT_NS]) { // not top but OA window
    const frameHandlers = {
      topFrame,
      'aps-ui-0': apsUI0,
      'aps2-ui': aps2UI,
    };

    if (window.name in frameHandlers) {
      frameHandlers[window.name](top[CONTENT_SCRIPT_NS]);
    }
  } // and can't find our env, cease operation
})();
