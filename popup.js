// Open options page when "Config" is clicked
document.getElementById("configLink").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Variables to hold selected text and API key
let selectedText = "";
let apiKey = "";

// Get the selected text from the active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => window.getSelection().toString()
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          selectedText = results[0].result;
          document.getElementById("selectedTextDisplay").textContent = selectedText;
        }
        document.getElementById("queryInput").focus();
      }
    );
  }
});

// Retrieve the API key from storage
chrome.storage.local.get(["apiKey"]).then((res) => {
  if (res.apiKey) {
    apiKey = res.apiKey;
  }
});

// Handle form submission for asking ChatGPT
document.getElementById("queryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = document.getElementById("queryInput").value.trim();
  if (!question) return;
  if (!apiKey) {
    alert("No API key found. Please set your API key in the extension options.");
    return;
  }

  const statusEl = document.getElementById("status");
  statusEl.textContent = "Contacting ChatGPT...";
  statusEl.style.color = "black";

  const endpointUrl = "https://api.openai.com/v1/chat/completions";
  let userMessage = selectedText && selectedText.length > 0
    ? `Please answer the following question based on this context:\n"${selectedText}"\n\nQuestion: ${question}`
    : question;

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("OpenAI API error:", errData);
      statusEl.style.color = "red";
      statusEl.textContent = "Error: " + (errData.error?.message || response.status);
      return;
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;
    console.log("ChatGPT answer:", answer);

    // Copy the answer to clipboard
    await navigator.clipboard.writeText(answer);

    // Display the answer in the answer container
    document.getElementById("answerDisplay").textContent = answer;
    document.getElementById("answerContainer").style.display = "block";

    statusEl.style.color = "green";
    statusEl.textContent = "Answer copied to clipboard.";
  } catch (error) {
    console.error("Request failed:", error);
    statusEl.style.color = "red";
    statusEl.textContent = "Failed to get response.";
  }
});
