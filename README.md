# yt2embed

![yt2embed](https://raw.githubusercontent.com/rhnvrm/yt2embed/master/assets/icon_256.png)

Redirect Youtube Videos to the Embed Page

A browser extension that automatically redirects YouTube video and shorts pages to their embed equivalent, providing a cleaner viewing experience without distractions.

## Features

✅ **Auto-redirect** YouTube videos and shorts to embed pages  
✅ **Enable/Disable toggle** - Quick on/off switch via extension popup  
✅ **Cross-browser support** - Works on Chrome, Firefox, and other Chromium-based browsers  
✅ **Manifest V3** - Modern extension architecture with declarativeNetRequest API  
✅ **Persistent settings** - Your preference is remembered across browser sessions

## How it Works

The extension uses Manifest V3's `declarativeNetRequest` API to redirect:
- `youtube.com/watch?v=VIDEO_ID` → `youtube-nocookie.com/embed/VIDEO_ID`
- `youtube.com/shorts/VIDEO_ID` → `youtube-nocookie.com/embed/VIDEO_ID`

Click the extension icon to toggle the redirection on/off instantly.

---

### Installation

#### Firefox 

[![addon_firefox](https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-129x45px.8041c789.png)](https://addons.mozilla.org/en-US/firefox/addon/yt2embed/)

#### Chrome
[![addon_chrome](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/hgfpekconaphbedblngiilgojgjhodpp?authuser=1&hl=en)