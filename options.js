// When the options page loads, retrieve any saved API key and display it
chrome.storage.local.get(["apiKey"]).then((result) => {
  if (result.apiKey) {
    document.getElementById("apiKeyInput").value = result.apiKey;
  }
});

// Save button event handler
document.getElementById("saveButton").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKeyInput").value.trim();
  if (apiKey) {
    // Save the API key to Chrome storage
    chrome.storage.local.set({ apiKey: apiKey }).then(() => {
      // Update status to let the user know it's saved
      const statusEl = document.getElementById("status");
      statusEl.textContent = "API Key saved!";
      setTimeout(() => { statusEl.textContent = ""; }, 2000);  // clear message after 2 seconds
    });
  } else {
    // If the input is empty, prompt the user to enter a key
    alert("Please enter a valid API key.");
  }
});
