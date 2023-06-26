import { html, css, LitElement } from '../../deps/lit.js';

var cl = console.log;
const chromeStorage = chrome.storage.sync;

// A super set of SyncOptions in logseq-api.js
class SyncOptions extends LitElement {
  static properties = {
    // For now only support one account
    twitterAccount: { type: String },

    // What to fetch
    fetchTweets: { type: Boolean },
    fetchReplies: { type: Boolean },
    fetchLikes: { type: Boolean },

    // Only fetch tweets that match the filter. If empty, fetch all tweets.
    contentFilter: { type: String },
    syncMode: { type: String },
    syncTarget: { type: String },
    apiURL: { type: String },
    logseqToken: { type: String },
  };

  constructor() {
    super();
    (async () => {
      this.twitterAccount = await this.readStorage("twitterAccount") || "";
      this.fetchTweets = await this.readStorage("fetchTweets") || false;
      this.fetchReplies = await this.readStorage("fetchReplies") || false;
      this.fetchLikes = await this.readStorage("fetchLikes") || false;
      this.contentFilter = await this.readStorage("contentFilter") || "";
      this.syncMode = await this.readStorage("syncMode") || "to_journal";
      this.syncTarget = await this.readStorage("syncTarget") || "";
      this.logseqToken = await this.readStorage("logseqToken") || "";
      this.apiURL = await this.readStorage("apiURL") || "http://127.0.0.1:12315/api";
    })();

  }

  static styles = css`
    :host {
      display: block;
      border: 1px solid #4A99E9;
      padding: 10px;
      font-size: 16px;
    }
  `;

  render() {
    // TODO: 加一些引导用语
    return html`
      <p>Step 1. Enter the Twitter account you want to sync tweets from</p>
      <input
        id="twitterAccount"
        type="text"
        .value="${this.twitterAccount}"
        @input="${this.handleTwitterAccountChange}"
      />

      <label>
        <input
          type="checkbox"
          ?checked=${this.fetchTweets}
          @change=${this.handleFetchTweetsChange}
        />
        Fetch tweets
      </label>
      <label>
        <input
          type="checkbox"
          ?checked=${this.fetchReplies}
          @change=${this.handleFetchRepliesChange}
        />
        Fetch replies
      </label>
      <label>
        <input
          type="checkbox"
          ?checked=${this.fetchLikes}
          @change=${this.handleFetchLikesChange}
        />
        Fetch likes
      </label>

      <p>Step 2. Specify a filter (support regex), only matched tweets will be fetched. 
         If empty, all tweets will be fetched.</p>
      <input
        id="contentFilter"
        type="text"
        .value="${this.contentFilter}"
        @input="${this.handleContentFilterChange}"
      />

      <p>Step 3. Select where to sync tweets to</p>
      <select id="syncMode" @change="${this.handleSyncModeChange}">
        <option value="to_journal" ?selected="${this.syncMode === 'to_journal'}">
          to journal
        </option>
        <option value="to_page" ?selected="${this.syncMode === 'to_page'}">
          to page
        </option>
      </select>

      ${this.syncMode === 'to_page'
        ? html`
            <p>Your tweets will be synced to this page:</p>
            <input
              type="text"
              id="logseqPage"
              .value="${this.syncTarget}"
              @input="${this.handleSyncTargetChange}"
            />
          `
        : ''}
      
      <!-- TODO: link to github readme -->
      <p>Step 4. Set the right Logseq token and API address</p>
      <label for="logseqToken">Logseq Token:</label>
      <input
        id="logseqToken"
        type="text"
        .value="${this.logseqToken}"
        @input="${this.handleLogseqTokenChange}"
      />
      <br /><br />
      <label for="apiURL">API URL:</label>
      <input
        id="apiURL"
        type="text"
        size="30"
        .value="${this.apiURL}"
        @input="${this.handleApiURLChange}"
      />
    `;
  }

  async readStorage(key) {
    if (key === 'syncMode') {
      cl("from storage");
      cl((await chromeStorage.get(key))[key]);
    }
    return (await chromeStorage.get(key))[key];
  }

  handleTwitterAccountChange(event) {
    this.syncMode = event.target.value;
    chromeStorage.set({ twitterAccount: this.syncMode });
  }

  handleFetchTweetsChange(event) {
    this.fetchTweets = event.target.checked;
    chromeStorage.set({ fetchTweets: this.fetchTweets });
  }

  handleFetchRepliesChange(event) {
    this.fetchReplies = event.target.checked;
    chromeStorage.set({ fetchReplies: this.fetchReplies });
  }

  handleFetchLikesChange(event) {
    this.fetchLikes = event.target.checked;
    chromeStorage.set({ fetchLikes: this.fetchLikes });
  }

  handleContentFilterChange(event) {
    this.contentFilter = event.target.value;
    chromeStorage.set({ contentFilter: this.contentFilter });
  }

  handleSyncModeChange(event) {
    this.syncMode = event.target.value;
    cl(`sync mode changed: ${this.syncMode}`);
    chromeStorage.set({ syncMode: this.syncMode });
  }

  handleSyncTargetChange(event) {
    this.syncTarget = event.target.value;
    chromeStorage.set({ syncTarget: this.syncTarget });
  }

  handleLogseqTokenChange(event) {
    this.logseqToken = event.target.value;
    chromeStorage.set({ logseqToken: this.logseqToken });
  }

  handleApiURLChange(event) {
    this.apiURL = event.target.value;
    chromeStorage.set({ apiURL: this.apiURL });
  }
}

customElements.define('sync-options', SyncOptions);

// Debug only
chrome.storage.onChanged.addListener(function (changes) {
  for (let key in changes) {
    let newValue = changes[key].newValue;
    console.log(`Value of ${key} changed to ${newValue}`);
  }
});