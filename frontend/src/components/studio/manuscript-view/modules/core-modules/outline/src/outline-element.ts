import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('outline-element')
export class OutlineElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private renderOutlineSettingsContent() {
    return html`<div>Outline settings content</div>`;
  }

  private renderOutlineSidePanelContent() {
    return html`<div>Outline side panel content</div>`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Outline Settings',
          'Manage your outline settings here.',
          this.renderOutlineSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Outline Overview',
          'Quick access to your outline.',
          this.renderOutlineSidePanelContent.bind(this)
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
    console.log('Sending tab state for Outline module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'outline-element': OutlineElement;
  }
}
