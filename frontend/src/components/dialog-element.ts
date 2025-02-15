import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

@customElement('dialog-element')
export class DialogElement extends LitElement {
	static styles = [
		css`
			:host {
				display: block;
			}

			*{
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}

			.dialog {
				padding: 0 var(--spacingXSmall);
			}

			.header {
				display: flex;
				margin-bottom: var(--spacingXSmall);
			}

			.body {
				height: auto;
			}
		`
	];

	@property()
	isOpened: boolean = false;

	render() {
		return html`
		<div class="dialog">
			<div class="header">
			<slot name="summary">
				</slot>
				<sl-icon-button name=${this.isOpened ? "chevron-down" : "chevron-right"} @click=${(e) => {
					this.isOpened = !this.isOpened
					}}></sl-icon-button>
			</div>
			<div class="body" ?hidden=${!this.isOpened}>
				<slot></slot>
			</div>
			</div>
		
		`;
	}
}
