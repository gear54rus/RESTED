// The code below is stringified and executed in the page context.
// ESLint will not be able to figure out the context, it is easier to disable it.
// Anything that this function may need from current context needs to be stringified
// and passed as arguments.

export default ((contentScriptNS, transferNodeID, transferEventID, oaCPTypesJSON) => {
  // 'GlobalData' acts differently depending on the frame in which the instance is created.
  // All instances work together to consolidate all data in the instance that is created in
  // the top frame. This class is a workaround for same origin policy in relation to frames.
  class GlobalData {
    // we need to wrap our message so that 'aps.js' 'postMessage' listeners don't crash
    /* eslint-disable no-underscore-dangle */
    static postMessage(target, message) {
      return target.postMessage(JSON.stringify({
        [GlobalData.namespace]: message,
        functionName: 'toString', // no-op function, aps.js will execute that and there's no way to stop it
      }), '*');
    }

    constructor() {
      this._top = window.top === window;

      // RW mutex is implemented here
      // 'update' requests a lock and its argument callback
      // returns what should be written, the lock is then released
      this._locked = false;
      this._queue = [];

      if (this._top) {
        this.update = this._updateTop;
        this._transferNode = document.body.appendChild(document.createElement('div'));
        this._transferNode.id = GlobalData.transferNodeID;
        this._transferNode.hidden = true;
        window.addEventListener('message', message => this._requestHandler(message));
      } else {
        this.update = this._updateOther;
      }
    }

    _transfer() {
      this._transferNode.textContent = JSON.stringify(this._data);
      this._transferNode.dispatchEvent(new Event(GlobalData.transferEventID));
    }

    _processQueue() {
      if (this._queue.length > 0) {
        let next = this._queue.shift();

        while (next) {
          // queue contains window objects for other frames or
          // functions for local 'update' calls, this design is brittle
          if (typeof next === 'function') {
            this._data = next(this._data);

            if (this._queue.length === 0) {
              this._locked = false;
              this._transfer();
            }

            next = this._queue.shift();
          } else {
            GlobalData.postMessage(next, {
              type: `${GlobalData.namespace}DATA`,
              data: this._data,
            });

            break;
          }
        }
      } else {
        this._locked = false;
        this._transfer();
      }
    }

    _requestHandler(event) {
      let message;

      try { // check if the message is ours
        const parsed = JSON.parse(event.data);

        if (!(GlobalData.namespace in parsed)) { return; }

        message = parsed[GlobalData.namespace];
      } catch (e) {
        return; // ignore message
      }

      switch (message.type) {
        case `${GlobalData.namespace}GET`:
          if (this._locked) {
            this._queue.push(event.source);
          } else {
            this._locked = true;

            GlobalData.postMessage(event.source, {
              type: `${GlobalData.namespace}DATA`,
              data: this._data,
            });
          }

          break;

        case `${GlobalData.namespace}SET`:
          this._data = message.data;
          this._processQueue();

          break;

        default:
      }
    }

    _updateTop(handler) {
      if (this._locked) {
        this._queue.push(handler);
      } else {
        this._locked = true;
        this._data = handler(this._data);
        this._processQueue(); // queue in local case is needed if 'update' is used inside handler
      }
    }

    // we don't want to make this static since it should
    // be the same API across all frames
    // eslint-disable-next-line class-methods-use-this
    _updateOther(handler) {
      function responseHandler(event) {
        let message;

        try {
          const parsed = JSON.parse(event.data);

          if (!(GlobalData.namespace in parsed)) { return; }

          message = parsed[GlobalData.namespace];
        } catch (e) {
          return;
        }

        if (message.type !== `${GlobalData.namespace}DATA`) { return; }

        // if this frame has several handlers waiting for the message,
        // only the first in line should receive it
        // then it should remove itself to indicate that we received what we asked for
        event.stopImmediatePropagation();
        window.removeEventListener('message', responseHandler);

        const newData = handler(message.data);

        GlobalData.postMessage(window.top, {
          type: `${GlobalData.namespace}SET`,
          data: newData,
        });
      }

      window.addEventListener('message', responseHandler);

      GlobalData.postMessage(window.top, {
        type: `${GlobalData.namespace}GET`,
      });
    }
  }
  /* eslint-enable no-underscore-dangle */

  // static vars seem to not be supported in browsers yet
  GlobalData.namespace = `${contentScriptNS}GLOBAL_DATA__`;
  GlobalData.transferNodeID = transferNodeID;
  GlobalData.transferEventID = transferEventID;

  const oaCPTypes = JSON.parse(oaCPTypesJSON);

  function $(selector) { return document.querySelector(selector); }

  function getOAInfo() {
    const result = {
      versions: {},
    };
    let temp;

    function getQuery(element) {
      // Construct a mock absolute URL and get its query string
      return (new URL(`http://a.b${element.getAttribute('src')}`)).search.slice(1);
    }

    temp = [ // login page
      ':root > head > script[src^="/aps/2/ui/runtime/client/aps/aps.webgate.js"]',
      ':root > head > script[src^="/webgate/static/js/common_script.js"]',
      ':root > body.loginBody > div#login-page button#login[name="login"]', // CP1
      ':root > body.ccp-frame > div#ccp-login button#login[name="login"]', // CP2
    ].map($);

    if (temp[0] && temp[1] && (temp[2] ? !temp[3] : temp[3])) { // CP1 xor CP2
      result.page = temp[2] ? oaCPTypes.LCP1 : oaCPTypes.LCP2;
      result.versions.oa = getQuery(temp[1]);
      result.versions.runtime = getQuery(temp[0]).slice(result.versions.oa.length);

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
      const url = new URL(window.location);

      result.page = url.searchParams.get('cp') ? oaCPTypes.PCP : oaCPTypes.ANYCP1; // leave for topFrame to determine
      result.versions.oa = getQuery(temp[1]);

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
      result.page = temp[2] ? oaCPTypes.CCP2 : oaCPTypes.MYCP2;
      [, result.versions.runtime] = getQuery(temp[0]).split('=');

      return result;
    }

    return null; // not an OA page
  }

  function getAPSData(globalData) {
    const timeout = 250;

    (function getData() {
      globalData.update(data => {
        const newData = data;
        const handle = window.requestIdleCallback(getData, { timeout });
        let complete = true; // unusual to set it to true, but boolean logic dictates it

        if (window.aps && window.aps.context) {
          const { context } = window.aps;

          if (context._token) { // eslint-disable-line no-underscore-dangle
            newData.data.apsToken = {
              value: context._token, // eslint-disable-line no-underscore-dangle
              receivedAt: performance.timing.responseEnd,
            };
          } else { complete = false; }

          if ([oaCPTypes.CCP2, oaCPTypes.MYCP2].includes(data.page)) {
            if (context.user) {
              newData.data.userID = String(context.user.userId);

              if (data.page === oaCPTypes.CCP2) {
                newData.data.accountID = String(context.user.memberId);
              }
            } else { complete = false; }
          }
        }

        if (complete) {
          window.cancelIdleCallback(handle);
        }

        return newData;
      });
    }());
  }

  function topWindow(globalData) {
    globalData.update(data => {
      if ([oaCPTypes.CCP2, oaCPTypes.MYCP2].includes(data.page)) {
        getAPSData(globalData);
      }

      // no changes, update happens later
      return data;
    });
  }

  function topFrame(globalData) {
    globalData.update(data => {
      const newData = data;

      if (newData.page === oaCPTypes.ANYCP1) { // CP1, not PCP
        const userInfo = $('html > body li#userName div#user_name > b').textContent;
        const subscriptionSelector = $('html > body li#userName div#sel_sub_cell select');

        if (subscriptionSelector) {
          newData.page = oaCPTypes.CCP1;
          [, newData.data.accountID] = /.* \(Account ID: (\d+)\)/.exec(userInfo);

          if (subscriptionSelector.value === '0') { // 'All Domains' or whatever
            delete newData.data.subscriptionID;
          } else {
            newData.data.subscriptionID = subscriptionSelector.value;
          }
        } else {
          newData.page = oaCPTypes.MYCP1;
          [, newData.data.userID] = /.* \(User ID: (\d+)\)/.exec(userInfo);
        }
      }

      return newData;
    });
  }

  (() => {
    // Time to actually run all those functions
    const globalData = new GlobalData();

    if (window.top === window) {
      const oaInfo = getOAInfo();

      globalData.update(() => {
        if (!oaInfo) {
          return null;
        }

        const data = Object.assign({
          url: window.location.href,
          data: {},
        }, oaInfo);

        topWindow(globalData);

        return data;
      });
    } else {
      const frameHandlers = {
        topFrame,
        'aps-ui-0': getAPSData,
        'aps2-ui': getAPSData,
      };

      const { name } = window;

      if (name in frameHandlers) {
        frameHandlers[name](globalData);
      }
    }
  })();
}).toString();
