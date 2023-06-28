var cl = console.log;
import { SyncModes, validateSyncOptions, chromeStorage, readStorage } from './common.js';
import { syncInstances, eligibleToRun } from './execution-control.js';
import { syncTweetsToLogseq } from './logseq-api.js';


// Auto sync
// TODO: store the latest fetched tweet into chrome storage.
// store user configs in chrome storage.
chrome.runtime.onInstalled.addListener(async () => {
  await syncInstances();
  if (!await eligibleToRun()) {
    cl("Not eligible to run, exit");
    return;
  }

  // TODO: move to the right place.
  const [isValid, errorMessage] = await validateSyncOptions();
  cl(`isValid: ${isValid}, errorMessage: ${errorMessage}`);
  if (!isValid) {
    cl("Sync options are invalid, exit");
    return;
  }

  // If server is not listening, return directly
  if (!await checkServerStatus()) {
    console.log("Logseq local server not listening, exit");
    return;
  }
  console.log("Server is listening");
  // await syncTweets();  // Disable auto sync for now.
});

// Manual sync
chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message !== "manual sync") return;

  cl("Manual sync order received");
  syncTweets();
});

async function syncTweets() {
  const likesPage = "https://twitter.com/laike9m/likes";
  const tweetsPage = "https://twitter.com/laike9m";

  // Create a new tab only if the target page is not opened.
  let [tab] = await chrome.tabs.query({ url: tweetsPage });
  tab = tab ? tab : await chrome.tabs.create({ url: tweetsPage, active: false });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["src/inject/parse-tweet.js", "src/inject/tweet2md.js"],
  });

  let tweets = [];

  // We have to get the html in service worker, then send the tweet html to content script.
  // Get markdown using turndown in content script, then send it back to service worker.
  chrome.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type !== "tweets" || sender.tab.id !== tab.id) return;

    tweets = message.tweets;
    for (let tweet of tweets) {
      await turnTweetToMarkdown(tweet, tab.id);
    }

    // cl(tweets);
    await syncTweetsToLogseq(tweets);
  });
};


function turnTweetToMarkdown(tweet, tabId) {
  return new Promise((resolve, reject) => {
    fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(
      tweet["url"]
    )}&amp;buttonType=HashtagButton&amp;partner=&amp;hide_thread=false`)
      .then(response => response.json())
      .then(async data => {
        tweet["markdown"] = await chrome.tabs.sendMessage(tabId, {
          type: "tweet2md",
          data: data.html
        });
        resolve();
      })
      .catch(err => console.log(err));
  });
}

// Check if Logseq is listening on a local port.
function checkServerStatus() {
  return new Promise((resolve, reject) => {
    const url = "http://127.0.0.1:12315";
    fetch(url, { method: "GET" })
      .then((res) => {
        resolve(res.ok);
      })
      .catch((err) => {
        resolve(false);
      });
  });
}