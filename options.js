document.addEventListener("DOMContentLoaded", () => { // addEventListener used to wait until the HTML is fully loaded.
                                                      // DOMContentLoaded means the HTML content is loaded.   
  const topicInput = document.getElementById("topicInput"); // means get the HTML element like instagram keyword filter input box for topics.
  const topicsTable = document.getElementById("topicsTable").querySelector("tbody"); // tbody means the body of the table where topics will be listed.
  
  const keywordInput = document.getElementById("keywordInput"); // get the HTML element like instagram keyword filter input box for keywords.
  const keywordsTable = document                           // document means that instagram keyword filter options page.
    .getElementById("keywordsTable")                     // get the HTML element like instagram keyword filter table for keywords.
    .querySelector("tbody");                         // tbody means the body of the table where keywords will be listed. 
                                                     //querySelector is used to select specific parts of the HTML. like instagram keyword filter table body.
  const filterToggle = document.getElementById("filterToggle"); // get the instagram keyword filter toggle switch for enabling/disabling filter.
  const logToggle = document.getElementById("logToggle");    // get the instagram keyword filter toggle switch for enabling/disabling logging. logging means printing messages to console for debugging.
  const saveButton = document.getElementById("save");  // get the HTML element like instagram keyword filter save button.


  // Function to show Keywords table:
  function updateKeywordsTable(keywords) { // updateKeywordsTable is used to display the list of keywords in the table on the options page. function means a block of code that performs a specific task.
    keywordsTable.innerHTML = "";          // Clear existing table content
    keywords.forEach((keyword, index) => {           // forEach is used to loop through each keyword in the keywords array.
      const row = keywordsTable.insertRow();     // insertRow adds a new row to the keywords table.
      const cellKeyword = row.insertCell(0);    // insertCell(0) adds a new cell at index 0 (first column) for the keyword.
      const cellAction = row.insertCell(1);    // insertCell(1) adds a new cell at index 1 (second column) for the delete button.

      cellKeyword.textContent = keyword;     // Set the keyword text in the first cell.

      const deleteButton = document.createElement("button"); // createElement("button") creates a new button element for deleting the keyword.
      deleteButton.textContent = "Delete";            // Set button text to "Delete
      deleteButton.className = "delete";              // Set button class for styling.
      deleteButton.addEventListener("click", () => {   // addEventListener("click") listens for click events on the delete button. 
                                                       // like when user clicks delete button it will remove the keyword.
        keywords.splice(index, 1);    //splice(index, 1) removes the keyword from the keywords array at the specified index.
        chrome.storage.sync.set({ keywords }); // Save updated keywords array to chrome.storage.sync.
        updateKeywordsTable(keywords);     // Refresh the keywords table to reflect the deletion.
      });

      cellAction.appendChild(deleteButton); // appendChild adds the delete button to the action cell in the table. 
                                            // appendChild means here in instagram keyword filter options page, it adds a keyword delete button inside the action cell of the keywords table.
    });
  }


// Function to show topics table:
function updateTopicsTable(topics) { // updateTopicsTable is used to display the list of topics in the table on the options page.
  topicsTable.innerHTML = "";        // Clear existing table content. innerHTML means the HTML content inside the topics table.
  topics.forEach((topic, index) => {  // forEach is used to loop through each topic in the topics array. index is the position of the topic in the array.
    const row = topicsTable.insertRow(); // insertRow adds a new row to the topics table.
    const cellTopic = row.insertCell(0);  // insertCell(0) adds a new cell at index 0 (first column) for the topic.
    const cellAction = row.insertCell(1);  // insertCell(1) adds a new cell at index 1 (second column) for the delete button.

    cellTopic.textContent = topic;    // Set the topic text in the first cell.
    const deleteButton = document.createElement("button"); // createElement("button") creates a new button element for deleting the topic.
    deleteButton.textContent = "Delete"; // Set button text to "Delete"
    deleteButton.className = "delete"; // Set button class for styling.
    deleteButton.addEventListener("click", () => {  // addEventListener("click") listens for click events on the delete button.
      topics.splice(index, 1);              // splice(index, 1) removes the topic from the topics array at the specified index.
      chrome.storage.sync.set({ topics });   // Save updated topics array to chrome.storage.sync.
      updateTopicsTable(topics);  // Refresh the topics table to reflect the deletion.
    });

    cellAction.appendChild(deleteButton); // appendChild adds the delete button to the action cell in the table.
  });                                     //appendChild means here in instagram keyword filter options page, it adds a topic delete button inside the action cell of the topics table.
}

  
  // Load saved settings
  chrome.storage.sync.get(    // get saved settings from chrome.storage.sync.
    ["keywords", "filterEnabled", "loggingEnabled"], // get keywords, filterEnabled, and loggingEnabled are used to retrieve the saved keywords, filter status, and logging status.
    (data) => {
      const keywords = data.keywords || []; // if no keywords found, use empty array.
      updateKeywordsTable(keywords);   // display keywords in the table.

      if (data.filterEnabled !== undefined) { // check if filterEnabled setting exists.
        filterToggle.checked = data.filterEnabled; // set the filter toggle switch based on saved setting. 
                                  //instagram keyword filter options page, it sets the filter toggle switch to on or off based on the saved filterEnabled setting.
      }

      if (data.loggingEnabled !== undefined) { // check if loggingEnabled setting exists.
        logToggle.checked = data.loggingEnabled;  // set the logging toggle switch based on saved setting.
      }
    }
  );


  // Load topics from storage:
chrome.storage.sync.get(["topics"], (data) => { // get saved topics from chrome.storage.sync.
  const topics = data.topics || [];  // if no topics found, use empty array.
  updateTopicsTable(topics); //is used to display topics in the table.
});

  // Add keyword on Enter key
  keywordInput.addEventListener("keypress", (event) => { // addEventListener("keypress") listens for keypress events on the keyword input box.
    if (event.key === "Enter" && keywordInput.value.trim() !== "") { // if Enter key is pressed and input is not empty.
      chrome.storage.sync.get("keywords", (data) => { // get existing keywords from storage.
        const keywords = data.keywords || []; // if no keywords found, use empty array.
        if (!keywords.includes(keywordInput.value.trim())) { // if keyword not already in the list used trim() to remove extra spaces.
          keywords.push(keywordInput.value.trim()); // add new keyword to the keywords array. trim() removes extra spaces from the input.
          chrome.storage.sync.set({ keywords }); // Save updated keywords array to chrome.storage.sync.
          updateKeywordsTable(keywords); // Refresh the keywords table to show the new keyword.
        }
        keywordInput.value = ""; // Clear input box after adding keyword. 
      });                        // here it clears the instagram keyword filter input box after user adds a new keyword.
    }
  });


  // Add topic on Enter:
topicInput.addEventListener("keypress", (event) => { // addEventListener("keypress") listens for keypress events on the topic input box.
  if (event.key === "Enter" && topicInput.value.trim() !== "") {
    chrome.storage.sync.get("topics", (data) => {
      const topics = data.topics || [];
      if (!topics.includes(topicInput.value.trim())) {
        topics.push(topicInput.value.trim());
        chrome.storage.sync.set({ topics });
        updateTopicsTable(topics);
      }
      topicInput.value = ""; // Clear input box after adding topic.
    });
  }
});

  // Save settings and reload Instagram tab
  saveButton.addEventListener("click", () => { // addEventListener("click") listens for click events on the save button.
    const filterEnabled = filterToggle.checked;
    const loggingEnabled = logToggle.checked;

    chrome.storage.sync.set(
      { filterEnabled, loggingEnabled }, // save filterEnabled and loggingEnabled settings to chrome.storage.sync.
                                         // filterEnabled is used to enable or disable the instagram keyword filter. loggingEnabled is used to enable or disable logging messages to console for debugging.
      () => {                            //loggingEnabled means printing messages to console for debugging.
        console.log(                   // Log to console means printing messages to console for debugging. means instagram keyword filter: settings saved.
          `Settings saved: filterEnabled = ${filterEnabled}, loggingEnabled = ${loggingEnabled}`
        ); 
        
        // Reload Instagram tabs to apply changes
        chrome.tabs.query({ url: "*://www.instagram.com/*" }, (tabs) => { // query all open Instagram tabs.
          tabs.forEach(tab => {                       // forEach loop through each Instagram tab.
            chrome.tabs.reload(tab.id);            // reload the tab to apply new settings.
          });
        });
      }
    );
  });
});
