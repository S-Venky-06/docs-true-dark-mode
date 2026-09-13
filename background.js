// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    chrome.storage.local.get(['darkModeEnabled', 'paperBrightness'], (result) => {
      const isEnabled = result.darkModeEnabled !== false;
      const newState = !isEnabled;
      const brightness = result.paperBrightness || "110";
      
      // Update storage
      chrome.storage.local.set({ darkModeEnabled: newState });

      // Broadcast the toggle to all Google Docs and Drive tabs
      chrome.tabs.query({ url: ["*://docs.google.com/*", "*://drive.google.com/sharing/*"] }, (tabs) => {
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { action: "toggleDarkMode", enabled: newState }).catch(() => {});
          chrome.tabs.sendMessage(tab.id, { action: "updateBrightness", brightness: brightness }).catch(() => {});
        }
      });
    });
  }
});
