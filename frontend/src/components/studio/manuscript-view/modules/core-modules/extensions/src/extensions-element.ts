import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('extensions-element')
export class ExtensionsElement extends ModuleElement {
  renderInSettings() {
    return html`<div>Extensions Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Extensions Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInSettings'
      ? this.renderInSettings()
      : this.renderInSidePanel();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'extensions-element': ExtensionsElement;
  }
}
