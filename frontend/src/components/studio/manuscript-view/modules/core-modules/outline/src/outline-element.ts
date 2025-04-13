import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('outline-element')
export class OutlineElement extends ModuleElement {
  renderInPanel() {
    return html`<div>Outline Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Outline Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInPanel'
      ? this.renderInPanel()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Outline module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'outline-element': OutlineElement;
  }
}
