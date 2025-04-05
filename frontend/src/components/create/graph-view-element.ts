import { ContextConsumer } from "@lit/context";
import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  IntermediatetudioPageChanges,
  Outline,
  StudioPageChanges,
  StudioPageData,
  defaultStudioPageData,
  extractContentsUnderOutline,
  findNextMode,
  getBodyElement,
  intermediattudioPageContext,
  studioPageContext,
  updateOutlineInBody,
} from "../../lib/model/context";
import FroalaEditor from "froala-editor";
import "../libs/graph/graph-element";
import "../libs/graph/node-element";
import { styleMap } from "lit/directives/style-map.js";
import {
  Direction,
  PositiningStrategy,
  attachPositioning,
} from "../libs/graph/graph-utils";
import {
  OutlineSubtype,
  convertOutlineToTree,
  defaultParentOutline,
  expandOutlineRecursively,
} from "./create-side-panel-element";
import { defaultGraphData } from "../libs/graph/graph-element";
import Dagre from "@dagrejs/dagre";
import { UPDATE_GRAPH_EVENT } from "../../lib/model/site";
import {
  StudioSettings,
  defaultSettings,
  studioSettingsContext,
  ExtractContentsMode,
  SettingsChanges,
} from "../../lib/model/settings";

export const NODE_WIDTH = 100;
export const NODE_HEIGHT = 100;

