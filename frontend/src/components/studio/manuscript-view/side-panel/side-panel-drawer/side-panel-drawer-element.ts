import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { OpenTabInSidePanel } from "../side-panel-element";
import sidePanelDrawerElementStyles from "./side-panel-drawer-element.styles";
import base from "../../../../../lib/stylesheets/base";
import {
  CLOSE_SIDE_PANEL_EVENT,
  PANEL_RESIZE_EVENT,
} from "../../panel/panel-handle/panel-handle-element";
import { PanelSide } from "../panel-bar-element/panel-bar-element";
import { sendEvent } from "../../../../../lib/model/util";
import { OUTLINE_TAB, Tab } from "../../../../../lib/model/tab";
import { OPEN_SIDE_PANEL_EVENT } from "../../../../../lib/model/panel";

const DEFAULT_DRAWER_WIDTH = 8;
@customElement("side-panel-drawer-element")
export class SidePanelDrawerElement extends LitElement {
  static styles = [sidePanelDrawerElementStyles, base];

  @property() openDrawerWidth: number = DEFAULT_DRAWER_WIDTH;

  @property() previousDrawerWidth: number = DEFAULT_DRAWER_WIDTH;

  @property() closedDrawerWidth: number = 0;

  @property() panelID: PanelSide = "left";

  // @ts-ignore
  @query(".panel-container") panelContainer: HTMLElement;

  handleTabOpenEvent(e) {
    if (
      (this.panelID === "left" && e.detail.panelID === "left") ||
      (this.panelID === "right" && e.detail.panelID === "right")
    ) {
      this.openDrawerWidth =
        this.openDrawerWidth === this.closedDrawerWidth
          ? this.previousDrawerWidth
          : this.closedDrawerWidth;

      this.panelContainer.style.width = `${this.openDrawerWidth}rem`;

      this.requestUpdate();
    }
  }

  openDrawer() {}

  @property() isClicked: boolean = false;

  handlePanelResizeEvent(e: any) {
    this.previousDrawerWidth = e.detail.width;
  }

  handleOpenSidePanel(e: CustomEvent<any>) {
    if (
      this.panelID === "right" &&
      (e.detail.panelID as PanelSide) === "right"
    ) {
      // get panelWidth
      const panelWidth = this.panelContainer.getBoundingClientRect().width;

      if (panelWidth === this.closedDrawerWidth / 16) {
        this.openDrawerWidth = this.previousDrawerWidth;
      } else {
        this.openDrawerWidth = this.closedDrawerWidth;
      }

      this.panelContainer.style.width = `${this.openDrawerWidth}rem`;

      this.requestUpdate();
    }
  }

  handleCloseSidePanel(e: CustomEvent<any>) {
    if (
      this.panelID === "right" &&
      (e.detail.panelID as PanelSide) === "right"
    ) {
      this.openDrawerWidth = this.closedDrawerWidth;

      this.panelContainer.style.width = `${this.openDrawerWidth}rem`;

      this.requestUpdate();
    }
  }

  constructor() {
    super();
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    document.addEventListener(
      PANEL_RESIZE_EVENT,
      this.handlePanelResizeEvent.bind(this)
    );
    // @ts-ignore
    document.addEventListener(
      OpenTabInSidePanel,
      this.handleTabOpenEvent.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      OPEN_SIDE_PANEL_EVENT,
      this.handleOpenSidePanel.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      CLOSE_SIDE_PANEL_EVENT,
      this.handleCloseSidePanel.bind(this)
    );

    this.panelContainer.style.width = `${this.openDrawerWidth}rem`;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="side-panel-drawer-element panel-container">
        <slot name="top-spot"></slot>
        <panel-handle-element
          .minimumWidth=${DEFAULT_DRAWER_WIDTH * 16}
          .parentElement=${this.panelContainer}
          .resetWidthOverride=${(DEFAULT_DRAWER_WIDTH - 4) * 16}
          .openDrawerWidth=${this.openDrawerWidth}
          .closedDrawerWidth=${this.closedDrawerWidth}
          ?left=${this.panelID === "right" ? true : false}
          .panelID=${this.panelID}
          ?right=${this.panelID === "left" ? true : false}
        ></panel-handle-element>
        <!-- <div
          class="handle-box"
          @pointerdown=${() => {
          this.isClicked = true;
          console.log("hello");
        }}
          @pointerup=${() => {
          this.isClicked = false;
        }}
        >
          <div class="handle"></div>
        </div> -->
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "side-panel-drawer-element": SidePanelDrawerElement;
  }
}
