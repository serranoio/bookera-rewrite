import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import sidePanelElementStyles from './side-panel-element.styles';
import base from '../../../../lib/stylesheets/base';
import { doesClickContainElement, sendEvent } from '../../../../lib/model/util';
import './panel-bar-element/panel-bar-element';
import './side-panel-drawer/side-panel-drawer-element';
import { PanelSide } from './panel-bar-element/panel-bar-element';
import {
  OUTLINE_TAB,
  Tab,
  TabPosition,
  TabsSingleton,
} from '../../../../lib/model/tab';
import {
  OPEN_SIDE_PANEL_EVENT,
  OpenSidePanelEventType,
} from '../../../../lib/model/panel';
import { Module } from '../modules/module';

export const OpenTabInSidePanel = 'open-tab-event';

export type PanelBarPosition = 'normal' | 'top';

export const DEFAULT_DRAWER_WIDTH = 12;

@customElement('side-panel-element')
export class SidePanelElement extends LitElement {
  static styles = [sidePanelElementStyles, base];

  @property()
  panelID: PanelSide = 'left';

  @property()
  panelBarPosition: PanelBarPosition = 'normal';

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {}

  private _renderPanelBar() {
    return html`<panel-bar-element
      .panelID=${this.panelID}
      .panelBarPosition=${this.panelBarPosition}
      slot="top-spot"
    >
    </panel-bar-element>`;
  }

  render() {
    const panelBar = this._renderPanelBar();

    if (this.panelBarPosition === 'normal') {
      return html`
        ${panelBar}
        <side-panel-drawer-element .panelID=${this.panelID}>
          <slot name="side-panel-drawer"></slot>
        </side-panel-drawer-element>
      `;
    }

    if (this.panelBarPosition === 'top') {
      return html`
        <side-panel-drawer-element panelID=${this.panelID}>
          ${panelBar}
          <slot name="side-panel-drawer"></slot>
        </side-panel-drawer-element>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'side-panel-element': SidePanelElement;
  }
}
