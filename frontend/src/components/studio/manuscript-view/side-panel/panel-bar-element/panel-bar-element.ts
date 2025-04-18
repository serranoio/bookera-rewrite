import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import panelBarElementStyles from './panel-bar-element.styles';
import base from '../../../../../lib/stylesheets/base';
import {
  doesClickContainElement,
  sendEvent,
} from '../../../../../lib/model/util';
import { PanelTabTypes } from '../../panel/panel-element';
import { OpenTabInSidePanel, PanelBarPosition } from '../side-panel-element';
import { SendSettingsToSidebarType } from '../../modules/util';
import { OUTLINE_TAB, Tab } from '../../../../../lib/model/tab';
import {
  NEW_PANEL_EVENT,
  OPEN_SIDE_PANEL_EVENT,
} from '../../../../../lib/model/panel';
import { Bag, BagManager, CreateBagManager } from '@pb33f/saddlebag';
import './tab-element/tab-element';
import { key } from 'localforage';
import { Module } from '../../modules/module';
import { ModuleRegistry } from '../../modules/registry';
import { PanelExpand } from '../../modules/core-modules/settings/src/panel-expand';

export type PanelSide = 'left' | 'right';

@customElement('panel-bar-element')
export class PanelBarElement extends LitElement {
  static styles = [panelBarElementStyles, base];

  @property()
  tabs: Tab[] = [];

  @state()
  selectedTab: Tab | undefined;

  @property()
  panelID: PanelSide = 'left';

  @property()
  panelBarPosition: PanelBarPosition = 'normal';

  @state()
  _bagManager!: BagManager;

  @state()
  _bag!: Bag<Module>;

  @property({ type: Boolean })
  showSettings: boolean = false;

  @state()
  panelsExpandedState: boolean = false;

  @state()
  isBarHoverable: boolean = false;

  toggleHoverableBar() {
    this.isBarHoverable = !this.isBarHoverable;
  }

  constructor() {
    super();
    // // @ts-ignore
    // document.addEventListener(
    //   OPEN_SIDE_PANEL_EVENT,
    //   this.handleOpenSidePanel.bind(this)
    // );

    // // @ts-ignore
    // document.addEventListener(
    //   CLOSE_SIDE_PANEL_EVENT,
    //   this.handleOpenSidePanel.bind(this)
    // );
    // @ts-ignore
    // document.addEventListener(
    //   SendSettingToSidebarEvent,
    //   this.sendSettingToSidebar.bind(this)
    // );

    // ^ setTimeout used so that the correct properties can be picked
    this._bagManager = CreateBagManager(true);
    this._bag = ModuleRegistry.GetModuleBag();

    this._bag?.onPopulated(this.onPopulated.bind(this));
    this._bag.onAllChanges(this.onAllChanges.bind(this));
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {}

  onAllChanges(id: string) {
    this.refillTabs(this._bag.export());

    this.requestUpdate();
  }

  private refillTabs(bag: Map<string, Module>) {
    this.tabs = ModuleRegistry.GetTabsWithPosition(bag, this.panelID);

    this.selectedTab = this.tabs.find((tab: Tab) => tab.isToggledInDrawer);
  }

  onPopulated(moduleBag: Map<string, Module> | undefined) {
    this.refillTabs(moduleBag!);
  }

  sendSettingToSidebar(e: CustomEvent<SendSettingsToSidebarType>) {
    // if (e.detail.tab.position === "left") {
    //   this.tabs.push(e.detail.tab);
    // }

    this.requestUpdate();
  }

  renderSettingsAndUser() {
    if (!this.showSettings) {
      return html``;
    }

    return html`
      <div class="extra-configuration">
        ${PanelExpand.RenderExpandPanelsButton()}

        <sl-dropdown>
          <sl-icon-button slot="trigger" name="person-circle"></sl-icon-button>
          <sl-menu>
            <sl-menu-item value="settings">NOT FINISHED</sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        <sl-dropdown
          @sl-select=${(e: CustomEvent) => {
            let val = e.detail.item.value as PanelTabTypes;

            if (val === 'Settings') {
              sendEvent(this, NEW_PANEL_EVENT, val);
            }
          }}
        >
          <sl-icon-button slot="trigger" name="gear"></sl-icon-button>
          <sl-menu>
            <sl-menu-item value="Settings">Open Settings in panel</sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </div>
    `;
  }

  render() {
    return html`
      <div
        class="side-panel ${this.panelBarPosition} ${this.isBarHoverable
          ? 'hoverable-bar'
          : ''}"
        @click=${(e: any) => {
          const el = doesClickContainElement(e, { nodeName: 'SL-ICON-BUTTON' });
          if (!el) return;
        }}
      >
        ${this.tabs.map((tab: Tab) => {
          return html`<tab-element
            .tab=${tab}
            .selectedTab=${this.selectedTab}
            .panelBarPosition=${this.panelBarPosition}
          ></tab-element>`;
        })}
        ${this.renderSettingsAndUser()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'panel-bar-element': PanelBarElement;
  }
}
