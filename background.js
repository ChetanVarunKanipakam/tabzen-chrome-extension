// background.js

// 1. LISTENER FOR MESSAGES FROM POPUP
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GROUP_TABS") {
    groupTabsLogic();
    sendResponse({ status: "Grouping started" });
  } else if (request.action === "START_FOCUS") {
    // Set an alarm for mindfulness every 30 minutes
    chrome.alarms.create("mindfulnessTimer", { periodInMinutes: 30 });
    sendResponse({ status: "Focus Mode Started" });
  } else if (request.action === "STOP_FOCUS") {
    chrome.alarms.clear("mindfulnessTimer");
    sendResponse({ status: "Focus Mode Stopped" });
  }
});

// 2. ALARM LISTENER (Mindfulness Trigger)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "mindfulnessTimer") {
    // Send message to the active tab to show the breathing exercise
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_BREATHING" });
      }
    });
  }
});

// 3. TAB GROUPING LOGIC
async function groupTabsLogic() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  
  // Group by Domain (e.g., google.com, youtube.com)
  const groups = {};
  
  tabs.forEach((tab) => {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(tab.id);
    } catch (e) {
      // Ignore special chrome:// tabs
    }
  });

  // Create the groups using Chrome API
  for (const [domain, tabIds] of Object.entries(groups)) {
    if (tabIds.length > 1) { // Only group if there are 2+ tabs of same domain
      const groupID = await chrome.tabs.group({ tabIds });
      chrome.tabGroups.update(groupID, { title: domain, collapsed: true });
    }
  }
}