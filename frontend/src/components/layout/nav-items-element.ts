import { LitElement } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import config from "../../twind.config";
import install from "@twind/with-web-components";
import { html } from "lit";
import {
  BACK_TO_STUDIO,
  BOOKERA_STUDIO,
  dashedCase,
} from "../../lib/model/meta";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/components/button/button.js";

@customElement("nav-items-element")
@install(config)
export class NavItemsElement extends LitElement {
  @property({ type: Array })
  navItems: string[] = [];

  @property({ type: Boolean })
  vertical: boolean = false;

  render() {
    return html`
      <ul class="flex gap-4 ${this.vertical ? "flex-col" : "flex-row"}">
        ${this.navItems.map((item) => {
          let itemHTML = item;
          if (item === BOOKERA_STUDIO) {
            itemHTML = html`<sl-button variant="primary" size="medium" pill
              >${item} +</sl-button
            >`;
          }

          if (item === BACK_TO_STUDIO) {
            item = "studio";
          }

          item = "/" + item;
          return html`<li class="flex items-center justify-center">
            <a
              class="h4 text-slate-800 hover:text-slate-600"
              href=${dashedCase(item)}
              >${itemHTML}</a
            >
          </li>`;
        })}
      </ul>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "nav-items-element": NavItemsElement;
  }
}
