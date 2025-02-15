import { LitElement, PropertyValueMap } from "lit-element";
import { customElement, property, state, query } from "lit/decorators.js";
import config from "../../twind.config";
import install from "@twind/with-web-components";
import { html, css } from "lit";
import "./nav-items-element";
import {
  BACK_TO_STUDIO,
  BOOKERA_STUDIO,
  MANUSCRIPT,
  companyItems,
  navSize,
  productItems,
} from "../../lib/model/meta";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/components/drawer/drawer.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/input/input.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/dropdown/dropdown.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/menu/menu.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/menu-item/menu-item.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/menu-label/menu-label.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/divider/divider.js";
import { ContextConsumer } from "@lit/context";
import { studioPageContext } from "../../lib/model/context";
import {
  NEW_PANEL_EVENT,
  UPDATE_GRAPH_EVENT,
  URL_EVENT_CHANGE,
} from "../../lib/model/site";
import fs, { configureSingle } from "@zenfs/core";
import { WebAccess } from "@zenfs/dom";
import localforage from "localforage";
import { ManuscriptStoreName, Manuscript } from "../../lib/git/manuscript";
import { getManuscriptFromURL } from "../create/studio/extra-element";
import { styleMap } from "lit/directives/style-map.js";

@customElement("nav-element")
@install(config)
export class NavElement extends LitElement {
  @state()
  sizeAdder = -5;

  @query("#mobile-menu")
  drawer!: SLDrawer;

  @property({ type: String })
  url: string = "";

  @property()
  currentManuscript: Manuscript;

  listenForURLChanges(e: any) {
    this.url = e.detail;
  }

  listenToGraphViewEvent() {
    const container = document.querySelector("#toolbar-container");
  }

  constructor() {
    super();

    document.addEventListener(
      URL_EVENT_CHANGE,
      this.listenForURLChanges.bind(this)
    );

    document.addEventListener(
      UPDATE_GRAPH_EVENT,
      this.listenToGraphViewEvent.bind(this)
    );
    document.addEventListener(
      NEW_PANEL_EVENT,
      this.listenToGraphViewEvent.bind(this)
    );
  }

  @property()
  productItems: string[] = productItems;

  @property()
  manuscript: Manuscript;

  showDrawer() {
    this.drawer.show();
  }

  hideDrawer() {
    this.drawer.hide();
  }

  logo() {
    return html`<img
      src="/android/android-launchericon-192-192.png"
      class="h-[${navSize + this.sizeAdder}px] w-[${navSize +
      this.sizeAdder}px]"
    />`;
  }

  getCreateBookMenu() {
    return html`
      <div class="flex gap-1 items-start justify-center">
        <sl-dropdown>
          <sl-button slot="trigger" size="small" caret>File</sl-button>
          <sl-menu>
            <sl-menu-item value="cut">New</sl-menu-item>
            <sl-menu-item value="copy">Open</sl-menu-item>
            <sl-menu-item value="paste">Make Copy</sl-menu-item>
            <sl-divider
              style="border: 1px solid var(--sl-color-neutral-200);"
            ></sl-divider>
            <sl-menu-item value="cut">Share</sl-menu-item>
            <sl-menu-item value="copy">Email</sl-menu-item>
            <sl-menu-item value="paste">Download</sl-menu-item>
            <sl-divider
              style="border: 1px solid var(--sl-color-neutral-200);"
            ></sl-divider>
            <sl-menu-item value="cut">Version History</sl-menu-item>
          </sl-menu>
        </sl-dropdown>

        <sl-button
          size="small"
          @click=${async () => {
            // !!!!! ALL OF THIS LOGIC NEEDS TO BE REWRITTEN
            await Manuscript.SaveManuscriptToFS();

            // const dirHandle = await window.showDirectoryPicker();

            // await configureSingle({ backend: WebAccess, handle: dirHandle });

            // const title = getManuscriptFromURL();

            // const NewStore = localforage.createInstance({
            //   name: ManuscriptStoreName,
            // });

            // const contents = await NewStore.getItem(title);
            // const obj: Manuscript = JSON.parse(contents.toString());
            // fs.writeFileSync(obj.fileName, JSON.stringify(obj));
          }}
          >Save</sl-button
        >
      </div>
    `;
  }

  async fillManuscriptData() {
    this.manuscript = await Manuscript.ReadManuscriptFromLF(
      getManuscriptFromURL()
    );
  }

