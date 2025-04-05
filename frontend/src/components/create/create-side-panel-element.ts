import {
  CSSResultGroup,
  LitElement,
  PropertyValueMap,
  TemplateResult,
} from "lit-element";
import { customElement, state } from "lit/decorators.js";
import install from "@twind/with-web-components";
import { css, html } from "lit";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tree/tree.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab/tab.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab-group/tab-group.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab-panel/tab-panel.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tree-item/tree-item.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/details/details.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/icon-button/icon-button.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/tooltip/tooltip.js";
import {
  BodyView,
  BookeraPlusView,
  ConfigUpdateEvent,
  FrontMatterView,
  OtherViews,
  Outline,
  SlTreeChangeEvent,
  StudioPageData,
  StudioPageView,
  TypeSettingView,
  defaultStudioPageData,
  intermediateStudioPageContext,
  studioPageContext,
  typeStudioPageViewKeys,
} from "../../lib/model/context";
import { titleCase } from "../../lib/model/meta";
import { ContextConsumer } from "@lit/context";
import { styleMap } from "lit/directives/style-map.js";
import {
  CREATE_GRAPH_VIEW_EVENT,
  NEW_PANEL_EVENT,
  NewPanelEventType,
} from "../../lib/model/site";

export interface OutlineSubtype {
  children: OutlineSubtype[];
  self: Outline;
  parent: OutlineSubtype | null;
}

export const defaultParentOutline: Outline = {
  h: "",
  name: "",
  id: "",
};

const convertHToValue = (h: string): number => {
  if (h === "H1") {
    return 0;
  } else if (h === "H2") {
    return 1;
  } else if (h === "H3") {
    return 2;
  } else if (h === "H4") {
    return 3;
  } else if (h === "H5") {
    return 4;
  } else if (h === "H6") {
    return 5;
  }

  return -1;
};
export const expandOutlineRecursively = (
  parentOutlineSubtype: OutlineSubtype,
  headersLeft: Outline[]
): OutlineSubtype => {
  if (headersLeft.length === 0) {
    return parentOutlineSubtype;
  }
  const self = headersLeft.shift();
  const outlineSubtype: OutlineSubtype = {
    children: [],
    self: self,
  };
  // h1 vs h2
  const parentValue = convertHToValue(parentOutlineSubtype.self.h);
  const selfValue = convertHToValue(outlineSubtype.self.h);
  if (parentValue < selfValue) {
    outlineSubtype.parent = parentOutlineSubtype;
    parentOutlineSubtype.children.push(outlineSubtype);
    return expandOutlineRecursively(outlineSubtype, headersLeft);
  } else if (parentValue === selfValue) {
    // h2, h2, then go back to parent and hook there
    parentOutlineSubtype.parent?.children.push(outlineSubtype);
    outlineSubtype.parent = parentOutlineSubtype.parent;
    return expandOutlineRecursively(outlineSubtype, headersLeft);
  } else {
    // h2 vs h1
    // h1
    // h2
    // h1
    // then the next one should become the parent
    // traverse up until you see the same. then implant

    let parent = parentOutlineSubtype.parent;

    let innerParentValue = convertHToValue(parent.self.h);
    if (innerParentValue < selfValue) {
      outlineSubtype.parent = parent;
      parent?.children.push(outlineSubtype);
      return expandOutlineRecursively(outlineSubtype, headersLeft);
    }

    while (innerParentValue !== selfValue) {
      parent = parent.parent;
      innerParentValue = convertHToValue(parent?.self.h);

      if (innerParentValue < selfValue) {
        outlineSubtype.parent = parent;
        parent.children.push(outlineSubtype);
        return expandOutlineRecursively(outlineSubtype, headersLeft);
      }
    }

    outlineSubtype.parent = parent?.parent!;

    parent?.parent?.children.push(outlineSubtype);
    return expandOutlineRecursively(outlineSubtype, headersLeft);
  }
};

export const convertOutlineToTree = (outline: Outline[]): OutlineSubtype => {
  const headersLeft = structuredClone(outline);

  const outlineSubtype: OutlineSubtype = {
    parent: null,
    self: defaultParentOutline,
    children: [],
  };

  expandOutlineRecursively(outlineSubtype, headersLeft);

  return outlineSubtype;
};

@customElement("create-side-panel-element")
export class CreateSidePanelElement extends LitElement {
  static styles = css`
    sl-tree-item::part(item) {
      background-color: var(--sl-color-neutral-100);
      border-width: 8px;

      /* display: flex; */
      /* justify-content: space-between; */
    }

    sl-tree-item::part(item--selected) {
      background-color: var(--sl-color-neutral-100);
    }
    sl-tree-item::part(label) {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .tree-item {
      /* display: flex; */
      /* justify-content: space-between; */
    }

    :host(:not([aria-disabled="true"])) .tree-item--selected .tree-item__item {
      color: green;
    }
  `;

