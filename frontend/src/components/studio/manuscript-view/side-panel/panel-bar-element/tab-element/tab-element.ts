import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Tab } from "../../../../../../lib/model/this.tab";
import { PanelBarPosition } from "../../side-panel-element";
import base from "../../../../../../lib/stylesheets/base";
import tabElementStyles from "./tab-element.styles";

@customElement("tab-element")
export class TabElement extends LitElement {
  static styles = [base, tabElementStyles];

  @state()
  tab: Tab;

  @state()
  _selectedTab: Tab | null = null;

  set selectedTab(value: Tab) {
    this._selectedTab = value;
  }

  @state()
  _panelBarPosition!: PanelBarPosition;

  set panelBarPosition(value: PanelBarPosition) {
    this._panelBarPosition = value;
  }

  constructor(tab: Tab) {
    super();
    this.tab = tab;
  }

  render() {
    if (this.tab.menuItems) {
      return html`
        <div class=${`${this._panelBarPosition}-div`}>
          <sl-tooltip content="${this.tab.name!}">
            <sl-dropdown>
              <sl-icon-button
                slot="trigger"
                data-value=${this.tab.value!}
                class="tab-button ${this._selectedTab.value === this.tab.value
                  ? "active"
                  : ""}"
                name=${this.tab.value!}
                >${this.tab.name}</sl-icon-button
              >
              <sl-menu> ${this.tab.menuItems} </sl-menu>
            </sl-dropdown>
          </sl-tooltip>
        </div>
      `;
    }

    return html`
      <div class=${`${this._panelBarPosition}-div`}>
        <sl-tooltip content="${this.tab.name}">
          <sl-icon-button
            data-value=${this.tab.value}
            class="tab-button ${this._selectedTab.value === this.tab.value
              ? "active"
              : ""}"
            name=${this.tab.value}
            >${this.tab.name}</sl-icon-button
          >
        </sl-tooltip>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tab-element": TabElement;
  }
}
