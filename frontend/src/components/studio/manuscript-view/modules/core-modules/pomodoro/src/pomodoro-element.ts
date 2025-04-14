import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

@customElement('pomodoro-element')
export class PomodoroElement extends ModuleElement {
  static styles = [base, moduleElementStyle];

  private renderPomodoroSettingsContent() {
    return html`<div>Pomodoro settings content</div>`;
  }

  private renderPomodoroSidePanelContent() {
    return html`<div>Pomodoro side panel content</div>`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Pomodoro Settings',
          'Configure your Pomodoro timer.',
          this.renderPomodoroSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Pomodoro Timer',
          'Quick access to your Pomodoro timer.',
          this.renderPomodoroSidePanelContent.bind(this)
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
    console.log('Sending tab state for Pomodoro module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pomodoro-element': PomodoroElement;
  }
}
