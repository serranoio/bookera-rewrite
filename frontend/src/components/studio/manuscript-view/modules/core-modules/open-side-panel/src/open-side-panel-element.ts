import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('open-side-panel-element')
export class OpenSidePanelElement extends ModuleElement {
  renderInSettings() {
    return html`<div>Open Side Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Open Side Panel Side Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInSettings'
      ? this.renderInSettings()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Open Side Panel module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'open-side-panel-element': OpenSidePanelElement;
  }
}
