# Briefly

This is a basic Chrome Extension that lets you select text on any webpage and get a summary using AI. It sends the selected text to a local Spring Boot server, which returns the summary.

## How it works

- You select some text on a webpage.
- Click the "Summarize" button in the extension popup.
- It shows a loading animation while sending the text to the backend.
- The summary is shown inside the Text area.
- You can copy it easily using the copy button.

## Tech used

- HTML, CSS, JavaScript (for the extension)
- Spring Boot (for the backend API)
- Chrome Extension APIs like `chrome.tabs`, `chrome.scripting`, and `chrome.storage`

## How to run

1. Clone this repo.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable Developer Mode.
4. Click "Load unpacked" and select this folder.
5. Make sure the Spring Boot server is running on `http://localhost:8080`.
6. Now go to any site, select text, and click "Summarize" in the extension popup.

## Notes

- Dark mode toggle is available.
- The extension doesn’t save summaries right now.
- There's a feature to export notes.