  _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore
      this._studioPageData = ctx;
    },
  });

  matchCurrentViewToExpand() {
    // @ts-ignore
    if (!this._studioPageData.value?.currrentView) return;

    const view = this._studioPageData.value.currrentView
      .replaceAll(" ", "")
      .toLowerCase();

    if (
      Object.keys(TypeSettingView)
        .map((key) => {
          return key.toLowerCase();
        })
        .includes(view)
    ) {
      return "typesetting";
    }
    if (
      Object.keys(FrontMatterView)
        .map((key) => {
          return key.toLowerCase();
        })
        .includes(view)
    ) {
      return "frontmatter";
    }
    if (
      Object.keys(BookeraPlusView)
        .map((key) => {
          return key.toLowerCase();
        })
        .includes(view)
    ) {
      return "bookeraplus";
    }

    return "";
  }

  setExpanded(key: typeStudioPageViewKeys) {
    return key.toLowerCase() === this.matchCurrentViewToExpand();
  }

  getDetails(key: typeStudioPageViewKeys) {
    let inside;

    if (key === "Body") {
      inside = BodyView;
    } else if (key === "BookeraPlus") {
      inside = BookeraPlusView;
    } else if (key === "Frontmatter") {
      inside = FrontMatterView;
    } else if (key === "Typesetting") {
      inside = TypeSettingView;
    }

    return html`
      ${Object.keys(inside).map((key) => {
        return html`
          <sl-tree-item
            ?selected=${key.toLowerCase() ===
            this._studioPageData.value?.currrentView?.toLowerCase()}
          >
            ${titleCase(key)}
          </sl-tree-item>
        `;
      })}
    `;
  }

  dragElement(e) {
    console.log(
      e,
      "this functionality is not done. Let's make the graph, lol!"
    );
  }

  constructOutlineHTML(outlineSubtype: OutlineSubtype): TemplateResult {
    const self = outlineSubtype.self;

    // <sl-button @click=${this.dragElement}>drag</sl-button>
    return html`<sl-tree-item expanded
      ><a href=${"/studio#" + self.id}>${self.name}</a
      >${outlineSubtype.children.map((child) =>
        this.constructOutlineHTML(child)
      )}</sl-tree-item
    >`;
  }

  expandOutline() {
    if (!this._studioPageData.value?.content) return;

    const outlineSubtype = convertOutlineToTree(
      this._studioPageData.value.content.config.outline
    );

    let html = [];
    for (const child of outlineSubtype.children) {
      html.push(this.constructOutlineHTML(child));
    }

    return html;
  }

  constructor() {
    super();
  }

  changeSelection(e: any) {
    const slTreeItem = e.detail.selection[0];
    const a = slTreeItem.querySelector("a");
    if (!a) return;

    if (a.href.includes("studio")) {
      const titleID = a.href.split("#")[1];
      const titleElement = this._studioPageData.value?.siteConfig.editorDiv
        ?.querySelector("iframe")
        ?.contentDocument?.getElementByID(titleID)!;

      titleElement.scrollIntoView({ behavior: "smooth", block: "start" });

      return;
    }

    this.dispatchEvent(
      new CustomEvent(SlTreeChangeEvent, {
        detail: slTreeItem.innerText,
        bubbles: true,
        composed: true,
      })
    );
  }

  renderBodyButtons() {
    return html`
      <div class="button-box">
        <sl-tooltip content="Open graph view">
          <sl-icon-button
            name="diagram-3"
            label="diagram"
            @click=${() => {
              this.dispatchEvent(
                new CustomEvent<NewPanelEventType>(NEW_PANEL_EVENT, {
                  detail: { type: OtherViews.BodyGraphView, name: "Graph" },
                  composed: true,
                  bubbles: true,
                })
              );
            }}
          ></sl-icon-button>
        </sl-tooltip>
      </div>
    `;
  }

  render() {
    return html`
      <section class="h-[100vh]">
        <sl-tree @sl-selection-change=${this.changeSelection}>
          ${Object.keys(StudioPageView).map((key) => {
            return html`
              <sl-tree-item
                class="tree-item"
                @dblclick=${() => {
                  this.dispatchEvent(
                    new CustomEvent<NewPanelEventType>(NEW_PANEL_EVENT, {
                      detail: { type: StudioPageView.Body, name: "Body" },
                      composed: true,
                      bubbles: true,
                    })
                  );
                }}
                ?selected=${key.toLowerCase() ===
                this._studioPageData.value?.currrentView?.toLowerCase()}
              >
                ${titleCase(key)}
                ${key === "Body" ? this.renderBodyButtons() : ""}
                ${key !== "Body" ? this.getDetails(key) : this.expandOutline()}
              </sl-tree-item>
            `;
          })}
        </sl-tree>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "create-side-panel-element": CreateSidePanelElement;
  }
}
