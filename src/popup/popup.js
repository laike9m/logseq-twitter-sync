
import { html, css, LitElement } from '../../deps/lit.js';
import { chromeStorage, readStorage } from '../common.js'

var cl = console.log;

// TODO: show if the current SyncOptions are valid or not, with a link to the options page.
export class InstanceList extends LitElement {
  static styles = css`p { color: blue }`;

  static properties = {
    instances: [],
    currentInstanceID: ''
  };

  constructor() {
    super();
    (async () => {
      await syncInstances();  // This function is idempotent, so can call it every time.
      this.refreshInstanceStatusOnPage();
      this.currentInstanceID = await currentInstanceID();
    })();
  }

  async refreshInstanceStatusOnPage() {
    this.instances = Array.from((await getInstances()).values());
  }

  render() {
    return html`
      ${this.instances?.map((instance) => {
      const id = instance.id;
      return html`
      <div>
        <input type="radio" @click="${this.onSelect}" name="instance" 
              value="${id}" ${instance.isActive ? 'checked' : ''}>
        <label for="${id}">
          ${instance.model} ${id === this.currentInstanceID ? '(current)' : ''}, 
          active: ${instance.isActive ? '✅' : '❌'}
        </label>
      </div>`;
    })
      }`;
  }

  async onSelect(e) {
    cl(`select ${e.target.value}`);
    await activateInstanceById(e.target.value);
    await this.refreshInstanceStatusOnPage();
  }
}
customElements.define('instance-list', InstanceList);

class AutoSyncSwitch extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
      background-color: #ccc;
      border-radius: 10px;
      cursor: pointer;
    }

    .toggle-switch:before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      background-color: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }

    .toggle-switch.checked {
      background-color: #2196F3;
    }

    .toggle-switch.checked:before {
      transform: translateX(20px);
    }`;

  static properties = {
    autoSyncEnabled: { type: Boolean },
  };

  constructor() {
    super();
    (async () => {
      this.autoSyncEnabled = await readStorage("autoSyncEnabled") || false;
      log(`this.autoSyncEnabled: ${this.autoSyncEnabled}`);
    })();
  }

  render() {
    return html`
      <label>Auto Sync</label>
      <div class="toggle-switch ${this.autoSyncEnabled ? 'checked' : ''}"
           @click="${this.toggleAutoSync}">
      </div>
    `;
  }

  toggleAutoSync() {
    this.autoSyncEnabled = !this.autoSyncEnabled;
    chromeStorage.set({ autoSyncEnabled: this.autoSyncEnabled });
  }
}

customElements.define('auto-sync-switch', AutoSyncSwitch);

class ManualSyncButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      padding: 8px 16px;
      background-color: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <button @click="${this.handleClick}">Manual Sync</button>
    `;
  }

  handleClick() {
    console.log("button clicked");
    chrome.runtime.sendMessage("manual sync");
  }
}

customElements.define('manual-sync-button', ManualSyncButton);