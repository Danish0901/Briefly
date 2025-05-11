document.addEventListener("DOMContentLoaded", () => {
  // Load only theme preference
  chrome.storage.local.get(["darkMode"], function (result) {
    // Set theme based on saved preference
    if (result.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.getElementById("darkModeToggle").checked = true;
    }
  });

  // Event listeners
  document
    .getElementById("summarizeBtn")
    .addEventListener("click", summarizeText);
  document
    .getElementById("clearNotesBtn")
    .addEventListener("click", clearNotes);
  document
    .getElementById("exportNotesBtn")
    .addEventListener("click", exportNotes);
  document
    .getElementById("darkModeToggle")
    .addEventListener("change", toggleDarkMode);
});

async function summarizeText() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString(),
    });

    if (!result || result.trim() === "") {
      showNotification("Please select some text first", "error");
      return;
    }

    // Show loading indicator
    showResult(
      `<div class="loading">Summarizing content<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>`
    );

    const response = await fetch("http://localhost:8080/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: result, operation: "summarize" }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const text = await response.text();

    // Generate a unique ID for this summary
    const summaryId = "summary_" + Date.now();

    showResult(`
      <div class="result-item">
        <div class="result-content">${text.replace(/\n/g, "<br>")}</div>
        <div class="result-actions">
          <button class="btn small secondary copy-btn" data-target="${summaryId}">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <textarea id="${summaryId}" style="position: absolute; left: -9999px;">${text}</textarea>
      </div>
    `);

    // Add event listener to the copy button
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const targetId = this.getAttribute("data-target");
        const textToCopy = document.getElementById(targetId).value;
        copyToClipboard(textToCopy);
      });
    });
  } catch (error) {
    showResult(
      `<div class="result-item error"><div class="result-content">Error: ${error.message}</div></div>`
    );
    showNotification(error.message, "error");
  }
}

// Save notes functionality removed

function clearNotes() {
  const notes = document.getElementById("notes");
  if (!notes.value.trim()) {
    showNotification("Notes area is already empty", "info");
    return;
  }

  notes.value = "";
  showNotification("Notes cleared");
}

function exportNotes() {
  const notes = document.getElementById("notes").value;
  if (!notes.trim()) {
    showNotification("Nothing to export", "error");
    return;
  }

  // Create a Blob with the text content
  const blob = new Blob([notes], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Create a temporary download link
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `research_notes_${formatDate()}.txt`;

  // Append to the DOM, click it, and remove it
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up the URL object
  URL.revokeObjectURL(url);

  showNotification("Notes exported successfully");
}

function toggleDarkMode() {
  const isDarkMode = document.getElementById("darkModeToggle").checked;

  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  // Save preference
  chrome.storage.local.set({ darkMode: isDarkMode });
}

function showResult(content) {
  document.getElementById("results").innerHTML = content;
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification("Copied to clipboard!");
    })
    .catch((err) => {
      showNotification("Failed to copy text: " + err, "error");
    });
}

function showNotification(message, type = "success") {
  // Check if a notification already exists and remove it
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }

  // Create new notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Add icon based on notification type
  const icon = type === "success" ? "check-circle" : "exclamation-circle";

  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;

  // Add to body
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);

  // Also send to background script for system notification
  chrome.runtime.sendMessage({
    action: "notify",
    message: message,
  });
}

function formatDate() {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

// Add loading animation
setInterval(() => {
  const dots = document.querySelectorAll(".dot");
  if (dots.length > 0) {
    dots.forEach((dot, index) => {
      setTimeout(() => {
        dot.style.opacity = dot.style.opacity === "0.3" ? "1" : "0.3";
      }, index * 150);
    });
  }
}, 500);
