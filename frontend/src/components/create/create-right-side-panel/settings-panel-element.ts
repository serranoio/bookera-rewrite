import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/color-picker/color-picker.js';
import { ContextConsumer } from '@lit/context';
import { Label, StudioPageData, defaultStudioPageData, studioPageContext } from '../../../lib/model/context';
import { Settings, SettingsChanges, StudioSettings, defaultSettings, settingsContext, studioSettingsContext } from '../../../lib/model/settings';
import { styleMap } from 'lit/directives/style-map.js';
import "../../badge-element"
import { notify } from '../../../lib/model/lit';

@customElement('settings-panel-element')
export class SettingsPanelElement extends LitElement {
	static styles = [
		css`
			:host {
				display: block;
			}

			.area {
				padding: var(--spacingXSmall);
			}

			.section h3 {
				padding-left: var(--spacingXSmall);
			}

			.section {
				padding-bottom: var(--spacingSmall);
			}

			.label-form-div {
			}

			.labels {
				display: flex;
				flex-wrap: wrap;
				gap: var(--spacingXXSmall);
			}

			sl-icon-button {
				font-size: var(--size-lg);
			}


			.label-form-div form {
				margin-top: var(--spacingXSmall);
			}

			.label-form-div sl-button {
				width: 100%;
				margin-top: var(--spacingXSmall);
			}

			.label-form-div form div {
				margin-top: var(--spacingXSmall);
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--spacingXSmall);
			}

			badge-element {
				padding: var(--spacingXSmall);
			}

		`

	];

	@property()
	isCreatingNewLabel: boolean = false;

	@property()
	settingsData: StudioSettings = defaultSettings

	_studioSettings = new ContextConsumer(this, {
		context: studioSettingsContext,
		subscribe: true,
		callback(ctx) {
			// @ts-ignore
			this.settingsData = ctx
		}})

	renderArea(title: string, description: string, template: TemplateResult) {
		return html`<div class="area">
			<sl-details open>
				<h3 slot="summary" class="title">${title}</h3>
				<p class="description">${description}</p>
				${template}
			</sl-details>
		</div>`
	}

	renderCreatingNewLabelForm() {
		return html`
				<form @submit=${(e) => {
					e.preventDefault()

					const form = new FormData(e.target)

					const name = form.get("name")!
					const color= form.get("color")!

					if (name === "" && color === "") {
						notify(`Please fill in name and color`, "danger", "fail")
						return
					} else if (name === "") {
						notify(`Please fill in name`, "danger", "fail")
						return
					} else if (color === "") {
						notify(`lease fill in color`, "danger", "fail")
						return
					}
					
					this.settingsData.labels.push({
						name: name,
						color: color
					})
					
					notify(`Created label ${name}`, "success", "")
					this.dispatchEvent(new CustomEvent(SettingsChanges, { composed: true, bubbles: true, detail: this.settingsData }))

				}}>
				<div>
					<sl-input name="name" placeholder="dystopian"></sl-input>
					<sl-color-picker
					name="color"
					label="Select a color"
					swatches="
					#d0021b; #f5a623; #f8e71c; #8b572a; #7ed321; #417505; #bd10e0; #9013fe;
					#4a90e2; #50e3c2; #b8e986; #000; #444; #888; #ccc; #fff;
					"
					></sl-color-picker>
				</div>
				<sl-button 
				type="submit"
				variant="primary">Create Label</sl-button>
				</form>
		`;

	}

	render() {
		return html`
			<div class="section">
				<h3>Note templates</h3>
				<sl-divider></sl-divider>
				${this.renderArea("Create note templates", "Create note templates", html`
				<div class="">
					
					</div>`)}
				${this.renderArea("Set Default Note Templates", "Customize your notes for each chapter", html`
				<div class="">
					
					</div>`)}
			</div>

			<div class="section">
				<h3>Note Labels</h3>
				<sl-divider></sl-divider>
				${this.renderArea("Manage Labels", "Create, Delete the labels for your chapters.", html`
				<div class="label-form-div">
					<div class="labels">
						${this.settingsData.labels.map((label: Label) => {
							return html`
							<badge-element class="padding" .color=${label.color}>${label.name}<sl-icon-button slot="remove" name="x" @click=${() => {
								this.settingsData.labels = this.settingsData.labels.filter((currentLabel: Label) => currentLabel.name !== label.name)
								notify(`Removed label ${label.name}`, "success", "")
								this.dispatchEvent(new CustomEvent(SettingsChanges, { composed: true, bubbles: true, detail: this.settingsData }))

							}}></sl-icon-button></badge-element>`
						})}
						<sl-icon-button @click=${() => {this.isCreatingNewLabel = !this.isCreatingNewLabel}} name="${this.isCreatingNewLabel ? "dash" : "plus"}-circle"></sl-icon-button>
					</div>
					${this.isCreatingNewLabel ? this.renderCreatingNewLabelForm() : ""}
					</div>`)}
			</div>
		`;
	}
}
