import FroalaEditor from "froala-editor";
import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "froala-editor/js/plugins.pkgd.min.js";
import {
  BodyContentEvent,
  ConfigUpdateEvent,
  ExtractContentsConfig,
  ExtractContentsMode,
  Outline,
  OutlineStatus,
  StudioPageChanges,
  StudioPageData,
  StudioPageView,
  defaultStudioPageData,
  extractHTML,
  studioPageContext,
} from "../../lib/model/context";
import { ContextConsumer } from "@lit/context";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/split-panel/split-panel.js";
import "./graph-view-element";
import {
  NEW_PANEL_EVENT,
  NewPanelEventType,
  UPDATE_GRAPH_EVENT,
} from "../../lib/model/site";
import "./body-element";
import { GoldenLayout } from "../libs/golden-layout/dist/types/golden-layout-untrimmed";
import { App } from "../layout/golden-layout/app";
import rendererLayerCss from "./renderer-layer.css";
import { v4 as uuidv4 } from "uuid";

@customElement("renderer-layer-element")
export class RendererLayerElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
      }

      .fr-wrapper {
        height: calc(100vh - 52px);
        /* max-height: 155vh; */
      }

      iframe {
        height: 100% !important;
        width: 100%;
      }
      .fr-toolbar {
        position: absolute;
        top: -60px !important;
        left: 25% !important;
        /* transform: translateX(-50%); */
        background-color: var(--sl-color-neutral-100);
      }

      .fr-wrapper {
        overflow-y: scroll;
        height: 100;
      }

      .fr-second-toolbar {
        display: none;
      }

      .panel {
        height: 10rem;
        background-color: green;
      }

      sl-tab::part(base) {
        padding: var(--spacingXXSmall) var(--spacing);
        background-color: var(--slate-50);
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
      }

      .graph-container {
        display: flex;
        flex-wrap: wrap;
      }

      #layout-element {
        width: 100%;
        height: 100%;
        max-height: 1000px;
      }
    `,

    rendererLayerCss,
  ];

  @property()
  isOnePanelView: boolean = true;

  @property()
  showGraphView: boolean = false;

  @property()
  pauseGraphView: boolean = false;

  @property()
  panelHandler: any;

  @property()
  panelMap: Map<string, string> = new Map();

  @query("#layout-element")
  layoutElement: HTMLElement | null;

  newPanelEvent(e: CustomEvent<NewPanelEventType>) {
    const newPanelEvent = e.detail;

    this.panelHandler.addComponent({
      ...newPanelEvent,
      componentID: uuidv4(),
      internalIDs: [],
    });
  }

  updateGraphEvent(e) {
    this.requestUpdate();
    this.pauseGraphView = true;
    setTimeout(() => {
      this.pauseGraphView = false;
    }, 0);
  }

  constructor() {
    super();

    document.addEventListener(NEW_PANEL_EVENT, this.newPanelEvent.bind(this));

    document.addEventListener(
      UPDATE_GRAPH_EVENT,
      this.updateGraphEvent.bind(this)
    );
  }

  @property()
  studioPageData: StudioPageData = defaultStudioPageData;

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
    this.panelHandler = new App(this.layoutElement!);

    this.panelHandler.loadLayout();

    const id = uuidv4();
    this.panelHandler.addComponent({
      componentID: id,
      name: StudioPageView.Body,
      type: StudioPageView.Body,
      internalIDs: [],
    });
  }

  render() {
    return html`
      <link
        type="text/css"
        rel="stylesheet"
        href="https://golden-layout.com/files/latest/css/goldenlayout-base.css"
      />
      <link
        type="text/css"
        rel="stylesheet"
        href="https://golden-layout.com/files/latest/css/goldenlayout-dark-theme.css"
      />
      <link
        href="node_modules/froala-editor/css/froala_editor.pkgd.min.css"
        rel="stylesheet"
        type="text/css"
      />
      <div id="layout-element"></div>
    `;
  }
}
