import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('versions-element')
export class VersionsElement extends ModuleElement {
  renderInSettings() {
    return html`<div>Versions Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Versions Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInSettings'
      ? this.renderInSettings()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Versions module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'versions-element': VersionsElement;
  }
}
