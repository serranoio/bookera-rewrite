import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import sidePanelElementStyles from "./side-panel-element.styles";
import base from "../../../../lib/styles/base";
import { doesClickContainElement, sendEvent } from "../../../../lib/model/util";
import "./panel-bar-element/panel-bar-element";
import "./side-panel-drawer/side-panel-drawer-element";

export interface Tab {
  name: string;
  value: string;
  hotkey: string;
}

export const OUTLINE_TAB: Tab = {
  name: "Outline",
  value: "files",
  hotkey: "",
};

const SEARCH_TAB: Tab = {
  name: "Search",
  value: "search",
  hotkey: "",
};

const EXTENSIONS_TAB: Tab = {
  name: "Extensions",
  value: "puzzle",
  hotkey: "",
};
export const BASE_TABS: Tab[] = [OUTLINE_TAB, SEARCH_TAB, EXTENSIONS_TAB];

export const OPEN_TAB_EVENT = "open-tab-event";

@customElement("side-panel-element")
export class SidePanelElement extends LitElement {
  static styles = [sidePanelElementStyles, base];

  @state()
  tabs: Tab[] = [...BASE_TABS];

  @state()
  selectedTab: Tab = OUTLINE_TAB;

  render() {
    return html`
      <panel-bar-element .selectedTab=${this.selectedTab} .tabs=${this.tabs}>
      </panel-bar-element>
      <side-panel-drawer-element .selectedTab=${this.selectedTab}>
        <slot name="side-panel-drawer"></slot>
      </side-panel-drawer-element>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "side-panel-element": SidePanelElement;
  }
}
