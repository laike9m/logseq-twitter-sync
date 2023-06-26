
import { html, css, LitElement } from '../../deps/lit.js';

var cl = console.log;

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

  // TODO: allow users to deselect all instances
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


document.onload = async function () {
  const syncButton = document.getElementById('sync-button');
  syncButton.onclick = function () {
    console.log("button clicked");

    chrome.runtime.sendMessage("manual sync");
  };
};