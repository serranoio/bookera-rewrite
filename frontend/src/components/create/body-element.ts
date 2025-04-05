import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  EXTRACT_CONTENTS_MODE,
  Instance,
  OUTLINE_H,
  OUTLINE_ID,
  Outline,
  OutlineStatus,
  SEND_OUTLINE_EVENT,
  StudioPageChanges,
  StudioPageData,
  defaultStudioPageData,
  extractContentsUnderOutline,
  extractHTML,
  getBodyElement,
  retrieveAllBodyInstnacesInEveryPanel,
  studioPageContext,
  updateAllBodyInstancesInEveryPanel,
  updateOutlineInBody,
} from "../../lib/model/context";
import { ContextConsumer } from "@lit/context";
import FroalaEditor from "froala-editor";

import { v4 as uuidv4 } from "uuid";
import { DRAG_DROP_EVENT } from "../../lib/model/site";
import {
  ExtractContentsConfig,
  ExtractContentsMode,
} from "../../lib/model/settings";
import { extract } from "@twind/core";
import { Manuscript } from "../../lib/git/manuscript";
import { getManuscriptFromURL } from "./studio/extra-element";
import { assetStore } from "../../lib/git/fs";

interface OutlineProperty {
  id?: string;
  name?: string;
  h?: string;
}

export const getExtractContentsConfigFromH = (
  h: string
): ExtractContentsMode => {
  if (h === "H1") {
    return ExtractContentsMode.PART;
  } else if (h === "H2") {
    return ExtractContentsMode.CHAPTER;
  } else if (h === "H3") {
    return ExtractContentsMode.HEADING;
  } else if (h === "H4") {
    return ExtractContentsMode.SUB_HEADING;
  }

  return ExtractContentsMode.CHAPTER;
};

export const findOutlineByID = (
  outlines: Outline[],
  outlineProperty: OutlineProperty
) => {
  return outlines.find((outline: Outline) => {
    return outline.id === outlineProperty.id;
  });
};

export const createOutline = (
  dom: HTMLBodyElement,
  config: {}
): { outline: Outline[]; dirty: boolean } => {
  const outline: Outline[] = [];
  const elements = dom.querySelectorAll("h1, h2, h3, h4, h5, h6");

  for (const el of elements) {
    let id: string = "";
    if (el.id === "" || el.id.includes("isPasted")) {
      id = uuidv4();
      el.id = id;
    } else {
      id = el.id;
    }

    outline.push({
      h: el.nodeName,
      id: id,
      name: el.textContent!,
      status: OutlineStatus.NEW,
      note: {
        templateID: "",
        body: "",
      },
      labels: [],
    });
  }

  return { outline: outline, dirty: true };
};

const processDocument = (
  dom: HTMLBodyElement
): {
  config: { outline: Outline[] };
  dirty: boolean;
} => {
  let dirty = false;

  const outline = createOutline(dom, {});
  if (outline.dirty) {
    dirty = true;
  }

  return {
    config: {
      outline: outline.outline,
    },
    dirty: dirty,
  };
};

export const updateBookStructure = (
  dom: HTMLBodyElement,
  studioPageData: StudioPageData
) => {
  const { config, dirty } = processDocument(dom);

  if (dirty) {
    studioPageData.content.body = new DOMParser().parseFromString(
      dom.innerHTML,
      "text/html"
    );
    studioPageData.content.config.outline = config.outline;

    dispatchEvent(
      new CustomEvent(StudioPageChanges, {
        detail: studioPageData,
        bubbles: true,
        composed: true,
      })
    );
  }
};

const updateAllBodyAssets = (body) => {
  // allBodys.forEach((body) => {
  body.querySelectorAll("img").forEach((img) => {
    // lf
    const imageInLF = img.src.slice(
      img.src.lastIndexOf("/") + 1,
      img.src.length
    );

    const fileReader = new FileReader();

    fileReader.onload = () => {
      console.log("loaded image", img);
      img.src = fileReader.result;

      console.log(img);
    };

    assetStore.getItem(imageInLF).then((file) => {
      // img.src = file
      fileReader.readAsDataURL(file);
    });
  });
  // });
};

const updateAllBodyInstancesStyle = (allBodys) => {
  allBodys.forEach((body) => {
    if (!body.body) return;
    body.body.style.overflowY = "scroll";
  });

  return allBodys;
};

export const updateTheMotherShip = (
  dom: HTMLBodyElement,
  studioPageData: StudioPageData
) => {
  updateAllBodyAssets(dom);
  updateBookStructure(dom, studioPageData);
  const allBodys = retrieveAllBodyInstnacesInEveryPanel();

  updateAllBodyInstancesStyle(allBodys);
  updateAllBodyInstancesInEveryPanel(dom, allBodys, dom);

  // now we update localForage
  const title = getManuscriptFromURL();

  Manuscript.ReadManuscriptFromLF(title).then((manuscript) => {
    manuscript.body = dom.innerHTML;

    Manuscript.WriteManuscriptsToLF([manuscript]);
  });

  return studioPageData;
};

