const oaTabData = {};

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(tabData => {
    const tabID = port.sender.tab.id;
    let text = '';

    if (tabData) {
      oaTabData[tabID] = tabData;
      text = String(Object.keys(tabData.data).length);
    } else {
      delete oaTabData[tabID];
    }

    chrome.browserAction.setBadgeText({
      tabId: tabID,
      text,
    });
  });
});

chrome.browserAction.onClicked.addListener(({ id: tabID }) => {
  chrome.tabs.create({
    url: chrome.extension.getURL(`dist/index.html${oaTabData[tabID] ? `#${JSON.stringify(oaTabData[tabID])}` : ''}`),
  });
});