  getCreateStudioView() {
    if (window.location.pathname.includes(MANUSCRIPT)) {
      this.fillManuscriptData();

      return html`
        <div class="flex gap-2 items-center justify-center">
          <a class="h3 text-slate-800 flex gap-2 items-center" href="/">
            ${this.logo()}
          </a>
          <div class="flex gap-1 flex-col items-start justify-center">
            <sl-input
              size="small"
              value=${this.manuscript?.name}
              placeholder="Untitled Book"
              @sl-change=${(e) => {
                console.log(e);
                this.manuscript.name = e.target.value;

                Manuscript.WriteManuscriptsToLF([this.manuscript], false);
              }}
            ></sl-input>
            ${this.getCreateBookMenu()}
          </div>
        </div>
        <div id="toolbar-container"></div>

        <slot name="toolbar"></slot>
      `;
    }

    return html`<a class="h3 text-slate-800 flex gap-2 items-center" href="/">
      ${this.logo()}
      <h3>Bookera</h3>
    </a>`;
  }

  renderProductLinks() {
    if (
      window.location.pathname.includes(BOOKERA_STUDIO.toLocaleLowerCase()) &&
      !window.location.pathname.includes(MANUSCRIPT)
    ) {
      return [];
    } else if (window.location.pathname.includes(MANUSCRIPT)) {
      return [BACK_TO_STUDIO];
    }

    return this.productItems;
  }

  hideNav() {
    this.isNavHidden = !this.isNavHidden;
  }

  @property()
  isNavHidden = false;

  getIsStudio() {
    return window.location.pathname.includes(BOOKERA_STUDIO.slice(1));
  }

  render() {
    const productItems = this.renderProductLinks();

    const isStudio = this.getIsStudio();

    return html`
      <nav
        class="h-[${navSize}px] transition-all sm:px-4 px-2 py-2.5 ${isStudio
          ? "fixed z-[10] top-0 left-0 right-0 opacity-[0.9]"
          : ""}
					${this.isNavHidden ? "-translate-y-[100%] " : ""}
					
					"
        style=${styleMap({
          backdropFilter: "blur(1px)",
        })}
      >
        <button
          class="
          ${!isStudio ? "hidden" : ""}
					${this.isNavHidden ? "translate-y-[100%]" : ""}
					absolute z-[10] bottom-0 right-[50%] text-sm color-slate-600 translate-y-[50%] translate-x-1/2 bg-slate-100 rounded-bl-[10px] rounded-br-[10px] w-6 h-6 flex items-center justify-center trapezoid"
          @click=${() => this.hideNav()}
        >
          v
        </button>
        <div
          class="h-full bg-slate-100  flex items-center justify-between sm:px-8 rounded-full px-4"
        >
          ${this.getCreateStudioView()}
          <div>
            <div class="hidden sm:block">
              <nav-items-element .navItems=${companyItems}></nav-items-element>
            </div>
            <div class="hidden sm:block">
              <nav-items-element .navItems=${productItems}></nav-items-element>
            </div>
          </div>

          <div class="sm:hidden">
            <sl-button
              @click=${() => this.showDrawer()}
              label="Menu"
              size="medium"
              circle
              class="flex justify-center items-center"
            >
              <sl-icon name="list"></sl-icon>
            </sl-button>
          </div>
        </div>
      </nav>

      <sl-drawer --size="100px" label="Menu" placement="start" id="mobile-menu">
        <div @click=${() => this.hideDrawer()}>
          <nav-items-element
            vertical
            .navItems=${companyItems}
          ></nav-items-element>
          <nav-items-element
            vertical
            .navItems=${productItems}
          ></nav-items-element>
        </div>
        <sl-button slot="footer" variant="primary">Close</sl-button>
      </sl-drawer>
    `;
  }

  static styles = css`
    :host {
    }
    .luminate {
      position: absolute;
      z-index: -1;
      left: -5%;
      top: 0%;
    }
    svg {
      display: block;
    }

    @keyframes sun {
      from {
        transform: rotate(3deg);
      }

      50% {
        left: 100%;
        transform: rotate(30deg) translateY(30%);
      }

      to {
        left: 100%;
        transform: rotate(30deg) translateY(30%);
      }
    }

    .luminate g path {
      z-index: -1;
      opacity: 0.5;
      animation: svg 20s infinite, step 20s ease-in infinite;
      /* stroke: hsl(var(--primary)); */
      stroke-width: 6;
      stroke-linecap: round;
      width: 100%;
    }

    @keyframes svg {
      from {
        stroke-dasharray: 20 17;
      }

      to {
        stroke-dasharray: 60 30;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-element": NavElement;
  }
}
