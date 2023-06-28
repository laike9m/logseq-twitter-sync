console.log("Hello. This message was sent from scripts/inject.js");

// This function executes on a twitter user's main page.
// Parse the webpage to find the latest tweets the user posted.
function getTweets() {
  const postedTweets = document.querySelectorAll("article[data-testid='tweet']");
  return parseTweets(postedTweets);
}

// TODO: implement page scroll to find more tweets.
function parseTweets(tweetElements) {
  // A list of {"url": URL, "text": text, "media":?}
  const tweets = [];

  for (let tweetElem of tweetElements) {
    const tweet = {};
    // innerText code be empty, for example retweets or media-only tweets.
    tweet["text"] = tweetElem.querySelector("div[dir='auto']")?.innerText || "";

    const links = tweetElem.querySelectorAll("a[role='link']");
    for (let link of links) {
      if (link.getAttribute("href").includes("status")) {
        tweet["url"] = `https://twitter.com${link.getAttribute("href")}`;
        break;
      }
    }
    tweets.push(tweet);
  }

  return tweets;
}


// Navigate to user's main page, e.g. https://twitter.com/laike9m
function navigateToMainPage() {
  console.log("Navigating to main page");
  const mainPage = document.querySelector(`a[href='/laike9m']`);
  mainPage.click();
}

// https://stackoverflow.com/a/61511955/2142577
function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

waitForElement("article[data-testid='tweet']").then((elem) => {
  console.clear();

  console.log('Element is ready');
  // navigateToMainPage();
  const tweets = getTweets();

  // Send tweets to background page
  chrome.runtime.sendMessage({
    type: "tweets",
    tweets: tweets
  });
});