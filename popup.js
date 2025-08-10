// Constants
const STORAGE_KEY = 'enabled';
const FALLBACK_STORAGE_KEY = 'yt2embed_enabled';
const DEFAULT_ENABLED = true;

document.addEventListener('DOMContentLoaded', function() {
  
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  
  // Browser API detection
  function getAPI() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.declarativeNetRequest) {
      return chrome;
    } else if (typeof browser !== 'undefined' && browser.storage && browser.declarativeNetRequest) {
      return browser;
    }
    return null;
  }
  
  const browserAPI = getAPI();
  
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
      
      // Update declarativeNetRequest rules
      try {
        if (value) {
          // Enable entire ruleset
          browserAPI.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ["yt2embed_rules"]
          }).catch(error => {
            console.error('Error enabling ruleset:', error);
          });
        } else {
          // Disable entire ruleset
          browserAPI.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ["yt2embed_rules"]
          }).catch(error => {
            console.error('Error disabling ruleset:', error);
          });
        }
      } catch (error) {
        console.error('declarativeNetRequest error:', error);
      }
    } else {
      localStorage.setItem(FALLBACK_STORAGE_KEY, value.toString());
    }
  }
  
  // Load current state
  getEnabled().then(isEnabled => {
    updateUI(isEnabled);
  }).catch(error => {
    console.error('Error loading state:', error);
    status.textContent = 'Load error';
    updateUI(DEFAULT_ENABLED); // fallback to default state for existing users
  });
  
  // Handle toggle click
  toggle.addEventListener('click', function() {
    getEnabled().then(currentState => {
      const newState = !currentState;
      setEnabled(newState);
      updateUI(newState);
    }).catch(error => {
      console.error('Error in toggle:', error);
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