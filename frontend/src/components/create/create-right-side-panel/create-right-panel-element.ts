import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import {
  FireViewerEvent,
  StudioPageChanges,
  studioPageContext,
} from "../../../lib/model/context";
import { ContextConsumer } from "@lit/context";
import { ebook } from "../../../lib/model/book";
import config from "../../../twind.config";
import install from "@twind/with-web-components";

@customElement("create-right-panel-element")
@install(config)
export class CreateRightPanelElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
      sl-tab-group::part(tabs) {
        display: flex;
        flex: 1;
      }
      sl-tab-group::part(base) {
        width: 100%;
      }

      sl-tab-group::part(body) {
        height: 100%;
        overflow-y: none;
      }

      sl-tab-group,
      sl-tab-panel {
        height: 100%;
      }

      .tab {
        width: 100%;
        flex: 1;
      }
    `,
  ];

  @query("#drawer")
  drawer: any;

  _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore
      this._studioPageData = ctx;
    },
  });

  async createBook() {
    let body = this._studioPageData.value?.content.body!;
    body = body.innerHTML;

    console.log(body);

    ebook.body.content = body;

    const response = await fetch("http://localhost:8080/v1/book", {
      method: "POST",
      body: JSON.stringify(ebook),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    const id = data.id;

    this.requestUpdate();
    let newStudioPageData = this._studioPageData.value!;
    newStudioPageData = {
      ...newStudioPageData,
      bookID: id,
    };

    this.dispatchEvent(
      new CustomEvent(StudioPageChanges, {
        detail: newStudioPageData,
        composed: true,
        bubbles: true,
      })
    );
  }

  renderSubmitButton() {
    return html`
      <sl-button class="w-[100%]" variant="primary" @click=${async () => {}}
        >Submit</sl-button
      >
    `;
  }

  renderPreviewButton() {
    return html`
      <sl-button
        class="w-[100%]"
        variant="outline"
        @click=${async () => {
          await this.createBook();
          this.dispatchEvent(
            new CustomEvent(FireViewerEvent, {
              bubbles: true,
              composed: true,
              detail: {},
            })
          );

          this.drawer.show();
        }}
        >Preview</sl-button
      >
    `;
  }

  renderPreviewDrawer() {
    return html`
      <sl-drawer
        style="--size: 60%"
        id="drawer"
        label="Book Preview"
        class="drawer-overview"
      >
        <div class="px-2 py-2 h-full bg-slate-100">
          <slot></slot>
        </div>
        <sl-button slot="footer" variant="primary">Close</sl-button>
      </sl-drawer>
    `;
  }

  renderPomodoroTimer() {
    return html`
      <sl-tab slot="nav" panel="productivity">
        <sl-tooltip content="Productivity" hoist>
          <sl-icon-button
            data-test="productivity-button"
            name="clock"
            variant="primary"
            label="productivity tab"
          ></sl-icon-button>
        </sl-tooltip>
      </sl-tab>
    `;
  }

  renderOutlineNotes() {
    return html`
      <sl-tab slot="nav" active panel="outline">
        <sl-tooltip content="Outline Notes" hoist>
          <sl-icon-button
            data-test="outline-notes-button"
            name="file-earmark-text"
            variant="primary"
            label="outline notes"
          ></sl-icon-button>
        </sl-tooltip>
      </sl-tab>
    `;
  }

  questionsButton() {
    return html`<sl-tab slot="nav" panel="help">
      <sl-tooltip content="Help & FAQ" hoist>
        <sl-icon-button
          data-test="info-lg"
          name="info-lg"
          variant="primary"
          label="help"
        ></sl-icon-button>
      </sl-tooltip>
    </sl-tab> `;
  }

  settingsButton() {
    return html`<sl-tab slot="nav" panel="settings">
      <sl-tooltip content="Settings" hoist>
        <sl-icon-button
          data-test="settings-button"
          name="gear"
          variant="primary"
          label="help"
        ></sl-icon-button>
      </sl-tooltip>
    </sl-tab> `;
  }

  render() {
    return html`
      <sl-tab-group class="flex gap-2 w-full bg-slate-100">
        ${this.renderPomodoroTimer()} ${this.renderOutlineNotes()}
        ${this.settingsButton()} ${this.questionsButton()}
        <sl-tab-panel name="productivity"
          ><slot name="productivity"></slot
        ></sl-tab-panel>
        <sl-tab-panel name="outline"
          ><slot name="outline-notes"></slot
        ></sl-tab-panel>
        <sl-tab-panel name="help"></sl-tab-panel>
        <sl-tab-panel name="settings"
          ><slot name="settings"></slot
        ></sl-tab-panel>
      </sl-tab-group>

      <div class="flex flex-col gap-2 w-full">
        ${this.renderPreviewButton()} ${this.renderSubmitButton()}
      </div>
      ${this.renderPreviewDrawer()}
    `;
  }
}
