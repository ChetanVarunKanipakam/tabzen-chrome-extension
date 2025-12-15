document.addEventListener("DOMContentLoaded", async () => {
  const groupBtn = document.getElementById("groupBtn");
  const focusBtn = document.getElementById("focusBtn");
  const stopBtn = document.getElementById("stopBtn");
  const tabCountSpan = document.getElementById("tabCount");

  // 1. Get current tab count for Analytics
  const tabs = await chrome.tabs.query({ currentWindow: true });
  tabCountSpan.textContent = tabs.length;

  // 2. Check Storage for Focus Mode State (to keep button state consistent)
  chrome.storage.sync.get(["isFocusMode"], (result) => {
    if (result.isFocusMode) {
      focusBtn.style.display = "none";
      stopBtn.style.display = "block";
    }
  });

  // 3. Handle Group Tabs Click
  groupBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "GROUP_TABS" });
    // Update tab count display
    setTimeout(async () => {
      const t = await chrome.tabs.query({ currentWindow: true });
      tabCountSpan.textContent = t.length;
    }, 500);
  });

  // 4. Handle Start Focus
  focusBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "START_FOCUS" });
    chrome.storage.sync.set({ isFocusMode: true });
    focusBtn.style.display = "none";
    stopBtn.style.display = "block";
  });

  // 5. Handle Stop Focus
  stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "STOP_FOCUS" });
    chrome.storage.sync.set({ isFocusMode: false });
    focusBtn.style.display = "block";
    stopBtn.style.display = "none";
  });
});