import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import base from "../lib/stylesheets/base";
import { createSwapy } from "swapy";
import {
  UPLOADED_FILE_ORDER_CHANGE,
  UploadedFile,
} from "../pages/studio-element";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/icon/icon.js";

@customElement("swappy-element")
export class SwappyElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      #swappy {
        display: flex;
        gap: var(--spacingSmall);
        flex-direction: column;
      }

      .manuscript-card {
        /* width: 14rem; */
        border: 1px solid var(--slate-300);
        border-radius: 3px;
        /* padding: var(--spacingSmall); */
        transition: all 0.2s;
        cursor: pointer;
        position: relative;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .columns {
        height: 100%;
      }

      .numbers {
        display: flex;
        flex-direction: column;
        /* justify-content: space-between; */
        /* align-items: center; */
        gap: var(--spacingSmall);
      }

      .center-container {
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .numbers,
      #swappy {
        height: 100%;
      }

      .manuscript-card:hover {
        /* box-shadow: 0 0 1px 1px var(--primary); */
      }

      .main-order {
        border-right: 1px solid var(--slate-300);
        margin-right: var(--spacingXSmall);
      }

      .icon-button-container {
        color: green;
        display: flex;
        justify-content: start;
        align-items: center;
        gap: var(--spacingXSmall);
      }

      .check-all::part(base):hover {
        color: var(--success-500);
      }

      .deselect-all::part(base):hover {
        color: var(--error-500);
      }

      .order {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    `,
    base,
  ];

  @state()
  swappy: any;

  @property()
  addedFiles: UploadedFile[] = [];

  @property()
  selectedOrder: Map<number, number> = new Map();

  @property()
  availableNumberStack: number[] = [];

  connectedCallback(): void {
    super.connectedCallback();
  }

  selectAll() {
    Array.from(this.addedFiles)
      .map((file: UploadedFile, num: number) => {
        return num + 1;
      })
      .forEach((num, index) => {
        this.selectedOrder.set(index, num);
      });

    this.availableNumberStack = [];
    this.requestUpdate();
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.selectedOrder = new Map();

    this.selectAll();
    this.sendUpdatedOrder();
  }

  sendUpdatedOrder() {
    let fail = false;
    for (const [key, value] of this.selectedOrder) {
      if (value === -1) {
        fail = true;
      }
    }

    console.log("send event");
    this.dispatchEvent(
      new CustomEvent<{ fail: boolean; order: Map<number, number> }>(
        UPLOADED_FILE_ORDER_CHANGE,
        {
          bubbles: true,
          composed: true,
          detail: {
            fail: fail,
            order: this.selectedOrder,
          },
        }
      )
    );
  }

  clickHandler(e: any) {
    const target = e.target;
    const card = target.closest(".manuscript-card");

    if (!card) return;

    const order = card.querySelector(".order");
    const index = parseInt(card.dataset.index);
    if (order) {
      // if exists, remove
      // order.remove();
      const number = parseInt(order.dataset.selectedNumber);

      this.selectedOrder.set(index, -1);
      this.availableNumberStack.push(number);
    } else {
      this.availableNumberStack.sort();

      this.selectedOrder.set(index, this.availableNumberStack.shift());
    }

    this.sendUpdatedOrder();
    this.requestUpdate();
    // if there is a number on it, remove it
  }

  render() {
    return html`
      <p>Please select the files to change their order</p>

      <div class="">
        <div class="icon-button-container">
          <sl-tooltip content="Select all">
            <sl-icon-button
              class="check-all"
              name="check-all"
              @click=${() => {
                for (const [key, value] of this.selectedOrder) {
                  if (this.selectedOrder.get(key) === -1) {
                    this.selectedOrder.set(
                      key,
                      this.availableNumberStack.shift()
                    );
                  }
                }
                this.sendUpdatedOrder();

                this.requestUpdate();
              }}
            ></sl-icon-button>
          </sl-tooltip>
          <sl-tooltip content="deselect all">
            <sl-icon-button
              class="Deselect-all"
              name="x-circle"
              @click=${() => {
                for (const [key, value] of this.selectedOrder) {
                  this.availableNumberStack.push(value);
                  this.selectedOrder.set(key, -1);
                }

                this.sendUpdatedOrder();
                this.requestUpdate();
              }}
            ></sl-icon-button>
          </sl-tooltip>
        </div>
      </div>
      <div class="layout">
        <div class="files">
          <div id="swappy" @click=${this.clickHandler}>
            ${this.addedFiles.map((file: UploadedFile, num: number) => {
              return html`
                <div
                  data-index=${num}
                  data-swapy-item=${file.name}
                  class="manuscript-card"
                >
                  <p>${file.name}</p>

                  ${this.selectedOrder.get(num) !== -1
                    ? html`<sl-badge
                        data-selected-number=${this.selectedOrder.get(num)}
                        variant="neutral"
                        class="order"
                        >${this.selectedOrder.get(num)}</sl-badge
                      >`
                    : ""}
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    `;
  }
}
