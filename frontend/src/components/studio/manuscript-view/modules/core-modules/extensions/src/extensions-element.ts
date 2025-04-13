import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('extensions-element')
export class ExtensionsElement extends ModuleElement {
  renderInPanel() {
    return html`<div>Extensions Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Extensions Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInPanel'
      ? this.renderInPanel()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Extensions module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'extensions-element': ExtensionsElement;
  }
}
