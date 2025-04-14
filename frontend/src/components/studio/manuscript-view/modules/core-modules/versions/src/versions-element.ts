import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('versions-element')
export class VersionsElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private renderVersionsSettingsContent() {
    return html`<div>Versions settings content</div>`;
  }

  private renderVersionsSidePanelContent() {
    return html`<div>Versions side panel content</div>`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Versions Settings',
          'Manage your version history.',
          this.renderVersionsSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Versions Overview',
          'Quick access to version history.',
          this.renderVersionsSidePanelContent.bind(this)
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
    console.log('Sending tab state for Versions module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'versions-element': VersionsElement;
  }
}
