/* Wraps Logseq local server API */

cl = console.log;

const Methods = Object.freeze({
  INSERT_BLOCK: 'logseq.Editor.insertBlock',
});

const SyncModes = Object.freeze({
  TO_JOURNAL: 'to_journal',
  TO_PAGE: 'to_page',
});

class SyncOptions {
  // Use parameter destructuring.
  constructor({
    apiURL = 'http://127.0.0.1:12315/api',
    token = 'test-token',
    syncMode = SyncModes.TO_JOURNAL,
    syncTarget = undefined,
  } = {}) {
    this.apiURL = apiURL;
    this.token = token;
    this.syncMode = syncMode;
    this.syncTarget = syncTarget;  // TODO: this should be page + block
    this.validate();
  }

  // Validate options and throw an error if invalid.
  validate() {
    if (syncMode === SyncModes.TO_PAGE && !syncTarget) {
      throw new Error('syncTarget is required when syncMode is TO_PAGE');
    }
  };
}

async function syncTweetsToLogseq(tweets, options = new SyncOptions()) {
  cl(tweets);

  for (let tweet of tweets) {
    // 等待上一个请求完成, 这样文字和 embed 是放在一起的
    await syncTweet(tweet, options);
  }
}

async function syncTweet(tweet, options) {
  const headers = {
    'Authorization': `Bearer ${options.token}`,
    'Content-Type': 'application/json'
  };

  // Insert markdown representation of a tweet
  const response = await fetch(apiURL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      method: 'logseq.Editor.insertBlock',
      args: ['Test Twitter Sync', tweet.markdown, { isPageBlock: true }]
    })
  });

  const result = await response.json();
  console.log(result);

  // Insert an embeded tweet
  await fetch(apiURL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      method: Methods.INSERT_BLOCK,
      args: ['Test Twitter Sync', `{{tweet ${tweet.url}}}`, { isPageBlock: true }]
    })
  });

}