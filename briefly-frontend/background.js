// Set the side panel to open when the extension action is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notify") {
    // Create a simple notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Briefly",
      message: message.message,
    });
  }
  return true;
});
