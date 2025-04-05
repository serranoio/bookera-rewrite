import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import panelManagerStyles from "./panel-manager.styles";
import base from "../../../../../lib/stylesheets/base";
import "../panel-element";

@customElement("panel-manager")
export class PanelManager extends LitElement {
  static styles = [panelManagerStyles, base];

  render() {
    return html`
      <panel-element .minimumWidth=${200} .width=${200}>
        <!-- <div class="editor-div"></div> -->
      </panel-element>
      <panel-element .minimumWidth=${200} fill>
        <!-- <div class="editor-div"></div> -->
      </panel-element>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-manager": PanelManager;
  }
}
