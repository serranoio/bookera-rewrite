import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('pomodoro-element')
export class PomodoroElement extends ModuleElement {
  renderInSettings() {
    return html`<div>Pomodoro Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Pomodoro Side Panel Content</div>`;
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
