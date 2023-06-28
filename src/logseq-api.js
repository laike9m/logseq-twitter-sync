/* Wraps Logseq local server API */

var cl = console.log;

const Methods = Object.freeze({
  INSERT_BLOCK: 'logseq.Editor.insertBlock',
});

export async function syncTweetsToLogseq(tweets) {
  cl(tweets);

  for (let tweet of tweets) {
    // 等待上一个请求完成, 这样文字和 embed 是放在一起的
    await syncTweet(tweet, options);
  }
}

async function syncTweet(tweet) {
  const headers = {
    'Authorization': `Bearer ${await readStorage('logseqToken')}`,
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