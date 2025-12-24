// contentScript.js

// Inject CSS for the overlay dynamically
const style = document.createElement('style');
style.innerHTML = `
  #tabzen-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(5px);
    display: flex; justify-content: center; align-items: center;
    z-index: 2147483647; font-family: 'Segoe UI', sans-serif;
    color: white; opacity: 0; animation: tz-fadein 0.5s forwards;
  }
  .tabzen-modal {
    text-align: center;
    background: #1e1e1e; padding: 40px; border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid #333;
  }
  .breathing-circle {
    width: 100px; height: 100px; background: #61dafb;
    border-radius: 50%; margin: 30px auto;
    box-shadow: 0 0 20px #61dafb;
    animation: tz-breathe 4s infinite ease-in-out;
  }
  #tabzen-close {
    background: transparent; border: 2px solid #61dafb;
    color: #61dafb; padding: 10px 20px; font-size: 16px;
    border-radius: 5px; cursor: pointer; transition: 0.3s;
  }
  #tabzen-close:hover { background: #61dafb; color: #000; }
  @keyframes tz-fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tz-breathe {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.6); opacity: 1; }
  }
`;
document.head.appendChild(style);

chrome.runtime.onMessage.addListener((obj, sender, response) => {
  if (obj.action === "TRIGGER_BREATHING") {
    showBreathingOverlay();
  }
});

function showBreathingOverlay() {
  if (document.getElementById("tabzen-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "tabzen-overlay";
  overlay.innerHTML = `
    <div class="tabzen-modal">
      <h2 style="margin:0;">TabZen Moment</h2>
      <p style="color:#ccc;">Inhale... Exhale...</p>
      <div class="breathing-circle"></div>
      <button id="tabzen-close">I'm focused now</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = document.getElementById("tabzen-close");
  closeBtn.addEventListener("click", () => {
    closeOverlay(overlay);
  });

  // Auto close after 16 seconds (4 breathing cycles)
  setTimeout(() => {
    if(document.body.contains(overlay)) closeOverlay(overlay);
  }, 16000);
}

function closeOverlay(element) {
  element.style.transition = "opacity 0.5s";
  element.style.opacity = "0";
  setTimeout(() => {
    element.remove();
    // Notify background that session is done
    chrome.runtime.sendMessage({ action: "SESSION_COMPLETE" });
  }, 500);
}