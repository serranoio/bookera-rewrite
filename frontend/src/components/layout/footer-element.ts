import { LitElement } from "lit-element";
import { customElement } from "lit/decorators.js";
import config from "../../twind.config";
import install from "@twind/with-web-components";
import { html } from "lit";
import "./nav-items-element";
import { companyItems, productItems } from "../../lib/model/util";

@customElement("footer-element")
@install(config)
export class FooterElement extends LitElement {
  render() {
    return html`
      <footer class="px-4 sm:py-8 bg-slate-100 relative">
        <span
          class="absolute top-[2%] right-[50%] translate-x-[50%] text-slate-500"
          >Made with ❤️</span
        >
        <div
          class="h-full max-w-[80rem] mx-auto grid-cols-2 items-center justify-center align-center sm:grid hidden"
        >
          <div>
            <h3 class="text-center">
              <a class="h3 text-slate-800" href="/">Bookera</a>
              <a target="_blank" href="https://serranolabs.io" class="block"
                >A product of Serrano Labs LLC ${new Date().getFullYear()}</a
              >
            </h3>
            <div class="flex gap-4 justify-center mt-2">
              <a target="_blank" href="https://discord.gg/GFyGTcmjVD">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none" />
                  <circle cx="92" cy="140" r="12" />
                  <circle cx="164" cy="140" r="12" />
                  <path
                    d="M153.44,73.69l5-19.63a8.1,8.1,0,0,1,9.21-6L203.69,54A8.08,8.08,0,0,1,210.23,60l29.53,116.37a8,8,0,0,1-4.55,9.24l-67,29.7a8.15,8.15,0,0,1-11-4.56L147,183.06"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                  <path
                    d="M102.56,73.69l-5-19.63a8.1,8.1,0,0,0-9.21-6L52.31,54A8.08,8.08,0,0,0,45.77,60L16.24,176.35a8,8,0,0,0,4.55,9.24l67,29.7a8.15,8.15,0,0,0,11-4.56L109,183.06"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                  <path
                    d="M80,78.31A178.94,178.94,0,0,1,128,72a178.94,178.94,0,0,1,48,6.31"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                  <path
                    d="M176,177.69A178.94,178.94,0,0,1,128,184a178.94,178.94,0,0,1-48-6.31"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <nav-items-element
              class="text-center"
              vertical
              .navItems=${companyItems}
            ></nav-items-element>
            <nav-items-element
              class="sm:block hidden"
              vertical
              class="text-center"
              .navItems=${productItems}
            ></nav-items-element>
          </div>
        </div>
      </footer>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "footer-element": FooterElement;
  }
}
