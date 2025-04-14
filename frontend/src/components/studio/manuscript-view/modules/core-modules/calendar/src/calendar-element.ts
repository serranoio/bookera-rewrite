import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('calendar-element')
export class CalendarElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private renderCalendarSettingsContent() {
    return html`<div>Calendar settings content</div>`;
  }

  private renderCalendarSidePanelContent() {
    return html`<div>Calendar side panel content</div>`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Calendar Settings',
          'Manage your calendar settings here.',
          this.renderCalendarSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Calendar Overview',
          'Quick access to your calendar.',
          this.renderCalendarSidePanelContent.bind(this)
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
    console.log('Sending tab state for Calendar module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'calendar-element': CalendarElement;
  }
}
