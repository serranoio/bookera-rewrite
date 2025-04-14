import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('extensions-element')
export class ExtensionsElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private extensionsSettingsContent() {
    return html` <div>Extensions settings content</div> `;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Extensions Settings',
          'Manage your extensions here.',
          this.extensionsSettingsContent
        )}
      </div>
    `;
  }

  private renderSidePanelContent() {
    return html`<div>Extensions content</div>`;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Extensions Overview',
          'Quick access to extensions.',
          this.renderSidePanelContent
        )}
      </div>
    `;
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