@customElement("body-element")
export class BodyElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
      }

      .fr-quick-insert {
        display: none !important;
      }
      iframe {
        height: 100% !important;
        width: 100%;
      }

      .fr-box {
        display: flex;
        height: 100%;
        flex-direction: column;

        .fr-wrapper {
          flex: 1;

          .fr-element {
            min-height: 100%;
          }
        }
      }
    `,
  ];

  @property()
  studioPageData: StudioPageData = defaultStudioPageData;

  @property()
  editorDiv: Element | null = null;

  @property()
  editor: FroalaEditor | undefined;

  @property()
  froalaHasUpdated: boolean = false;

  dropEvent() {
    this.requestUpdate();
  }

  @property()
  dontUpdateOuline: boolean = false;

  @property()
  outlineProperty: OutlineProperty;

  @property()
  extractContentsConfig: ExtractContentsConfig = {
    mode: ExtractContentsMode.SUB_HEADING,
  };

  // createRenderRoot() {
  //   // Create shadow root with open mode
  //   return this.attachShadow({ mode: "open" });
  // }

  constructor(outline: OutlineProperty) {
    super();

    // this is an override?
    // if (Object.values(ExtractContentsMode).includes(extractContentsMode)) {
    // 	this.extractContentsConfig.mode = extractContentsMode
    // }
    if (outline?.h) {
      this.extractContentsConfig.mode = getExtractContentsConfigFromH(
        outline.h
      );
    }

    this.outlineProperty = outline;

    document.addEventListener(DRAG_DROP_EVENT, this.dropEvent.bind(this));
  }

  _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore

      this.studioPageData = ctx;
    },
  });

  updateBookStructure(dom: HTMLBodyElement) {
    const { config, dirty } = processDocument(dom);

    if (dirty) {
      this.studioPageData.content.body = new DOMParser().parseFromString(
        dom.innerHTML,
        "text/html"
      );
      this.studioPageData.content.config.outline = config.outline;

      this.dispatchEvent(
        new CustomEvent(StudioPageChanges, {
          detail: this.studioPageData,
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  createParagraphFormat() {
    if (!this.outlineProperty?.id) {
      return {
        N: "Normal",
        H1: "Part",
        H2: "Chapter",
        H3: "Heading",
        H4: "Subheading",
      };
    }

    let paragraphFormat: any = {
      N: "Normal",
    };

    switch (this.outlineProperty.h) {
      case "H1":
        paragraphFormat = {
          ...paragraphFormat,
          H2: ExtractContentsMode.CHAPTER,
        };
      case "H2":
        paragraphFormat = {
          ...paragraphFormat,
          H3: ExtractContentsMode.HEADING,
        };
      case "H3":
        paragraphFormat = {
          ...paragraphFormat,
          H4: ExtractContentsMode.SUB_HEADING,
        };
      case "H4":
        paragraphFormat = {
          ...paragraphFormat,
        };
    }

    return paragraphFormat;
  }

  initializeEditor() {
    if (this.editorDiv) {
      this.editorDiv.remove();
      this.editorDiv = null;
    }

    // if there is no editor,
    if (!this.editorDiv) {
      // find the div
      const foundEditor = this.shadowRoot?.querySelector("#editor");
      // no div
      if (!foundEditor) {
        // create
        const div = document.createElement("div");
        div.id = "editor";
        this.editorDiv = div;
        this.shadowRoot!.appendChild(div);
      } else {
        this.editorDiv = foundEditor;
      }
    } else {
      this.shadowRoot?.appendChild(this.editorDiv);
    }

    this.editor = new FroalaEditor(this.editorDiv, {
      events: {
        contentChanged: () => {
          let allBodys = [];
          if (this.outlineProperty?.id) {
            // we are an outline updating something else
            const newHTML = getBodyElement(this.shadowRoot!)!.innerHTML;
            // now that we have the html, we have to insert this back into the origin html
            // find the element
            const originalHTML =
              this.studioPageData.content.body.querySelector("body")!;

            updateOutlineInBody(
              newHTML,
              originalHTML,
              this.outlineProperty.id!,
              this.extractContentsConfig
            );

            this.updateBookStructure(originalHTML);

            allBodys = retrieveAllBodyInstnacesInEveryPanel();
            updateAllBodyInstancesInEveryPanel(
              getBodyElement(this.shadowRoot!)!,
              allBodys,
              originalHTML!
            );
          } else {
            const newHTML = getBodyElement(this.shadowRoot!)!;
            // we are the body updating everything else

            this.updateBookStructure(newHTML);
            updateTheMotherShip(newHTML, this.studioPageData);
            // don't update self
          }
        },
        initialized: () => {
          if (this.outlineProperty?.id) {
            this.editorDiv?.setAttribute(OUTLINE_ID, this.outlineProperty.id);
            this.editorDiv?.setAttribute(OUTLINE_H, this.outlineProperty.h!);

            const desiredOutline = findOutlineByID(
              this.studioPageData.content.config.outline,
              this.outlineProperty
            )!;

            const content = extractContentsUnderOutline(
              this.extractContentsConfig,
              this.studioPageData.content.body.querySelector("body")!,
              desiredOutline
            );

            this.editor?.html.set(content);
          } else {
          }
        },
      },
      paragraphFormat: this.createParagraphFormat(),
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

    // @ts-ignore
    this.studioPageData.siteConfig.editorDiv = this.editorDiv;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.initializeEditor();
  }

  render() {
    return html`
      <link
        href="node_modules/froala-editor/css/froala_editor.pkgd.min.css"
        rel="stylesheet"
        type="text/css"
      />
    `;
  }
}
