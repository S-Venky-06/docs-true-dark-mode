document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('darkModeToggle');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');
  const statusDot = document.getElementById('statusDot');
  const themeStatus = document.getElementById('themeStatus');

  function updateThemeStatus(isEnabled) {
    statusDot.classList.toggle('active', isEnabled);
    themeStatus.textContent = isEnabled
      ? 'Active across open documents'
      : 'Theme is paused across open documents';
  }

  // Function to update the slider's track fill color
  function updateSliderFill(val) {
    const min = Number(brightnessSlider.min) || 50;
    const max = Number(brightnessSlider.max) || 150;
    const percentage = ((val - min) / (max - min)) * 100;
    brightnessSlider.style.background = `linear-gradient(to right, #8ab4f8 ${percentage}%, #374151 ${percentage}%)`;
  }

  // Load current state
  chrome.storage.local.get(['darkModeEnabled', 'paperBrightness'], function(result) {
    const isEnabled = result.darkModeEnabled !== false;
    toggle.checked = isEnabled; // Default to true
    
    updateThemeStatus(isEnabled);
    
    if (result.paperBrightness !== undefined) {
      brightnessSlider.value = result.paperBrightness;
      brightnessValue.textContent = result.paperBrightness + '%';
      updateSliderFill(result.paperBrightness);
    } else {
      updateSliderFill(110);
    }
  });

  // Listen for toggle changes
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    
    updateThemeStatus(isEnabled);
    
    // Save state
    chrome.storage.local.set({darkModeEnabled: isEnabled});

    // Broadcast to all Google Docs tabs
    chrome.tabs.query({url: ["*://docs.google.com/*", "*://drive.google.com/sharing/*"]}, function(tabs) {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {action: "toggleDarkMode", enabled: isEnabled}).catch(() => {});
      }
    });
  });

  // Listen for brightness slider changes with a debounce for cross-tab sync
  let debounceTimer = null;

  brightnessSlider.addEventListener('input', function() {
    const val = brightnessSlider.value;
    brightnessValue.textContent = val + '%';
    updateSliderFill(val);
    
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      chrome.storage.local.set({paperBrightness: val});
      
      chrome.tabs.query({url: ["*://docs.google.com/*", "*://drive.google.com/sharing/*"]}, function(tabs) {
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, {action: "updateBrightness", brightness: val}).catch(() => {});
        }
      });
    }, 50);
  });
});
