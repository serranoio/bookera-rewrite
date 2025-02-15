import { ContextConsumer } from "@lit/context";
import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  Label,
  Outline,
  OutlineStatus,
  StudioPageChanges,
  StudioPageData,
  StudioPageView,
  defaultStudioPageData,
  studioPageContext,
} from "../../../../lib/model/context";
import { styleMap } from "lit/directives/style-map.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/dropdown/dropdown.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/menu/menu.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/menu-item/menu-item.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/select/select.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/option/option.js";
import "../../../dialog-element";
import Store from "../../../../lib/viewer/types/store";
import { OutlineSubtype } from "../../create-side-panel-element";
import {
  ExtractContentsMode,
  StudioSettings,
  defaultSettings,
  studioSettingsContext,
} from "../../../../lib/model/settings";
import "../../../badge-element";
import "../../../labels-popup-element";
import FroalaEditor from "froala-editor";
import { NEW_PANEL_EVENT, NewPanelEventType } from "../../../../lib/model/site";
import { createOutline } from "../../body-element";

interface DialogOutline extends Outline {
  isOpened: boolean;
}

enum NoHierarchyOption {
  None = "None",
}

type HierarchyOption = NoHierarchyOption | ExtractContentsMode;

@customElement("outline-notes-panel-element")
export class OutlineNotesPanelElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
      }

      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      sl-details::part(content) {
        padding: 0 var(--spacingXSmall);
        height: 20vh;
      }

      textarea {
        width: 100%;
        height: 100%;
        height: 20rem;
      }

      sl-details {
        position: relative;
      }

      sl-select {
        /* position: absolute; */
        /* right: 21%; */
        /* top: 12.5px; */
      }

      .status-circle {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }
      sl-select::part(expand-icon) {
        display: none;
      }

      sl-select::part(combobox) {
        width: 7rem;
      }

      sl-select::part(listbox) {
        width: fit-content;
      }

      .summary {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: var(--spacingXSmall);
      }

      .labels-status-box {
        display: flex;
        align-items: center;
        /* gap: var(--spacingSmall); */
      }

      .filter-box {
        display: flex;

        justify-content: space-between;
      }

      .filter {
        font-size: var(--text-lg);
        position: relative;
      }

      .filter-string {
        width: 100%;
      }

      .popup-filters {
        background-color: var(--slate-200);
        padding: var(--spacingXSmall);
        border-radius: var(--spacingXSmall);
        display: flex;
        gap: var(--spacingXSmall);
        flex-direction: column;
        width: 15rem;
      }

      sl-popup {
        width: 100%;
        position: relative;
      }

      sl-popup::part(popup) {
        z-index: 9999;
      }

      .number-box {
        position: absolute;
        bottom: 0%;
        right: 0%;
        padding: var(--spacingXXSmall);
        font-size: var(--text-xs);
        border-radius: 50%;
        background-color: var(--slate-500);
        color: var(--slate-200);
      }

      .filter-icon-box {
        position: relative;
      }

      .filter {
      }

      .add-labels-popup {
        background-color: green;
      }

      .anchor {
        position: relative;
      }
    `,
  ];

  @property()
  filteredOutline: Outline[] = [];

  @property()
  outline: Outline[] = [];

  @property()
  isDialogOpened: boolean[] = [];

  @state()
  setDataNow: boolean = true;

  @property()
  currentFilterSet: {
    text: string;
    status: string[];
    labels: string[];
    hierarchy: HierarchyOption;
  } = { text: "", status: [], labels: [], hierarchy: NoHierarchyOption.None };

  @property()
  openFilters: boolean = false;

  @property()
  openLabelsDialog: boolean = false;

  @property()
  studioPageData: StudioPageData = defaultStudioPageData;

  @property()
  dataHasBeenSet: boolean = false;

  changeStudioPageData(ctx) {
    this.studioPageData = ctx;

    this.requestUpdate();

    this.setDataNow = false;
    this.setData();
  }

  _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback: this.changeStudioPageData.bind(this),
  });

  @property()
  settingsData: StudioSettings = defaultSettings;

  _studioSettings = new ContextConsumer(this, {
    context: studioSettingsContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore
      this.settingsData = ctx;
    },
  });

  checkIntersection(labels: Label[], strings: string[]): boolean {
    if (strings.length === 0) {
      return true;
    }

    let found = false;
    labels.forEach((val: Label) => {
      if (strings.includes(val.name)) {
        found = true;
      }
    });

    return found;
  }

  filterByStatus(status: OutlineStatus) {
    if (this.currentFilterSet.status.length === 0) return true;

    return this.currentFilterSet.status.includes(status.replaceAll(" ", "-"));
  }

  filterByHierarchy(outline: Outline): boolean {
    switch (this.currentFilterSet.hierarchy) {
      case NoHierarchyOption.None:
        return true;
      // accpet everything
      case ExtractContentsMode.SUB_HEADING:
        if (outline.h === "H4") return true;
      case ExtractContentsMode.HEADING:
        if (outline.h === "H3") return true;
      case ExtractContentsMode.CHAPTER:
        if (outline.h === "H2") return true;
      case ExtractContentsMode.PART:
        if (outline.h === "H1") return true;
    }

    return false;
  }

  filterOutline() {
    this.filteredOutline = this.outline.filter((outline: Outline) => {
      if (
        outline.name.includes(this.currentFilterSet.text) &&
        this.checkIntersection(outline.labels, this.currentFilterSet.labels) &&
        this.filterByStatus(outline.status) &&
        this.filterByHierarchy(outline)
      )
        return true;

      return false;
    });
  }

  changeFilters(e: any) {
    const val = e.target.value;

    this.currentFilterSet.text = val;

    if (val === "") {
      this.filteredOutline = structuredClone(this.outline);
      return;
    }

    this.filterOutline();
  }

  setData() {
    this.outline = structuredClone(this.studioPageData.content.config.outline!);

    this.filteredOutline = this.outline;

    if (this.outline.length > 0) {
      // all checks go here
      this.setDataNow = false;
    }

    this.filterOutline();
  }

  changeNote(newNote: string, i: number) {
    this.studioPageData.content.config.outline[i].note.body = newNote;

    this.dispatchEvent(
      new CustomEvent(StudioPageChanges, {
        detail: this.studioPageData,
        composed: true,
        bubbles: true,
      })
    );
  }

  getColor(outlineStatus: OutlineStatus) {
    const styles = {};

    switch (outlineStatus) {
      case OutlineStatus.NEW:
        styles.background = "var(--slate-500)";
        break;
      case OutlineStatus.COMPLETE:
        styles.background = "var(--success-500)";
        break;
      case OutlineStatus.EDITING:
        styles.background = "var(--warning-500)";
        break;
      case OutlineStatus.BRAIN_DUMP:
        styles.background = "var(--purple-500)";
        break;
      case OutlineStatus.IN_PROGRESS:
        styles.background = "var(--fuschia-500)";
        break;
    }

    return styles;
  }

  renderStatus(outlineStatus: OutlineStatus, i: number) {
    const styles = this.getColor(outlineStatus);

    return html`
      <sl-select
        value=${outlineStatus.replaceAll(" ", "-")}
        size="small"
        expand-icon=""
        @click=${(e: any) => {
          const val = e.target.value.replaceAll("-", " ");
          this.studioPageData.content.config.outline[i].status = val;

          this.dispatchEvent(
            new CustomEvent(StudioPageChanges, {
              detail: this.studioPageData,
              composed: true,
              bubbles: true,
            })
          );
        }}
      >
        <span
          slot="suffix"
          style=${styleMap(styles)}
          class="status-circle"
        ></span>

        ${Object.values(OutlineStatus).map((value: string) => {
          const newValue = value.replaceAll(" ", "-");
          return html`<sl-option value="${newValue}">${value}</sl-option>`;
        })}
      </sl-select>
    `;
  }

  renderStatusDropdown() {
    return html`
      <sl-select
        placeholder="Status"
        multiple
        clearable
        size="small"
        expand-icon=""
        @sl-change=${(e: any) => {
          const values = e.target.value;
          this.currentFilterSet.status = values;
          this.requestUpdate();
        }}
      >
        <span
          @click=${(event) => {
            event.stopPropagation();
          }}
          slot="suffix"
          class="status-circle"
        ></span>

        ${Object.values(OutlineStatus).map((value: string) => {
          const newValue = value.replaceAll(" ", "-");

          const styles = this.getColor(value as OutlineStatus);

          return html`<sl-option value="${newValue}"
            ><span
              slot="suffix"
              style=${styleMap(styles)}
              class="status-circle"
            ></span
            >${value}</sl-option
          >`;
        })}
      </sl-select>
    `;
  }

  renderHierarchyDropdown() {
    return html`
      <sl-select
        placeholder="Hierarchy"
        clearable
        size="small"
        expand-icon=""
        @sl-change=${(e: any) => {
          const value = e.target.value;
          if (value === "") {
            this.currentFilterSet.hierarchy = NoHierarchyOption.None;
          } else {
            this.currentFilterSet.hierarchy = value;
          }
          this.requestUpdate();
        }}
      >
        <span
          @click=${(event) => {
            event.stopPropagation();
          }}
          slot="suffix"
          class="status-circle"
        ></span>

        ${Object.values(ExtractContentsMode).map((value: string) => {
          const newValue = value.replaceAll(" ", "-");

          const styles = this.getColor(value as OutlineStatus);

          return html`<sl-option value="${newValue}"
            ><span
              slot="suffix"
              style=${styleMap(styles)}
              class="status-circle"
            ></span
            >${value}</sl-option
          >`;
        })}
      </sl-select>
    `;
  }

  renderLabelsDropdown() {
    return html`
      <sl-select
        placeholder="Labels"
        multiple
        clearable
        size="small"
        expand-icon=""
        @sl-change=${(e: any) => {
          const values = e.target.value;
          this.currentFilterSet.labels = values;
          this.requestUpdate();
        }}
      >
        <span
          @click=${(event) => {
            event.stopPropagation();
          }}
          slot="suffix"
          class="status-circle"
        ></span>

        ${this.settingsData.labels.map((label: Label) => {
          const newValue = label.name.replaceAll(" ", "_");

          return html`<sl-option value="${newValue}"
            ><span slot="suffix" class="status-circle"></span>
            <badge-element .color=${label.color}>${label.name}</badge-element>
          </sl-option>`;
        })}
      </sl-select>
    `;
  }

  calculateFiltersetLength() {
    return (
      this.currentFilterSet.labels.length + this.currentFilterSet.status.length
    );
  }

  renderFilters() {
    return html`
      <div class="filter-box">
        <sl-input
          class="filter-string"
          placeholder="filter"
          @sl-input=${this.changeFilters}
        ></sl-input>
        <sl-popup placement="left" ?active=${this.openFilters} hoist>
          <div class="filter-icon-box" slot="anchor">
            <sl-icon-button
              data-test="filter-button"
              class="filter"
              name="filter"
              @click=${() => {
                this.openFilters = !this.openFilters;
              }}
            >
            </sl-icon-button>
            ${this.calculateFiltersetLength() > 0
              ? html`<span class="number-box"
                  >${this.calculateFiltersetLength()}</span
                >`
              : ""}
          </div>
          <div class="popup-filters">
            ${this.renderStatusDropdown()} ${this.renderLabelsDropdown()}
            ${this.renderHierarchyDropdown()}
          </div>
        </sl-popup>
      </div>
    `;
  }

  renderLabels(labels: Label[], posisition: number) {
    let content = html` <div slot="tooltip-content">
      ${labels.map(
        (label: Label) =>
          html`<badge-element .color=${label.color}
            >${label.name}</badge-element
          >`
      )}
    </div>`;

    let tagIcon = "tag";

    if (labels.length === 0) {
      content = html`<span slot="tooltip-content">Add Labels</span>`;
    }
    if (labels.length > 1) {
      tagIcon += "s";
    }

    return html`
      <div class="anchor">
        <labels-popup-element .position=${posisition} .tag_icon=${tagIcon}>
          ${content}
          <div>ehi</div>
        </labels-popup-element>
      </div>
    `;
  }

  renderOutline() {
    return html`${this.filteredOutline.map((outline: Outline, i: number) => {
      return html`
			<dialog-element> 
				<div class="summary" slot="summary">
					<p>${outline.name}</p>
					<div class="labels-status-box">
						<sl-tooltip content="open ${outline.name} in a panel">
							<sl-icon-button name="arrows-angle-expand" @click=${() => {
                this.dispatchEvent(
                  new CustomEvent<NewPanelEventType>(NEW_PANEL_EVENT, {
                    detail: {
                      type: StudioPageView.Body,
                      name: outline.name,
                      id: outline.id,
                      extraData: { h: outline.h },
                    },
                    composed: true,
                    bubbles: true,
                  })
                );
              }}></sl-icon-button>
						</sl-tooltip>
						${this.renderLabels(outline.labels, i)}
						${this.renderStatus(outline.status, i)}
					</div>
				</div>
				<textarea @sl-change=${(e: any) => {
          this.changeNote(outline, e.target.value);
        }} value=${outline.note.body}></textarea>
			</dialog-element>
		</div>
			`;
    })}`;
  }

  render() {
    this.setData();

    return html` ${this.renderFilters()} ${this.renderOutline()} `;
  }
}
