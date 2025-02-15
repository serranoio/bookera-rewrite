import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js';

@customElement('badge-element')
export class BadgeElement extends LitElement {
	static styles = [
		css`
			:host {
				display: block;
				padding: var(--spacingXSmall) !important;
			}
			* {
				margin: 0;
				padding: 0;
				/* box-sizing: border-box; */
			}

			.my-badge{
				border-radius: var(--spacingXSmall);
				padding: var(--spacingXSmall);
				font-size: var(--size-sm);
				display: flex;
				align-items: center;
			}
		`
	];


	@property()
	color: string = "";

	render() {
		const styles = { 
			backgroundColor: this.color,
			color: "#000"
		}

		return html`
		<span class="my-badge" style=${styleMap(styles)}>
			<slot></slot>
			<slot name="remove"><slot>
		</span>
		`;
	}
}
