import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Tab, OUTLINE_TAB, OPEN_TAB_EVENT } from "../side-panel-element";
import sidePanelDrawerElementStyles from "./side-panel-drawer-element.styles";
import base from "../../../../../lib/styles/base";
import { addStyles } from "../../../../../lib/model/util";

const DEFAULT_DRAWER_WIDTH = 8;
@customElement("side-panel-drawer-element")
export class SidePanelDrawerElement extends LitElement {
  static styles = [sidePanelDrawerElementStyles, base];

  @state()
  selectedTab: Tab = OUTLINE_TAB;

  @property()
  openDrawerWidth: number = DEFAULT_DRAWER_WIDTH;

  @property()
  previousDrawerWidth: number = DEFAULT_DRAWER_WIDTH;

  @property()
  panelStyles = {
    width: `${this.openDrawerWidth}rem`,
  };

  handleTabOpenEvent() {
    this.openDrawerWidth =
      this.openDrawerWidth === 0 ? this.previousDrawerWidth : 0;

    this.panelStyles.width = `${this.openDrawerWidth}rem`;

    console.log(this.panelStyles);
    this.requestUpdate();
  }

  @property()
  isClicked: boolean = false;

  // @ts-ignore
  @query(".panel-container")
  panelContainer: HTMLElement;

  constructor() {
    super();

    // @ts-ignore
    document.addEventListener(
      OPEN_TAB_EVENT,
      this.handleTabOpenEvent.bind(this)
    );

    document.addEventListener("pointerup", () => {
      this.isClicked = false;
      document.body.style.cursor = "default";
    });
    document.addEventListener("pointermove", (e) => {
      if (!this.isClicked) return;

      document.body.style.cursor = "col-resize";

      if (e.x < 150) {
        if (e.x < 100) {
          this.openDrawerWidth = 0;
          this.panelStyles.width = `${this.openDrawerWidth}rem`;
          this.requestUpdate();
        }

        return;
      }

      const rect = this.panelContainer!.getBoundingClientRect();
      const newSide = e.x - 2.5;
      const newWidth = newSide - rect.left;
      this.panelStyles.width = `${newWidth / 16}rem`;
      this.previousDrawerWidth = newWidth / 16;

      e.preventDefault();
    });
  }

  render() {
    return html`
      <div
        class="side-panel-drawer-element panel-container"
        style=${addStyles(this.panelStyles)}
      >
        <slot name="side-panel-drawer"></slot>
        <div
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
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "side-panel-drawer-element": SidePanelDrawerElement;
  }
}
