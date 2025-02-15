import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Manuscript } from "../../lib/git/manuscript";
import { formatDate } from "../../lib/model/util";
import base from "../../lib/styles/base";
import { DELETE_MANUSCRIPT_EVENT } from "../../pages/studio-element";

export const infoList = [
  {
    name: "Rename",
    value: "rename",
    icon: "pencil",
  },
  {
    name: "Open in new tab",
    value: "open-in-new-tab",
    icon: "box-arrow-up-right",
  },
  {
    name: "Delete",
    value: "delete",
    icon: "trash",
  },
];

@customElement("manuscript-list-element")
export class ManuscriptListElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .manuscript-bulk-actions {
        display: flex;
        justify-content: space-between;
        align-items: start;
      }

      .manuscripts-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacingSmall);
      }

      .manuscript-title {
        margin-bottom: var(--spacing);
        white-space: pre;
        padding: var(--spacingSmall);
      }
      .line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacingSmall);
        gap: var(--spacingSmall);
      }

      .info {
        border-top: 1px solid var(--primary-25);
        box-shadow: 0 -2px 5px var(--primary-25);
        cursor: pointer;
      }

      .card-size:hover .info {
        box-shadow: 0 -4px 5px var(--primary-25);
      }

      .line span:first-child {
        color: var(--slate-400);
      }
      .manuscript-card {
        padding: var(--spacingSmall);
        transition: all 0.2s;
        cursor: pointer;
        position: relative;
        height: 70%;
      }

      .card-size {
        width: 14rem;
        height: 18rem;
        border: 1px solid var(--slate-300);
        border-radius: 3px;
        overflow: hidden;
      }

      .info {
        width: 100%;
        /* margin-top: auto; */
        /* position: absolute; */
        /* bottom: 0%; */
        /* left: 50%; */
        /* transform: translateX(-50%); */
      }

      sl-menu-item::part(label) {
        margin-left: var(--spacingXSmall);
      }
    `,
    base,
  ];

  @property() manuscripts: Manuscript[] = [];

  @state() isRenamingManuscript: null | Manuscript = null;

  @query(".deleting-dialog") deletingDialog;

  renderLine(name: string, value: string) {
    return html`<div class="line">
      <span>${name}</span><span>${value}</span>
    </div>`;
  }

  deleteManuscriptAction(manuscript: Manuscript) {
    Manuscript.DeleteManuscript(manuscript);
    this.manuscripts = this.manuscripts.filter(
      (m) => m.fileName !== manuscript.fileName
    );

    this.dispatchEvent(
      new CustomEvent<Manuscript[]>(DELETE_MANUSCRIPT_EVENT, {
        bubbles: true,
        composed: true,
        detail: this.manuscripts,
      })
    );
  }

  renderDeletingDialog(manuscript: Manuscript) {
    return html`
      <sl-dialog
        label="Are you sure you want to delete ${manuscript.name}? This cannot be undone."
        class="deleting-dialog"
      >
        <sl-button
          @click=${() => {
            this.deleteManuscriptAction(manuscript);
            this.deletingDialog!.hide();
          }}
          variant="primary"
        >
          Yes</sl-button
        >
        <sl-button
          @click=${() => {
            this.deletingDialog!.hide();
          }}
          >No</sl-button
        >
      </sl-dialog>
    `;
  }

  renderInfoPortion(manuscript: Manuscript) {
    const manuscriptTitle =
      this.isRenamingManuscript?.fileName === manuscript.fileName
        ? html`<sl-input
            value=${manuscript.name}
            @sl-change=${(e: any) => {
              e.stopPropagation();
              manuscript.name = e.target.value;
              Manuscript.SaveManuscriptFSLF(manuscript);
              this.isRenamingManuscript = null;
            }}
          ></sl-input>`
        : html`<h4 class="manuscript-title">${manuscript.name}</h4>`;

    return html`
      <div class="info">
        <div class="title-section">${manuscriptTitle}</div>
        <div class="space-between">
          <sl-tooltip content="Preview">
            <sl-icon-button
              class="preview-button"
              name="eye"
              @click=${(e: any) => {
                e.stopPropagation();
              }}
            ></sl-icon-button>
          </sl-tooltip>
          <sl-dropdown>
            <sl-icon-button
              slot="trigger"
              caret
              name="three-dots-vertical"
              @click=${(e: any) => {
                e.stopPropagation();

                const dropdown = e.target
                  .closest(".info")
                  .querySelector("sl-dropdown");
                if (dropdown.open) {
                  dropdown.hide();
                } else {
                  dropdown.show();
                }
              }}
            ></sl-icon-button>
            <sl-menu
              @click=${(e: any) => {
                e.stopPropagation();
              }}
              id="manuscript-options"
              @sl-select=${(e: any) => {
                e.stopPropagation();
                const value = e.detail.item.value;
                if (value === "rename") {
                  this.isRenamingManuscript = manuscript;
                } else if (value === "open-in-new-tab") {
                  window.open(Manuscript.GetManuscriptURL(manuscript));
                } else if (value === "delete") {
                  this.deletingDialog!.show();
                  // please pull the manuscript logic into here!
                }

                e.target.closest("sl-dropdown").hide();
              }}
            >
              ${infoList.map((info) => {
                return html`<sl-menu-item value="${info.value}">
                  <sl-icon slot="prefix" name=${info.icon}></sl-icon>
                  ${info.name}</sl-menu-item
                > `;
              })}
            </sl-menu>
          </sl-dropdown>
          ${this.renderDeletingDialog(manuscript)}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="manuscript-bulk-actions"></div>
      <div class="manuscripts-container">
        ${this.manuscripts.map((manuscript: Manuscript) => {
          return html`
            <div class="card-size" @click=${() => {}}>
              <sl-tooltip>
                <div slot="content">
                  ${this.renderLine("Version", manuscript.version.toString())}
                  ${this.renderLine("Last Edit", formatDate(manuscript.date))}
                  ${this.renderLine("Created", formatDate(manuscript.date))}
                  ${this.renderLine("File Name", manuscript.fileName)}
                </div>
                <div
                  class="manuscript-card"
                  @click=${(e: any) => {
                    window.location.href =
                      Manuscript.GetManuscriptURL(manuscript);
                  }}
                ></div>
              </sl-tooltip>
              ${this.renderInfoPortion(manuscript)}
            </div>
          `;
        })}
        <slot name="add-manuscript"></slot>
      </div>
    `;
  }
}
