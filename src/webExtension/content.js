// The most dangerous, stupid and unnecessary subsystem in the entire extension.
//
// We can inject code to determine if each individual frame of the page contains
// OA or APS data. But we can't access top frame from sub-frame in BA (because SOP)
// So we pass messages via 'GlobalData' class. It acts differently based on whether
// it is created in top frame or not and aims to make data from all frames available
// in the top frame (where content script scoops it up).

// Next, APS data is pulled from JS context of the page but content scripts for some
// dumb reason don't have access to it, only to DOM (effectively only to text on page).
// So... we again pass messages. But this time via event and a DOM element. We set
// the text of the element to JSON representation of the passed data and then fire
// the event in the DOM to which content script is already subscribed. Ugly code for
// no reason other than security theater.

// Finally, we need that OA or APS data in the background script (since it actually
// handles opening the RESTED APS tab and can pass data to it). But again content
// scripts can't directly access anything inside the background script. So... you
// guessed it! We pass messages (via chrome.runtime.connect)! 3 message passing
// garbage constructs for one simple feature, might be the new record!

import { CONTENT_SCRIPT_NS, OA_CP_TYPES } from 'constants/constants';
import injectFunction from './inject';

function randomID() { return Math.random().toString(36).substring(7); }

const injector = document.createElement('script');
const transferNodeID = `${CONTENT_SCRIPT_NS}${randomID()}`;
const transferEventID = `${CONTENT_SCRIPT_NS}${randomID()}`;

injector.textContent = `(${injectFunction})('${CONTENT_SCRIPT_NS}', '${transferNodeID}', '${transferEventID}', '${JSON.stringify(OA_CP_TYPES)}')`;

document.head.appendChild(injector);
injector.parentElement.removeChild(injector);

const transferNode = document.getElementById(transferNodeID);
let port;

function sendData() {
  port.postMessage(JSON.parse(transferNode.textContent));
  transferNode.textContent = '';
}

if (transferNode) {
  port = chrome.runtime.connect();
  transferNode.addEventListener(transferEventID, sendData);

  if (transferNode.textContent.length > 0) { sendData(); }
}
