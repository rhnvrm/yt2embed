document.addEventListener('DOMContentLoaded', function() {
  // Constants
  const STORAGE_KEY = 'enabled';
  const FALLBACK_STORAGE_KEY = 'yt2embed_enabled';
  const DEFAULT_ENABLED = true;
  
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  
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
  
  function getEnabled() {
    if (browserAPI) {
      return new Promise((resolve) => {
        browserAPI.storage.local.get([STORAGE_KEY], function(result) {
          if (browserAPI.runtime.lastError) {
            console.log('Using localStorage fallback due to:', browserAPI.runtime.lastError);
            const enabled = localStorage.getItem(FALLBACK_STORAGE_KEY) !== 'false';
            resolve(enabled);
          } else {
            resolve(result[STORAGE_KEY] !== false);
          }
        });
      });
    } else {
      // Fallback to localStorage
      const enabled = localStorage.getItem(FALLBACK_STORAGE_KEY) !== 'false';
      return Promise.resolve(enabled);
    }
  }
  
  function setEnabled(value) {
    if (browserAPI) {
      const storageObj = {};
      storageObj[STORAGE_KEY] = value;
      browserAPI.storage.local.set(storageObj, function() {
        if (browserAPI.runtime.lastError) {
          localStorage.setItem(FALLBACK_STORAGE_KEY, value.toString());
        }
      });
    } else {
      localStorage.setItem(FALLBACK_STORAGE_KEY, value.toString());
    }
    
    // Notify background script
    try {
      if (browserAPI && browserAPI.runtime) {
        browserAPI.runtime.sendMessage({ action: 'toggleEnabled', enabled: value });
      }
    } catch (e) {
      console.log('Could not send message to background script:', e);
    }
  }
  
  // Load current state
  getEnabled().then(isEnabled => {
    updateUI(isEnabled);
  });
  
  // Handle toggle click
  toggle.addEventListener('click', function() {
    getEnabled().then(currentState => {
      const newState = !currentState;
      setEnabled(newState);
      updateUI(newState);
    });
  });
  
  function updateUI(isEnabled) {
    if (isEnabled) {
      toggle.classList.add('enabled');
      status.textContent = 'Enabled';
    } else {
      toggle.classList.remove('enabled');
      status.textContent = 'Disabled';
    }
  }
});