chrome.runtime.onInstalled.addListener(() => {    // This runs one time only — when the user installs your extension (or when it’s updated).
  const defaultKeywords = [      // It creates a list (array) called defaultKeywords that has your default blocked words. 
                                 // These are the keywords that will be used when the extension is first installed, before the user adds their own.
    "violation",
    "Racism",
    "killing",
  ];
  chrome.storage.sync.set( //default settings in chrome.storage.sync like a settings on a new phone.
    {
      keywords: defaultKeywords,
      filterEnabled: true,
      loggingEnabled: true,  // logging Enabled means the extension will print messages to the console for debugging.
    },
    () => {
      console.log( // Log to console that default settings have been set.
        `Default settings set: keywords = ${defaultKeywords}, filterEnabled = true, loggingEnabled = true`
      );
    }
  );
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // Listen for messages from other parts of the extension (like popup.js).
  if (request.action === "saveKeywords") { // If the message action is "saveKeywords", it means the user wants to save new settings.
    chrome.storage.sync.set( // Save the new settings (keywords, filterEnabled, loggingEnabled) to chrome.storage.sync.
      {
        keywords: request.keywords,
        filterEnabled: request.filterEnabled,
        loggingEnabled: request.loggingEnabled,
      },
      () => {
        console.log( // Log to console that the settings have been saved.
          `Settings saved: keywords = ${request.keywords}, filterEnabled = ${request.filterEnabled}, loggingEnabled = ${request.loggingEnabled}`
        ); // Send a response back to the sender (popup.js) indicating success.
        sendResponse({ status: "success" }); // < used to confirm that the settings were saved successfully.
      }
    );
    return true; // Keep the message channel open for sendResponse
  }
});
