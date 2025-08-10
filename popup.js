// Extension state constants
const STORAGE_KEY = 'enabled';
const FALLBACK_STORAGE_KEY = 'yt2embed_enabled';
const DEFAULT_ENABLED = true;

// Privacy mode constants
const NOCOOKIE_KEY = 'nocookie';
const FALLBACK_NOCOOKIE_KEY = 'yt2embed_nocookie';
const DEFAULT_NOCOOKIE = true; // Default to privacy mode

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
  
  // Generic storage getter function
  function getStorageValue(key, fallbackKey, defaultValue = true) {
    if (browserAPI) {
      return new Promise((resolve) => {
        browserAPI.storage.local.get([key], function(result) {
          if (browserAPI.runtime.lastError) {
            console.log(`Using localStorage fallback for ${key} due to:`, browserAPI.runtime.lastError);
            const value = localStorage.getItem(fallbackKey) !== 'false';
            resolve(value);
          } else {
            resolve(result[key] !== false);
          }
        });
      });
    } else {
      const value = localStorage.getItem(fallbackKey) !== 'false';
      return Promise.resolve(value);
    }
  }
  
  // Generic storage setter function
  function setStorageValue(key, fallbackKey, value) {
    if (browserAPI) {
      const storageObj = {};
      storageObj[key] = value;
      browserAPI.storage.local.set(storageObj, function() {
        if (browserAPI.runtime.lastError) {
          localStorage.setItem(fallbackKey, value.toString());
        }
      });
      // Update rules after any storage change
      updateDynamicRules();
    } else {
      localStorage.setItem(fallbackKey, value.toString());
    }
  }
  
  // Convenience functions for specific values
  const getEnabled = () => getStorageValue(STORAGE_KEY, FALLBACK_STORAGE_KEY, DEFAULT_ENABLED);
  const getNocookie = () => getStorageValue(NOCOOKIE_KEY, FALLBACK_NOCOOKIE_KEY, DEFAULT_NOCOOKIE);
  const setEnabled = (value) => setStorageValue(STORAGE_KEY, FALLBACK_STORAGE_KEY, value);
  const setNocookie = (value) => setStorageValue(NOCOOKIE_KEY, FALLBACK_NOCOOKIE_KEY, value);
  
  async function updateDynamicRules() {
    // Early return if no browser API available
    if (!browserAPI || !browserAPI.declarativeNetRequest) {
      console.warn('Browser API or declarativeNetRequest not available');
      return;
    }
    
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
      
      // Add defensive checks for rule structure
      const needsUpdate = !existingRules.find(rule => 
        rule && 
        rule.id === 1 && 
        rule.action && 
        rule.action.redirect && 
        rule.action.redirect.regexSubstitution && 
        rule.action.redirect.regexSubstitution.includes(domain)
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
      throw error; // Re-throw to allow callers to handle
    }
  }
  
  // Load current state and initialize rules
  Promise.all([getEnabled(), getNocookie()]).then(([isEnabled, isNocookie]) => {
    updateUI(isEnabled, isNocookie);
    // Initialize dynamic rules based on current preferences
    updateDynamicRules().catch(error => {
      console.error('Failed to initialize rules:', error);
      showError('Failed to initialize');
    });
  }).catch(error => {
    console.error('Error loading state:', error);
    showError('Load error');
    updateUI(DEFAULT_ENABLED, DEFAULT_NOCOOKIE);
  });
  
  // Handle extension toggle click
  toggle.addEventListener('click', function() {
    Promise.all([getEnabled(), getNocookie()]).then(([currentEnabled, currentNocookie]) => {
      const newEnabled = !currentEnabled;
      setEnabled(newEnabled);
      updateUI(newEnabled, currentNocookie);
      clearError();
    }).catch(error => {
      console.error('Error in toggle:', error);
      showError('Toggle failed');
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
      clearError();
    }).catch(error => {
      console.error('Error in nocookie toggle:', error);
      showError('Toggle failed');
    });
  });
  
  function updateUI(isEnabled, isNocookie) {
    // Extension enabled/disabled toggle
    if (isEnabled) {
      toggle.classList.add('enabled');
      status.textContent = 'Enabled';
      status.style.color = ''; // Reset color
    } else {
      toggle.classList.remove('enabled');
      status.textContent = 'Disabled';
      status.style.color = ''; // Reset color
    }
    
    // Privacy mode (nocookie) toggle
    if (isNocookie) {
      nocookieToggle.classList.add('enabled');
    } else {
      nocookieToggle.classList.remove('enabled');
    }
    nocookieStatus.textContent = 'Privacy Mode';
    nocookieStatus.style.color = ''; // Reset color
    
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
  
  function showError(message) {
    status.textContent = message;
    status.style.color = '#d32f2f';
    nocookieStatus.style.color = '#d32f2f';
  }
  
  function clearError() {
    status.style.color = '';
    nocookieStatus.style.color = '';
  }
});