@customElement("graph-view-element")
export class GraphViewElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  @property()
  editorDivs: HTMLElement[] = [];

  @property()
  firstUpdatedPassed = false;

  @property()
  root: any;

  @property()
  studioPageData: StudioPageData = defaultStudioPageData;

  @property()
  settingsData: StudioSettings = defaultSettings;

  _studioSettings = new ContextConsumer(this, {
    context: studioSettingsContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore
      this.settingsData = ctx;
    },
  });

  _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore

      this.studioPageData = ctx;
    },
  });

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.firstUpdatedPassed = true;

    this.root = document.querySelector("renderer-layer-element")?.shadowRoot;

    // ?.shadowRoot?.querySelectorAll("froala-editor"))

    this.renderFroalaEditors();
  }

  @property()
  shownOutline: Outline[] = [];

  gatherOutlineConfig() {
    if (this.studioPageData.content.config.outline.length === 0) {
      return;
    } else if (this.shownOutline.length > 0) {
      return;
    }
    // if we are on sub_heading mode, all subheadings will have their own editor
    // add all subheadings
    // if we are on chapter mode, all chapters will have their own editor
    // add all chapters
    for (
      let i = 0;
      i < this.studioPageData.content.config.outline.length;
      i++
    ) {
      const hValue = this.studioPageData.content.config.outline[i].h;
      switch (this.settingsData.extractContentsConfig.mode) {
        case ExtractContentsMode.SUB_HEADING:
          if (hValue === "H4") {
            this.shownOutline.push(
              this.studioPageData.content.config.outline[i]
            );
          }
        case ExtractContentsMode.HEADING:
          if (hValue === "H3") {
            this.shownOutline.push(
              this.studioPageData.content.config.outline[i]
            );
          }
        case ExtractContentsMode.CHAPTER:
          if (hValue === "H2") {
            this.shownOutline.push(
              this.studioPageData.content.config.outline[i]
            );
          }
        case ExtractContentsMode.PART:
          if (hValue === "H1") {
            this.shownOutline.push(
              this.studioPageData.content.config.outline[i]
            );
          }
      }
    }

    // now we update the editor divs to match

    // console.log(this.editorDivs)
    // // if we cannot find the editorDiv id in the shownOutline

    // for (let i = 0; i < this.editorDivs.length; i++) {
    // 	// go thru all editorDivs,
    // 	let found = false
    // 	for (let j = 0; j < this.shownOutline.length; j++) {
    // 		if (this.editorDivs[i].id === `editor-${this.shownOutline[j].id}`) {
    // 			found = true
    // 			break
    // 		}
    // 	}

    // 		if (!found) {
    // 			const id = this.editorDivs[i].id
    // 			this.editorDivs[i].destroy()

    // 			this.editorDivs =this.editorDivs.filter((editorDiv) => {
    // 				console.log(editorDiv.id, `${id}`)

    // 				return editorDiv.id !== `${id}`})
    // 			i = 0
    // 		}
    // }

    // console.log(this.editorDivs)
  }

  renderFroalaEditors() {
    if (!this.firstUpdatedPassed) this.firstUpdatedPassed = false;

    const body = this.studioPageData.content.body.querySelector("body")!;

    for (let i = 0; i < this.shownOutline.length; i++) {
      const el = this.root.querySelector(`#editor-${this.shownOutline[i].id}`);

      if (!el) return;

      const content = extractContentsUnderOutline(
        this.settingsData.extractContentsConfig,
        body,
        this.shownOutline[i]
      );

      new FroalaEditor(el, {
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
        events: {
          contentChanged: () => {
            const newHTML = el
              .querySelector("iframe")
              .contentDocument.querySelector("body").innerHTML;
            // now that we have the html, we have to insert this back into the origin html
            // find the element
            const originalHTML =
              this.studioPageData.content.body.querySelector("body")!;

            updateOutlineInBody(
              newHTML,
              originalHTML,
              this.shownOutline[i].id,
              this.settingsData.extractContentsConfig
            );
          },
          initialized: () => {
            el.id = this.shownOutline[i].id;
            el.innerHTML = content;
          },
        },
        paragraphFormat: {
          N: "Normal",
          H1: "Part",
          H2: "Chapter",
          H3: "Heading",
          H4: "Subheading",
        },
        placeholderText: "",
        fullPage: true,
        toolbarInline: true,
        toolbarButtons: [
          // ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
          // ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR'],
          [
            "alignLeft",
            "alignCenter",
            "formatOLSimple",
            "alignRight",
            "alignJustify",
            "formatOL",
            "formatUL",
            "paragraphFormat",
            "paragraphStyle",
            "lineHeight",
            "outdent",
            "indent",
            "quote",
          ],
          // ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
        ],
      });

      // this.editorDivs.push(editor)
    }
  }

  expandOutlineToArray(data: any): any[] {
    if (!data) return;

    let children = [];
    for (const child of data.children) {
      children = children.concat(this.expandOutlineToArray(child));
    }

    return [data].concat(children);
  }

  convertOutlineToNodes(g: Dagre.graphlib.Graph, outline: OutlineSubtype) {
    if (!outline) return;

    g.setNode(outline.self.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

    for (const child of outline.children) {
      this.convertOutlineToNodes(g, child);

      g.setEdge(outline.self.id, child.self.id);
    }
  }

  createNodeElements() {
    var g = new Dagre.graphlib.Graph();
    g.setGraph({
      height: 800,
      width: 1300,
      nodesep: 20,
      ranksep: 20,
    });
    g.setDefaultEdgeLabel(function () {
      return {};
    });

    const outlineSubtype = convertOutlineToTree(
      this.studioPageData.content.config.outline
    );

    for (const outline of outlineSubtype.children) {
      this.convertOutlineToNodes(g, outline);
    }

    g.graph().width = 1300;
    g.graph().height = 800;

    // console.log(g)
    // console.log("edges", g.edges())
    g.nodes().forEach((node) => {
      // console.log(g.node(node))
    });

    Dagre.layout(g);

    const nodes = html`${this.shownOutline.map(
      (outline: Outline, i: number) => {
        const nodeID = g.nodes().find((node: any) => {
          return node === outline.id;
        });

        const node = g.node(nodeID!);

        const styles = {
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
          position: `absolute`,
          transition: "all .5s ease-in-out",
        };
        return html`<node-element
          style=${styleMap(styles)}
          edge="h"
          slot="node"
        >
          <slot name="title">${outline.name}</slot>

          <div class="editor-div" id="editor-${outline.id}"></div
        ></node-element>`;
      }
    )}`;

    g.nodes().forEach((node) => {
      // console.log(g.node(node))
    });

    const edges = html`${g.edges().map((edgeID: any) => {
      const edge = g.edge(edgeID);

      const beginningX = 0;
      const beginningY = 0;

      const endX = edge.points[2].x - edge.points[0].x;
      const endY = edge.points[2].y - edge.points[0].y;

      const styles = {
        left: `${edge.points[0].x}px`,
        top: `${edge.points[0].y}px`,
        position: "absolute",
      };

      return html`
        <svg
          style=${styleMap(styles)}
          class="edge"
          width="400"
          height="200"
          slot="edge"
        >
          <line
            x1=${beginningX}
            y1=${beginningY}
            x2=${endX}
            y2=${endY}
            stroke="black"
            stroke-width="2"
          />
        </svg>
      `;
    })}`;

    return html`${nodes}${edges}`;
  }

  render() {
    this.gatherOutlineConfig();

    return html`
      <graph-element .height=${"800px"}>
        <div slot="custom-controls">
          <sl-select
            value=${this.settingsData.extractContentsConfig.mode}
            @sl-change=${(e) => {
              const newValue = e.target.value;

              this.settingsData.extractContentsConfig.mode = newValue;
              this.shownOutline = [];

              this.dispatchEvent(
                new CustomEvent(UPDATE_GRAPH_EVENT, {
                  composed: true,
                  bubbles: true,
                })
              );
              this.dispatchEvent(
                new CustomEvent<StudioSettings>(SettingsChanges, {
                  detail: this.settingsData,
                  composed: true,
                  bubbles: true,
                })
              );

              this.gatherOutlineConfig();
              this.renderFroalaEditors();
              this.requestUpdate();
            }}
          >
            ${Object.values(ExtractContentsMode).map((value: string) => {
              return html`<sl-option value=${value}>${value}</sl-option>`;
            })}
          </sl-select>
        </div>
        ${this.createNodeElements()}
      </graph-element>
    `;
  }
}
