import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('open-panel-element')
export class OpenPanelElement extends ModuleElement {
  renderInPanel() {
    return html`<div>Open Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Open Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInPanel'
      ? this.renderInPanel()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Open Panel module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'open-panel-element': OpenPanelElement;
  }
}
