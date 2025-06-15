chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notify") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Briefly",
      message: message.message,
    });
  }
  return true;
});
