import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { GraphData, GraphDataContext, Translation, UpdateTranslation, UpdateZoomLevel, defaultGraphData } from './graph-element';
import { ContextConsumer } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('node-element')
export class NodeElement extends LitElement {
	static styles = [
		css`
			:host {
				display: block;

				transform-origin: center;
			}
			
			.node {
				position: absolute;
				transition: all .2s;
			}
			
			.fr-wrapper {
				border-radius: var(--spacingXSmall);
			}

			.title-div {
				position: absolute;
				top: 0;
				transform: translateY(-100%);
				left: 0;
			}
		`
	];



		constructor() {
			super()

		}

	render() {

		return html`
		<div class="node">
			<div class="title-div">
				<slot name="title"></slot>
			</div>
			<slot></slot>
		</div>
		`;
	}
}
