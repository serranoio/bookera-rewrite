import { LitElement } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import config from "../../twind.config";
import install from "@twind/with-web-components";
import { html } from "lit";
import "./nav-element";
import "./footer-element";
import { URL_EVENT_CHANGE } from "../../lib/model/site";
import { BOOKERA_STUDIO, MANUSCRIPT } from "../../lib/model/meta";
import { provide } from "@lit/context";
import { urlContext } from "./url-context";
import "../../pages/main-element";
import "../../pages/manuscript-element";
import "../../pages/studio-element";
export const URL_PARAMS_CHANGE = "url-params-change";

@customElement("layout-element")
@install(config)
export class LayoutElement extends LitElement {
  @property({ type: String })
  url = window.location.pathname;

  listenForURLChanges(e: any) {
    this.url = e.detail;
  }

  constructor() {
    super();

    navigation.addEventListener("navigate", () => {
      this.url = window.location.pathname;
    });
    document.addEventListener(
      URL_EVENT_CHANGE,
      this.listenForURLChanges.bind(this)
    );
  }

  @property()
  urlHref = window.location.href;

  sendParamsChange() {
    this.dispatchEvent(
      new CustomEvent(URL_PARAMS_CHANGE, {
        composed: true,
        bubbles: true,
        detail: this.urlHref,
      })
    );
  }

  renderRoutes() {
    if (this.url === "/") {
      return html`<main-element></main-element>`;
    } else if (this.url === "/" + BOOKERA_STUDIO.toLowerCase()) {
      console.log("studio");
      return html`<studio-element></studio-element>`;
    } else if (this.url === MANUSCRIPT) {
      return html`<slot name="create-element-slot"></slot>`;
    }
  }

  render() {
    this.url = window.location.pathname;

    // if (this.urlHref !== window.location.href) {
    // this.urlHref = window.location.href;
    this.sendParamsChange();
    // }

    return html`
      <slot name="nav-element"></slot>
      <slot></slot>
      ${this.renderRoutes()}
      <footer-element></footer-element>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "layout-element": LayoutElement;
  }
}
