
var turndownService;
var cl = console.log;

(async () => {
  const src = chrome.runtime.getURL("../../deps/turndown.js");
  const turndown = await import(src);
  turndownService = new turndown.TurndownService();
})();


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type !== "tweet2md") return;

  console.log("Received message from content script: " + message.data);

  const rawHTML = message.data
    .replace(/\?ref_src=[^\\"<>=]+/gi, '')
    .replace(/\?src=hash&amp;ref_src=[^\\"<>=()]+/gi, '');
  const markdown = turndownService.turndown(rawHTML);

  cl(`Generated markdown: ${markdown}`);

  sendResponse(markdown);

});