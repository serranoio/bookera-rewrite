import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('search-element')
export class SearchElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private renderSearchSettingsContent() {
    return html`<div>Search settings content</div>`;
  }

  private renderSearchSidePanelContent() {
    return html`<div>Search side panel content</div>`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Search Settings',
          'Manage your search settings here.',
          this.renderSearchSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Search Overview',
          'Quick access to your search tools.',
          this.renderSearchSidePanelContent.bind(this)
        )}
      </div>
    `;
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
