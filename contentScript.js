// contentScript.js

chrome.runtime.onMessage.addListener((obj, sender, response) => {
  if (obj.action === "TRIGGER_BREATHING") {
    showBreathingOverlay();
  }
});

function showBreathingOverlay() {
  // Check if it already exists to avoid duplicates
  if (document.getElementById("tabzen-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "tabzen-overlay";
  overlay.innerHTML = `
    <div class="tabzen-modal">
      <h2>TabZen Moment</h2>
      <p>Take a deep breath...</p>
      <div class="breathing-circle"></div>
      <button id="tabzen-close">I'm focused now</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("tabzen-close").addEventListener("click", () => {
    overlay.remove();
  });
  
  // Auto close after 15 seconds
  setTimeout(() => {
    if(document.getElementById("tabzen-overlay")) overlay.remove();
  }, 15000);
}