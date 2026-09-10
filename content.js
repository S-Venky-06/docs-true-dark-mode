// Initialize state
function initDarkMode() {
  chrome.storage.local.get(['darkModeEnabled', 'paperBrightness'], function(result) {
    const isEnabled = result.darkModeEnabled !== false; // Default to true
    toggleDarkMode(isEnabled);
    
    const brightness = result.paperBrightness || "110";
    setBrightness(brightness);
  });
}

// Function to apply or remove the dark mode class
function toggleDarkMode(isEnabled) {
  if (isEnabled) {
    document.documentElement.classList.add('gdocs-dark-mode');
    if (window.location.pathname.includes('/sharing/')) {
      document.documentElement.classList.add('gdocs-share-iframe');
    }
  } else {
    document.documentElement.classList.remove('gdocs-dark-mode');
    document.documentElement.classList.remove('gdocs-share-iframe');
  }
}

// Function to update paper brightness
function setBrightness(val) {
  // Convert percentage to a float for CSS filter brightness()
  const brightnessFloat = (parseInt(val) / 100).toFixed(2);
  document.documentElement.style.setProperty('--gdocs-paper-brightness', brightnessFloat);
}

// Run initialization safely
if (document.documentElement) {
  initDarkMode();
} else {
  const observer = new MutationObserver(() => {
    if (document.documentElement) {
      observer.disconnect();
      initDarkMode();
    }
  });
  observer.observe(document, { childList: true });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleDarkMode') {
    toggleDarkMode(request.enabled);
    sendResponse({status: "success"});
  } else if (request.action === 'updateBrightness') {
    setBrightness(request.brightness);
    sendResponse({status: "success"});
  }
  return true; // Keep message channel open
});

// Keyboard shortcut (Alt+D)
document.addEventListener('keydown', function(e) {
  // Only trigger shortcut in the top-level window, not inside iframes
  if (window !== window.top) return;
  
  if (e.altKey && e.key.toLowerCase() === 'd') {
    chrome.storage.local.get(['darkModeEnabled'], function(result) {
      const isEnabled = result.darkModeEnabled !== false;
      const newState = !isEnabled;
      
      chrome.storage.local.set({darkModeEnabled: newState});
      toggleDarkMode(newState);
    });
  }
});
