import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('settings-element')
export class SettingsElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private renderSettingsContent() {
    return html`<div>settings content</div>`;
  }

  private renderPanelSidePanelContent() {
    return html`<div>side panel content</div>`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Settings',
          'Manage your settings here.',
          this.renderSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Overview',
          'Quick access to your .',
          this.renderPanelSidePanelContent.bind(this)
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
    console.log('Sending tab state for Open Side Panel module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-element': SettingsElement;
  }
}
