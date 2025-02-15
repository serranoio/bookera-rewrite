import { LitElement  } from 'lit-element';
import { customElement } from 'lit/decorators.js'
import config from '../twind.config'
import install from '@twind/with-web-components'
import { html } from 'lit';
import "../components/hero-element"

@customElement('main-element')
@install(config)
export class MainElement extends LitElement {

	render() {
		return html`<hero-element></hero-element>`
	}
	
}
declare global {
  interface HTMLElementTagNameMap {
    'main-element': MainElement
  }
}
