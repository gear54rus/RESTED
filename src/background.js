const tabAPSData = {};

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(data => {
    const tabID = port.sender.tab.id;

    tabAPSData[tabID] = data;
    chrome.browserAction.setBadgeText({
      tabId: tabID,
      text: data ? '0' : '',
    });
  });
});

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.extension.getURL('dist/index.html'),
  });
});
