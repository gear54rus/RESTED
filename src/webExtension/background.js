const {
  browserAction,
  runtime,
  tabs,
  extension,
} = chrome;

const oaTabData = {};
let badgeTitle = '';

function setOADataTitle(title, tabID) {
  const noDataTitle = 'No OA data was found on the page';
  const details = { title: `${badgeTitle}\n\n${title || noDataTitle}` };

  if (tabID !== undefined) {
    details.tabId = tabID;
  }

  return browserAction.setTitle(details);
}

browserAction.getTitle({}, title => {
  badgeTitle = title;
  setOADataTitle();
});

// The color of CCPv2 header, are we stylish now?:D
browserAction.setBadgeBackgroundColor({ color: '#343b59' });

function setTitleFromData(tabID, tabData) {
  const {
    page,
    versions,
    data,
  } = tabData;

  let title = `OA ${page ? `${page} ` : ''}page detected. Following data found:\n`;

  if ('oa' in versions) title += `- OA version: ${versions.oa}\n`;
  if ('runtime' in versions) title += `- UI runtime version: ${versions.runtime}\n`;

  if ('apsToken' in data) {
    const time = new Date(data.apsToken.receivedAt);
    title += `- APS token, received at ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}\n`;
  }

  if ('accountID' in data) title += `- Account ID: ${data.accountID}\n`;
  if ('subscriptionID' in data) title += `- Subscription ID: ${data.subscriptionID}\n`;
  if ('userID' in data) title += `- User ID: ${data.userID}\n`;

  title += '\nSome of the data from this page will be used if you click this button now';

  setOADataTitle(title, tabID);
}

runtime.onConnect.addListener(port => {
  port.onMessage.addListener(tabData => {
    const tabID = port.sender.tab.id;
    let text = '';

    if (tabData) {
      oaTabData[tabID] = tabData;
      text = String(Object.keys(tabData.data).length);
      setTitleFromData(tabID, tabData);
    } else {
      delete oaTabData[tabID];
      setOADataTitle(null, tabID);
    }

    browserAction.setBadgeText({
      tabId: tabID,
      text,
    });
  });
});

browserAction.onClicked.addListener(({ id: tabID }) => {
  tabs.create({
    url: extension.getURL(`dist/index.html${oaTabData[tabID] ? `#${JSON.stringify(oaTabData[tabID])}` : ''}`),
  });
});
