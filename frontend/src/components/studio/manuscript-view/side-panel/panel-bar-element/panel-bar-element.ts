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
import {
  LeftTabsKey,
  OUTLINE_TAB,
  RightTabsKey,
  SelectedLeftTabKey,
  SelectedRightTabKey,
  Tab,
  TabsBag,
  TabsSingleton,
} from '../../../../../lib/model/tab';
import { NEW_PANEL_EVENT } from '../../../../../lib/model/panel';
import { CreateBagManager } from '@pb33f/saddlebag';
import { TabElement } from './tab-element/tab-element';

export type PanelSide = 'left' | 'right';

@customElement('panel-bar-element')
export class PanelBarElement extends LitElement {
  static styles = [panelBarElementStyles, base];

  @property()
  tabs: Tab[] = [];

  @state()
  selectedTab: Tab = OUTLINE_TAB;

  @property()
  panelID: PanelSide = 'left';

  @property()
  panelBarPosition: PanelBarPosition = 'normal';

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
    const bagManager = CreateBagManager(true);
    const tabsBag = TabsSingleton.GetTabsBag(bagManager);

    tabsBag?.onPopulated(this.onPopulated.bind(this));
    tabsBag?.subscribe(LeftTabsKey, this.addLeftTab.bind(this));
    tabsBag?.subscribe(RightTabsKey, this.addRightTab.bind(this));
    tabsBag?.subscribe(SelectedLeftTabKey, this.selectLeftTab.bind(this));
    tabsBag?.subscribe(SelectedRightTabKey, this.selectRightTab.bind(this));
  }

  selectLeftTab(tab: TabsBag | undefined) {
    if (this.panelID === 'left') {
      this.selectedTab = tab as Tab;
    }
    this.requestUpdate();
  }

  selectRightTab(tab: TabsBag | undefined) {
    if (this.panelID === 'right') {
      this.selectedTab = tab as Tab;
    }
    this.requestUpdate();
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {}

  onPopulated(tabsBag: Map<string, TabsBag> | undefined) {
    if (this.panelID === 'left') {
      this.tabs = (tabsBag?.get(LeftTabsKey) as Tab[])!;
      this.selectedTab = (tabsBag?.get(SelectedLeftTabKey) as Tab)!;
    } else {
      this.tabs = (tabsBag?.get(RightTabsKey) as Tab[])!;
      this.selectedTab = (tabsBag?.get(SelectedRightTabKey) as Tab)!;
    }
  }

  addRightTab(tabs: TabsBag | undefined) {
    if (this.panelID === 'right') {
      this.tabs = (tabs as Tab[])!;
    }
    this.requestUpdate();
  }

  addLeftTab(tabs: TabsBag | undefined) {
    if (this.panelID === 'left') {
      this.tabs = (tabs as Tab[])!;
    }

    this.requestUpdate();
  }

  sendSettingToSidebar(e: CustomEvent<SendSettingsToSidebarType>) {
    // if (e.detail.tab.position === "left") {
    //   this.tabs.push(e.detail.tab);
    // }

    this.requestUpdate();
  }

  renderSettingsAndUser() {
    if (this.panelBarPosition === 'top') {
      return html``;
    }

    return html`
      <div class="extra-configuration">
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
        class="side-panel ${this.panelBarPosition}"
        @click=${(e: any) => {
          const el = doesClickContainElement(e, { nodeName: 'SL-ICON-BUTTON' });
          if (!el) return;

          return;
          this.selectedTab = TabsSingleton.tabs.find(
            (tab) => tab.value === el.dataset.value
          )!;

          if (!this.selectedTab) {
            console.log('this tab was not found in all of the tabs');
          }

          if (this.selectedTab?.action) {
            sendEvent(this, this.selectedTab.action, {
              panelID: this.panelID,
              position: this.selectedTab.position,
            });
          } else {
            sendEvent(this, OpenTabInSidePanel, {
              panelID: this.panelID,
              position: this.selectedTab.position,
              value: this.selectedTab.value,
            });
          }
        }}
      >
        ${this.tabs.map((tab: Tab) => {
          return html`<tab-element
            .tab=${tab}
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
