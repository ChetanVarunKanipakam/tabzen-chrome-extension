// background.js

// 1. LISTENER FOR MESSAGES
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "GROUP_TABS":
      groupTabsLogic().then((count) => sendResponse({ msg: `Grouped ${count} domains` }));
      break;
    case "UNGROUP_TABS":
      ungroupTabsLogic().then(() => sendResponse({ msg: "Tabs Ungrouped" }));
      break;
    case "CLOSE_DUPLICATES":
      closeDuplicatesLogic().then((count) => sendResponse({ msg: `Closed ${count} duplicates` }));
      break;
    case "START_FOCUS":
      chrome.alarms.create("mindfulnessTimer", { periodInMinutes: 30 });
      sendResponse({ status: "Focus Mode Started" });
      break;
    case "STOP_FOCUS":
      chrome.alarms.clear("mindfulnessTimer");
      sendResponse({ status: "Focus Mode Stopped" });
      break;
    case "SESSION_COMPLETE":
      // Increment stats in storage when user finishes breathing
      incrementStats();
      break;
  }
  return true; // Required for async sendResponse
});

// 2. ALARM LISTENER
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "mindfulnessTimer") {
    triggerBreathingExercise();
  }
});

function triggerBreathingExercise() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // Use scripting to ensure code runs even if content script was sleeping
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['contentScript.js']
      }, () => {
        // Once injected (or if already there), send the message
        chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_BREATHING" })
          .catch(err => console.log("Tab busy or restricted:", err));
      });
    }
  });
}

// 3. LOGIC FUNCTIONS

async function groupTabsLogic() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groups = {};

  // Group by Domain
  tabs.forEach((tab) => {
    try {
      if (tab.pinned) return; // Don't group pinned tabs
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', ''); // Clean 'www'
      
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(tab.id);
    } catch (e) { /* ignore system tabs */ }
  });

  let groupCount = 0;
  for (const [domain, tabIds] of Object.entries(groups)) {
    if (tabIds.length > 1) { 
      const groupID = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupID, { title: domain, collapsed: true });
      groupCount++;
    }
  }
  return groupCount;
}

async function ungroupTabsLogic() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabsToUngroup = tabs.map(t => t.id);
  if (tabsToUngroup.length > 0) {
    await chrome.tabs.ungroup(tabsToUngroup);
  }
}

async function closeDuplicatesLogic() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const seenUrls = new Set();
  const removeIds = [];

  tabs.forEach((tab) => {
    if (seenUrls.has(tab.url)) {
      removeIds.push(tab.id);
    } else {
      seenUrls.add(tab.url);
    }
  });

  if (removeIds.length > 0) {
    await chrome.tabs.remove(removeIds);
  }
  return removeIds.length;
}

function incrementStats() {
  chrome.storage.sync.get(["sessionsCompleted"], (res) => {
    const current = res.sessionsCompleted || 0;
    chrome.storage.sync.set({ sessionsCompleted: current + 1 });
  });
}