import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { StudioSettings, defaultSettings, studioSettingsContext } from '../lib/model/settings';
import { ContextConsumer } from '@lit/context';
import { Label, StudioPageChanges, StudioPageData, defaultStudioPageData, studioPageContext } from '../lib/model/context';

@customElement('labels-popup-element')
export class LabelsPopupElement extends LitElement {
	static styles = [
		css`
			:host {
				display: block;
			}

			div {
				position: absolute;
				right: 0%;
				transform: translateX(100%);
				background-color: var(--slate-300);
				padding: var(--spacingXXSmall);
				z-index: 999999;
				bottom: 0%;
				width: 7rem;
				border-radius: var(--spacingXSmall);
			}

			sl-option::part(checked-icon) {
				display: none;
			}

			sl-option::part(base) {
				padding: 0;
			}

			badge-element {
				width: 100%;
			}
		`
	];


	@property()
	active= false;


	@property()
	tag_icon: string = "";

	@property()
	position: number = -1;


	@property()
	studioPageData: StudioPageData = defaultStudioPageData

	_studioPageData = new ContextConsumer(this, {
		context: studioPageContext,
		subscribe: true,
		callback(ctx) {
			// @ts-ignore
			this.studioPageData = ctx
			// @ts-ignore
			this.setDataNow = false;
		}})



	@property()
	settingsData: StudioSettings = defaultSettings

	_studioSettings = new ContextConsumer(this, {
		context: studioSettingsContext,
		subscribe: true,
		callback(ctx) {
			// @ts-ignore
			this.settingsData = ctx
		}})

	render() {
		return html`
<div ?hidden=${!this.active}>
<sl-select placeholder="Labels" multiple clearable size="small" expand-icon="" @sl-change=${(e: any) => {
	const list = e.target.value

		const labels = this.settingsData.labels.filter((label: Label) => list.includes(label.name))



	this.studioPageData.content.config.outline[this.position].labels = labels

					// console.log(this.studioPageData.content.config.outline[this.position].labels)
			this.dispatchEvent(new CustomEvent(StudioPageChanges, { detail: this.studioPageData, composed: true, bubbles: true}))
				}}>

					${this.settingsData.labels.map((label: Label) => {
						const newValue = label.name.replaceAll(" ", "_")

						return html`<sl-option value="${newValue}">
							<badge-element .color=${label.color}>${label.name}</badge-element>
					</sl-option>`
					})}
					</sl-select>
</div>
<sl-tooltip>
	<slot slot="content" name="tooltip-content"></slot>
					<sl-icon-button @click=${() => { this.active = !this.active}} name=${this.tag_icon}></sl-icon-button>
	</sl-tooltip>
		`;
	}
}
