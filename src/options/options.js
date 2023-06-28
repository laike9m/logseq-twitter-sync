import { html, css, LitElement, until } from '../../deps/lit.js';
import { SyncModes, validateSyncOptions, chromeStorage, readStorage } from '../common.js'

var cl = console.log;

// TODO: add a save button, and validate user inputs, alert if invalid.
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
      this.twitterAccount = await readStorage("twitterAccount") || "";
      this.fetchTweets = await readStorage("fetchTweets") || false;
      this.fetchReplies = await readStorage("fetchReplies") || false;
      this.fetchLikes = await readStorage("fetchLikes") || false;
      this.contentFilter = await readStorage("contentFilter") || "";
      this.syncMode = await readStorage("syncMode") || SyncModes.TO_JOURNAL;
      this.syncTarget = await readStorage("syncTarget") || "";
      this.logseqToken = await readStorage("logseqToken") || "";
      this.apiURL = await readStorage("apiURL") || "http://127.0.0.1:12315/api";
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
        <option value="to_journal" ?selected="${this.syncMode === SyncModes.TO_JOURNAL}">
          to journal
        </option>
        <option value="to_page" ?selected="${this.syncMode === SyncModes.TO_PAGE}">
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

      ${until(
        validateSyncOptions().then(([isValid, errorMessage]) => isValid
          ? html`<p style="color: green;">Settings are valid</p>`
          : html`<p style="color: red;">Settings are invalid:<br> ${errorMessage}</p>`),
        html`Validating...`,
      )}

    `;
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