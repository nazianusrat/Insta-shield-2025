// HELPER FUNCTION: Check if text contains any blocked word
// ========================================
// text = the post content to check (string means sentence/paragraph)
// list = array of blocked words/topics (always defaults to empty array (means list of words) if missing)
function containsBlockedWord(text, list) {
  // Make sure list is always an array, use empty [] if nothing provided
  list = list || [];
  // Loop through each word in list, check if it's in text (case insensitive)
  // .some() returns true if ANY word matches
  return list.some(word => 
    text.toLowerCase().includes(word.toLowerCase()) // toLowerCase makes everything lowercase for comparison. it helps to ignore case differences.
  );
}

// ========================================
// MAIN FUNCTION: Find and filter Instagram posts
// ========================================
// keywords = array of words to block (empty [] by default)
// topics = array of topics to block (empty [] by default)
function filterPosts(keywords = [], topics = []) {
  // Find all potential Instagram post elements (articles or presentation divs)
  const posts = document.querySelectorAll("article, div[role='presentation']"); // article and div[role='presentation'] are used to find Instagram posts on the page.
  // Log how many posts were found (for debugging)
  log(`Found ${posts.length} Instagram posts`); // log is a helper function defined below for logging messages.

  // Loop through each post one by one
  posts.forEach(post => {
    // Start with empty string to collect all text from this post
    let textContent = "";
    
    // Find text elements inside this post: spans, divs, images, links, headings
    const elements = post.querySelectorAll("span, div, img, a, h1, h2"); // span, div, img, a, h1, h2 are used to find text inside the post. 
                                                                         // span means a small section of text, div means a block section, img means image, a means link, h1 and h2 are headings.

    // Loop through each element and collect its text
    elements.forEach(el => {
      // Add regular text if it exists
      if (el.innerText) textContent += " " + el.innerText;
      // Add image alt text if it exists
      if (el.alt) textContent += " " + el.alt;
      // Add accessibility label if it exists
      if (el.getAttribute("aria-label")) textContent += " " + el.getAttribute("aria-label");
      // Add title attribute if it exists
      if (el.getAttribute("title")) textContent += " " + el.getAttribute("title");
    });

    // BLOCK the post if it contains ANY keyword OR topic
    if (containsBlockedWord(textContent, keywords) || containsBlockedWord(textContent, topics)) {
      // Log why we're blocking (show first 100 chars of text)
      log(`Blocking post containing blocked keyword or topic. Preview: ${textContent.substring(0, 100)}...`);

      // Only add overlay if not already there (avoids duplicates)
      if (!post.querySelector('.blocked-overlay')) { // overlay is a class name for the blocking element. element means here HTML element like div, span, img, etc.
        // Step 1: Creating the main overlay div (dark blanket over post)
        const overlay = document.createElement('div');
        overlay.className = 'blocked-overlay';
        // Style overlay: full size, dark semi-transparent, centered, high z-index, blurry background
        overlay.style.cssText = `
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(10px);
        `;

        // Step 2: Creating "BLOCKED" message box
        const blockedImage = document.createElement('div');
        blockedImage.style.cssText = `
          background-color: #ff4444;
          color: white;
          padding: 40px 60px;
          border-radius: 12px;
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        // Add emoji, title, and subtitle inside the box
        blockedImage.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 10px;">🚫</div>
          <div>BLOCKED</div>
          <div style="font-size: 14px; margin-top: 10px; opacity: 0.9;">Content filtered by keyword</div>
        `;

        // Add message box to overlay
        overlay.appendChild(blockedImage); // appendChild adds a child element inside a parent element.
                                           // element means HTML element like div, span, img, etc.

        // Make post container position: relative (needed for absolute overlay)
        post.style.position = 'relative';

        // Attach overlay to the post (covers it completely)
        post.appendChild(overlay); // overlay is used for blocking the post
      }
    }
  });
}

// ========================================
// Simple logging (only if enabled in storage). logging means printing messages to console for debugging. 
// ========================================
function log(message) {  // check if logging is enabled before printing
  // Check storage for logging setting
  chrome.storage.sync.get("loggingEnabled", ({ loggingEnabled }) => { 
    // Only log to console if enabled
    if (loggingEnabled) {
      console.log(message); // Print message to console. like instagram keyword filter: blocking post...
    }
  });
}

// ========================================
// STARTUP: Load settings and filter on page load
// ========================================
chrome.storage.sync.get( // Get keywords, topics, and filterEnabled from storage
  ["keywords", "topics", "filterEnabled"],
  ({ keywords = [], topics = [], filterEnabled }) => {
    // Only filter if enabled AND have keywords or topics
    if (filterEnabled && (keywords.length > 0 || topics.length > 0)) { // Log loaded keywords and topics
      log(`Keywords loaded: ${keywords}`); // log is used here for logging messages. logging messages means information printed to console for debugging.
      log(`Topics loaded: ${topics}`);
      filterPosts(keywords, topics);
    } else {
      log("Keyword/topic filter is disabled or no keywords/topics found"); // Do nothing if filter is disabled or no keywords/topics
    }
  }
);

// ========================================
// Monitor for new posts (Instagram loads dynamically)
// ========================================
const observer = new MutationObserver(() => { // mutationObserver watches for changes in the webpage (like new posts loading).
  // When page changes (new posts added), re-check settings
  chrome.storage.sync.get(
    ["keywords", "topics", "filterEnabled"],
    ({ keywords = [], topics = [], filterEnabled }) => {
      if (filterEnabled && (keywords.length > 0 || topics.length > 0)) { // If filtering is enabled and there are keywords or topics
        filterPosts(keywords, topics);
      }
    }
  );
});

// Start watching entire page for changes (new posts, scrolls, etc.)
observer.observe(document.body, { 
  childList: true,  // childList means watch for added or removed child elements (like new posts)
  subtree: true   // subtree means watch entire tree of elements, not just direct children. 
                  // entire tree means instagram page, posts inside feed, comments inside posts, etc.
});

// ========================================
// Reload if settings changes
// ========================================
chrome.storage.onChanged.addListener((changes) => { // addListener watches for changes in storage settings.
  // If keywords, topics, or filterEnabled changed
  if (changes.keywords || changes.topics || changes.filterEnabled) {
    chrome.storage.sync.get(
      ["keywords", "topics", "filterEnabled"],
      ({ keywords = [], topics = [], filterEnabled }) => {
        if (filterEnabled && (keywords.length > 0 || topics.length > 0)) {
          log("Keywords or topics updated, re-filtering posts");
          // Reload page to apply new filters everywhere
          location.reload(); // reload means refresh the instagram page to apply new filters.
        }
      }
    );
  }
});
