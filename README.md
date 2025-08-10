# yt2embed

![yt2embed](https://raw.githubusercontent.com/rhnvrm/yt2embed/master/assets/icon_256.png)

Redirect Youtube Videos to the Embed Page

A browser extension that automatically redirects YouTube video and shorts pages to their embed equivalent, providing a cleaner viewing experience without distractions.

## Features

✅ **Auto-redirect** YouTube videos and shorts to embed pages  
✅ **Enable/Disable toggle** - Quick on/off switch via extension popup  
✅ **Privacy Mode toggle** - Choose between youtube-nocookie.com (private) or youtube.com (with login)  
✅ **Cross-browser support** - Works on Chrome, Firefox, and other Chromium-based browsers  
✅ **Manifest V3** - Modern extension architecture with declarativeNetRequest API  
✅ **Persistent settings** - Your preferences are remembered across browser sessions

## How it Works

The extension uses Manifest V3's `declarativeNetRequest` API to redirect:
- `youtube.com/watch?v=VIDEO_ID` → `youtube-nocookie.com/embed/VIDEO_ID` (Privacy Mode ON)
- `youtube.com/shorts/VIDEO_ID` → `youtube-nocookie.com/embed/VIDEO_ID` (Privacy Mode ON)
- `youtube.com/watch?v=VIDEO_ID` → `youtube.com/embed/VIDEO_ID` (Privacy Mode OFF)
- `youtube.com/shorts/VIDEO_ID` → `youtube.com/embed/VIDEO_ID` (Privacy Mode OFF)

Click the extension icon to access settings:
- **Toggle extension** on/off instantly
- **Privacy Mode** - ON for no cookies/better privacy, OFF to maintain login state

---

## Installation

### Firefox 

[![addon_firefox](https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-129x45px.8041c789.png)](https://addons.mozilla.org/en-US/firefox/addon/yt2embed/)

### Chrome
[![addon_chrome](https://developer.chrome.com/static/docs/webstore/branding/image/tbyBjqi7Zu733AAKA5n4.png)](https://chrome.google.com/webstore/detail/hgfpekconaphbedblngiilgojgjhodpp)

---

## Development

### Building Extensions

```bash
# Build Chrome extension
make chrome

# Build Firefox extension
make firefox
```

### Releases

This project uses automated GitHub Actions workflows:
- **Tag a release**: `git tag v0.2.0 && git push origin v0.2.0`
- **Automatic builds**: Creates Chrome/Firefox artifacts on GitHub releases
- **Firefox publishing**: Automatically uploads to Mozilla Add-ons (AMO)
- **Chrome publishing**: Manual upload to Chrome Web Store