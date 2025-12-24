document.addEventListener("DOMContentLoaded", async () => {
  const groupBtn = document.getElementById("groupBtn");
  const ungroupBtn = document.getElementById("ungroupBtn");
  const dedupBtn = document.getElementById("dedupBtn");
  const focusBtn = document.getElementById("focusBtn");
  const stopBtn = document.getElementById("stopBtn");
  
  const tabCountSpan = document.getElementById("tabCount");
  const sessionCountSpan = document.getElementById("sessionCount");
  const statusBadge = document.getElementById("statusBadge");

  // --- Helper: Update Stats UI ---
  const updateUI = async () => {
    // Tab Count
    const tabs = await chrome.tabs.query({ currentWindow: true });
    tabCountSpan.textContent = tabs.length;

    // Focus State
    chrome.storage.sync.get(["isFocusMode", "sessionsCompleted"], (res) => {
      // Toggle Buttons
      if (res.isFocusMode) {
        focusBtn.style.display = "none";
        stopBtn.style.display = "block";
        statusBadge.textContent = "ON";
        statusBadge.className = "badge active";
      } else {
        focusBtn.style.display = "block";
        stopBtn.style.display = "none";
        statusBadge.textContent = "OFF";
        statusBadge.className = "badge inactive";
      }

      // Mindfulness Stats
      sessionCountSpan.textContent = res.sessionsCompleted || 0;
    });
  };

  // Initial Load
  updateUI();

  // --- Event Listeners ---

  groupBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "GROUP_TABS" }, () => setTimeout(updateUI, 200));
  });

  ungroupBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "UNGROUP_TABS" }, () => setTimeout(updateUI, 200));
  });

  dedupBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "CLOSE_DUPLICATES" }, (response) => {
      // Optional: Show a small toast notification or update text
      setTimeout(updateUI, 200);
    });
  });

  focusBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "START_FOCUS" });
    chrome.storage.sync.set({ isFocusMode: true });
    updateUI();
  });

  stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "STOP_FOCUS" });
    chrome.storage.sync.set({ isFocusMode: false });
    updateUI();
  });
});