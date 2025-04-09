import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('module-element')
export class ModuleElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'module-element': ModuleElement;
  }
}
