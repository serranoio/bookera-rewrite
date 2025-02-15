import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js';
import { ContextProvider, createContext } from "@lit/context";


export interface GraphData {
	zoomLevel: number;
}

export const GraphDataContextKey = "graph-data-context"
export const GraphDataContext = createContext<GraphData>(Symbol(GraphDataContextKey));
export const defaultGraphData: GraphData = {
	zoomLevel: 0
}

export const UpdateZoomLevel = "update-zoom-level"

export const UpdateTranslation = "update-translation"

export interface Translation {
	x: number;
	y: number;
}


@customElement('graph-element')
export class GraphElement extends LitElement {
	static styles = [
		css`
			:host {
				display: block;
			}

			.graph {
				display: flex;
				flex-wrap: wrap;
				overflow: hidden;
				background-image: radial-gradient(black 1px, transparent 0);
  background-size: 40px 40px;
	position: relative;
			}

			::slotted(*):not(.custom-controls){
				position: absolute;
			}

			.controls {
				z-index: 99999;
				display: flex;
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				gap: var(--spacing);
			}

			.render-layer {
				width: 100%;
				height: 100%;
			}
		`
	];

	@property()
	height: number;

	@property()
	zoomLevel: number = 0;

	@property()
	tree: any;

	@property()
	zoomRate: number = 15;

	@property()
	translationRate: number = 50;

	@property()
	translation: Translation = { x: 0, y: 0 }

	render() {
		const styles = {
			height: this.height
		}

		const renderLayerStyles = {
			transformStyle: `preserve-3d`,
			transform: `perspective(500px) translate(${this.translation.x}px, ${this.translation.y}px) translateZ(${this.zoomLevel}px)`,
			transformOrigin: "center",
			pointerEvents: `auto`
		}

		return html`
		<div style=${styleMap(styles)} class="graph">
			<div class="controls">
				<slot name="custom-controls"></slot>
				<sl-icon-button name="plus-circle" @click=${() => { 
					this.zoomLevel += this.zoomRate
				}}></sl-icon-button>
				<sl-icon-button name="dash-circle" @click=${() => { 
					this.zoomLevel -= this.zoomRate
	}}></sl-icon-button>
		<div class="direction-controls">
			<sl-icon-button name="arrow-left-square" @click=${() => { 
				this.translation.x -= this.translationRate
				this.requestUpdate()
			}}></sl-icon-button>
			<sl-icon-button name="arrow-up-square" @click=${() => { 
				this.translation.y -= this.translationRate
				this.requestUpdate()
			}}></sl-icon-button>
			<sl-icon-button name="arrow-right-square" @click=${() => { 
				this.translation.x += this.translationRate
				this.requestUpdate()
			}}></sl-icon-button>
			<sl-icon-button name="arrow-down-square" @click=${() => { 
				this.translation.y += this.translationRate
				this.requestUpdate()
					}}></sl-icon-button>
		</div>
				</div>
				<div class="render-layer" style=${styleMap(renderLayerStyles)}>
					<slot name="edge"></slot>
					<slot name="node"></slot>
				</div>
		</div>
		`;
	}
}
