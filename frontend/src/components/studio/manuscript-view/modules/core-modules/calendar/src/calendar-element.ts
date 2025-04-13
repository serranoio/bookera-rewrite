import { ModuleElement } from '../../../module-element';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('calendar-element')
export class CalendarElement extends ModuleElement {
  renderInPanel() {
    return html`<div>Calendar Panel Content</div>`;
  }

  renderInSidePanel() {
    return html`<div>Calendar Side Panel Content</div>`;
  }

  render() {
    return this.renderMode === 'renderInPanel'
      ? this.renderInPanel()
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
