document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('darkModeToggle');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');

  // Load current state
  chrome.storage.local.get(['darkModeEnabled', 'paperBrightness'], function(result) {
    toggle.checked = result.darkModeEnabled !== false; // Default to true
    
    if (result.paperBrightness !== undefined) {
      brightnessSlider.value = result.paperBrightness;
      brightnessValue.textContent = result.paperBrightness + '%';
    }
  });

  // Listen for toggle changes
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    
    // Save state
    chrome.storage.local.set({darkModeEnabled: isEnabled});

    // Send message to active tab to update immediately
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url.includes("docs.google.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleDarkMode", enabled: isEnabled});
      }
    });
  });

  // Listen for brightness slider changes
  brightnessSlider.addEventListener('input', function() {
    const val = brightnessSlider.value;
    brightnessValue.textContent = val + '%';
    
    chrome.storage.local.set({paperBrightness: val});
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url.includes("docs.google.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "updateBrightness", brightness: val});
      }
    });
  });
});
