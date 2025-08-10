// Constants
const STORAGE_KEY = 'enabled';
const FALLBACK_STORAGE_KEY = 'yt2embed_enabled';
const DEFAULT_ENABLED = true;

const NOCOOKIE_KEY = 'nocookie';
const FALLBACK_NOCOOKIE_KEY = 'yt2embed_nocookie';
const DEFAULT_NOCOOKIE = true; // Default to privacy mode (current behavior)

document.addEventListener('DOMContentLoaded', function() {
  
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  const nocookieToggle = document.getElementById('nocookie-toggle');
  const nocookieStatus = document.getElementById('nocookie-status');
  const infoIcon = document.querySelector('.info-icon');
  
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
  
  function getNocookie() {
    if (browserAPI) {
      return new Promise((resolve) => {
        browserAPI.storage.local.get([NOCOOKIE_KEY], function(result) {
          if (browserAPI.runtime.lastError) {
            console.log('Using localStorage fallback for nocookie due to:', browserAPI.runtime.lastError);
            const nocookie = localStorage.getItem(FALLBACK_NOCOOKIE_KEY) !== 'false';
            resolve(nocookie);
          } else {
            resolve(result[NOCOOKIE_KEY] !== false);
          }
        });
      });
    } else {
      // Fallback to localStorage
      const nocookie = localStorage.getItem(FALLBACK_NOCOOKIE_KEY) !== 'false';
      return Promise.resolve(nocookie);
    }
  }
  
  async function updateDynamicRules() {
    if (!browserAPI) return;
    
    try {
      const [enabled, nocookie] = await Promise.all([getEnabled(), getNocookie()]);
      
      if (!enabled) {
        // Extension disabled - remove all dynamic rules
        await browserAPI.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [1, 2]
        });
        return;
      }
      
      // Extension enabled - set up rules based on nocookie preference
      const domain = nocookie ? 'youtube-nocookie.com' : 'youtube.com';
      
      // Check if rules need updating to avoid unnecessary API calls
      const existingRules = await browserAPI.declarativeNetRequest.getDynamicRules();
      const needsUpdate = !existingRules.find(rule => 
        rule.id === 1 && rule.action.redirect.regexSubstitution.includes(domain)
      );
      
      if (!needsUpdate) return; // Rules are already correct
      
      const newRules = [
        {
          "id": 1,
          "priority": 1,
          "action": {
            "type": "redirect",
            "redirect": {
              "regexSubstitution": `https://www.${domain}/embed/\\1`
            }
          },
          "condition": {
            "regexFilter": ".*youtube\\.com/watch\\?v=([^&]+).*",
            "resourceTypes": ["main_frame"]
          }
        },
        {
          "id": 2,
          "priority": 1,
          "action": {
            "type": "redirect", 
            "redirect": {
              "regexSubstitution": `https://www.${domain}/embed/\\1`
            }
          },
          "condition": {
            "regexFilter": ".*youtube\\.com/shorts/([^&?]+).*",
            "resourceTypes": ["main_frame"]
          }
        }
      ];
      
      await browserAPI.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2],
        addRules: newRules
      });
      
    } catch (error) {
      console.error('Error updating dynamic rules:', error);
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
      
      // Update rules based on new enabled state
      updateDynamicRules();
    } else {
      localStorage.setItem(FALLBACK_STORAGE_KEY, value.toString());
    }
  }
  
  function setNocookie(value) {
    if (browserAPI) {
      const storageObj = {};
      storageObj[NOCOOKIE_KEY] = value;
      browserAPI.storage.local.set(storageObj, function() {
        if (browserAPI.runtime.lastError) {
          localStorage.setItem(FALLBACK_NOCOOKIE_KEY, value.toString());
        }
      });
      
      // Update rules based on new nocookie preference
      updateDynamicRules();
    } else {
      localStorage.setItem(FALLBACK_NOCOOKIE_KEY, value.toString());
    }
  }
  
  // Load current state and initialize rules
  Promise.all([getEnabled(), getNocookie()]).then(([isEnabled, isNocookie]) => {
    updateUI(isEnabled, isNocookie);
    // Initialize dynamic rules based on current preferences
    updateDynamicRules();
  }).catch(error => {
    console.error('Error loading state:', error);
    status.textContent = 'Load error';
    nocookieStatus.textContent = 'Load error';
    updateUI(DEFAULT_ENABLED, DEFAULT_NOCOOKIE);
  });
  
  // Handle extension toggle click
  toggle.addEventListener('click', function() {
    Promise.all([getEnabled(), getNocookie()]).then(([currentEnabled, currentNocookie]) => {
      const newEnabled = !currentEnabled;
      setEnabled(newEnabled);
      updateUI(newEnabled, currentNocookie);
    }).catch(error => {
      console.error('Error in toggle:', error);
    });
  });
  
  // Handle nocookie toggle click
  nocookieToggle.addEventListener('click', function() {
    Promise.all([getEnabled(), getNocookie()]).then(([currentEnabled, currentNocookie]) => {
      // Don't allow toggling privacy mode if extension is disabled
      if (!currentEnabled) return;
      
      const newNocookie = !currentNocookie;
      setNocookie(newNocookie);
      updateUI(currentEnabled, newNocookie);
    }).catch(error => {
      console.error('Error in nocookie toggle:', error);
    });
  });
  
  function updateUI(isEnabled, isNocookie) {
    // Extension enabled/disabled toggle
    if (isEnabled) {
      toggle.classList.add('enabled');
      status.textContent = 'Enabled';
    } else {
      toggle.classList.remove('enabled');
      status.textContent = 'Disabled';
    }
    
    // Privacy mode (nocookie) toggle
    if (isNocookie) {
      nocookieToggle.classList.add('enabled');
    } else {
      nocookieToggle.classList.remove('enabled');
    }
    nocookieStatus.textContent = 'Privacy Mode';
    
    // Disable/enable privacy mode controls based on extension state
    if (isEnabled) {
      nocookieToggle.classList.remove('disabled');
      nocookieStatus.classList.remove('disabled');
      infoIcon.classList.remove('disabled');
    } else {
      nocookieToggle.classList.add('disabled');
      nocookieStatus.classList.add('disabled');
      infoIcon.classList.add('disabled');
    }
  }
});