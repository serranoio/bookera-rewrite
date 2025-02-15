import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import panelBarElementStyles from "./panel-bar-element.styles";
import base from "../../../../../lib/styles/base";
import {
  doesClickContainElement,
  sendEvent,
} from "../../../../../lib/model/util";
import {
  BASE_TABS,
  OPEN_TAB_EVENT,
  OUTLINE_TAB,
  Tab,
} from "../side-panel-element";

@customElement("panel-bar-element")
export class PanelBarElement extends LitElement {
  static styles = [panelBarElementStyles, base];

  @state()
  tabs: Tab[] = [...BASE_TABS];

  @state()
  selectedTab: Tab = OUTLINE_TAB;

  render() {
    return html`
      <div
        class="side-panel"
        @click=${(e: any) => {
          const el = doesClickContainElement(e, { nodeName: "SL-ICON-BUTTON" });
          if (!el) return;

          this.selectedTab = BASE_TABS.find(
            (tab) => tab.value === el.dataset.value
          )!;

          sendEvent(this, OPEN_TAB_EVENT, this.selectedTab.value);
        }}
      >
        ${this.tabs.map((tab: Tab) => {
          return html`
            <sl-tooltip content="${tab.name}">
              <sl-icon-button
                data-value=${tab.value}
                class="tab-button ${this.selectedTab.value === tab.value
                  ? "active"
                  : ""}"
                name=${tab.value}
                >${tab.name}</sl-icon-button
              >
            </sl-tooltip>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-bar-element": PanelBarElement;
  }
}
