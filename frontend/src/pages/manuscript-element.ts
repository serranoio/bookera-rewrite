import FroalaEditor from "froala-editor";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import "../components/studio/manuscript-view/side-panel/side-panel-element";

@customElement("manuscript-element")
export class ManuscriptElement extends LitElement {
  @query("#editor-div")
  editorDiv: Element | null;

  constructor() {
    super();
  }

  createRenderRoot() {
    return this;
  }

  initializeEditor() {
    new FroalaEditor(this.editorDiv, {
      events: {
        contentChanged: () => {},
        initialized: () => {},
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
          "image",
        ],
        // ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
      ],
    });
  }

  firstUpdated() {
    this.initializeEditor();
  }
  render() {
    return html` <section class="manuscript-section">
      <side-panel-element></side-panel-element>
      <div id="editor-div"></div>
    </section>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "manuscript-element": ManuscriptElement;
  }
}
