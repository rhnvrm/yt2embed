// Constants
const STORAGE_KEY = 'enabled';
const DEFAULT_ENABLED = true;

let isEnabled = DEFAULT_ENABLED;

// Browser API detection
function getStorageAPI() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome;
  } else if (typeof browser !== 'undefined' && browser.storage) {
    return browser;
  }
  return null;
}

const browserAPI = getStorageAPI();

if (browserAPI) {
  browserAPI.storage.local.get([STORAGE_KEY], function(result) {
    if (!browserAPI.runtime.lastError) {
      isEnabled = result[STORAGE_KEY] !== false;
    }
  });

  // Listen for storage changes
  browserAPI.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      isEnabled = changes[STORAGE_KEY].newValue !== false;
    }
  });

  // Listen for messages from popup
  if (browserAPI.runtime && browserAPI.runtime.onMessage) {
    browserAPI.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'toggleEnabled') {
        isEnabled = request.enabled;
      }
    });
  }
}

function yt_redirector(requestDetails)
{
  if (!isEnabled) {
    return {};
  }
  
  var u = new URL(requestDetails.url)
  var v = u.searchParams.get("v")
  if (v === "") {
    return {};
  }
  return {
    redirectUrl: "https://www.youtube-nocookie.com/embed/" + v
  };
}

function yts_redirector(requestDetails)
{
  if (!isEnabled) {
    return {};
  }
  
  var u = new URL(requestDetails.url)
  var endpt = u.pathname.split("/").slice(-2)
  var v = u.pathname.split("/").slice(-1)
  if (v[0] === "" && !(endpt === "shorts")) {
    return {};
  }
  return {
    redirectUrl: "https://www.youtube-nocookie.com/embed/" + v[0]
  };
}

browser.webRequest.onBeforeRequest.addListener(
  yt_redirector,
  {
    urls: [
      '*://www.youtube.com/watch*',
      '*://youtube.com/watch*'
    ]
  },
  ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
  yts_redirector,
  {
    urls: [
      '*://www.youtube.com/shorts/*',
      '*://youtube.com/shorts/*'
    ]
  },
  ["blocking"]
);