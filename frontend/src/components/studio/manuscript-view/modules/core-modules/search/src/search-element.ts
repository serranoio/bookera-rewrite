import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('search-element')
export class SearchElement extends ModuleElement {
  renderInSettings() {
    return html`<div>Search Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Search Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInSettings'
      ? this.renderInSettings()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Search module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-element': SearchElement;
  }
}
