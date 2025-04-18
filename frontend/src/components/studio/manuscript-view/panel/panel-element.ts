import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import panelElementStyles from './panel-element.styles';
import base from '../../../../lib/stylesheets/base';
import './panel-handle/panel-handle-element';
import {
  doesClickContainElement,
  genShortID,
  genUUID,
  sendEvent,
} from '../../../../lib/model/util';
import { PANEL_RESIZE_EVENT } from './panel-handle/panel-handle-element';
import { PanelSide } from '../side-panel/panel-bar-element/panel-bar-element';
import { Point } from 'chart.js';
import { NewPanelEventType } from '../../../../lib/model/site';
import { QuoteList } from '../../../../lib/model/hard-coded';
import '../modules/core-modules/theme-switcher/src/theme-switcher-element';
import {
  CLOSE_PANEL_EVENT,
  CLOSE_SIDE_PANEL_EVENT,
  IS_DRAGGING_TAB_EVENT,
  IsDraggingTabEvent,
  NEW_TAB_EVENT,
  NewPanelTabEventType,
  OPEN_SIDE_PANEL_EVENT,
  OpenSidePanelEventTYpe,
  PANEL_CONSTRUCTION_EVENT,
  PanelDrop,
  SPLIT_PANEL_EVENT,
  SplitPanelEventType,
} from '../../../../lib/model/panel';
import { ModuleRegistry } from '../modules/registry';
import { Module } from '../modules/module';
import { mo } from '@twind/core';
import { CreateBagManager, GetBagManager } from '@pb33f/saddlebag';
import { PanelContentElement } from './panel-content-element';
import {
  PanelTab,
  domifyDraggedTabOnManuscriptElement,
  getDraggedTabOnManuscriptElement,
} from './panel-tab/panel-tab';
import { Panel } from './panel-state';

export const MINIMMAL_PANEL_WIDTH = 200;

@customElement('panel-element')
export class PanelElement extends LitElement {
  static styles = [panelElementStyles, base];

  @property()
  panelContainer!: HTMLElement;

  @property()
  minimumWidth: number = MINIMMAL_PANEL_WIDTH;

  @property()
  width: number = -1;

  @property({ type: Boolean })
  fill = false;

  @property()
  showHandle: boolean = true;

  @property()
  tabs: PanelTab[] = [];

  @property()
  activeTab: PanelTab | null = null;

  @property()
  panelID: string | null = null;

  @property()
  isLastElement: boolean = false;

  @property()
  isRightSidePanelOpened: boolean = false;

  isPointerDown: boolean = false;

  @state()
  areTabsHoverable: boolean = false;

  private isDraggingTab: IsDraggingTabEvent | null = null;

  formPanel(): Panel {
    return new Panel(
      this.tabs,
      this.panelID!,
      this.width,
      false,
      this.activeTab?.id
    );
  }

  constructor(panel?: Panel) {
    super();
    if (panel) {
      this.panelID = panel.id!;
      this.tabs = panel.tabs?.map((tab: PanelTab) => {
        return Object.assign(new PanelTab(), tab);
      })!;
      this.activeTab = this.tabs.find(
        (tab: PanelTab) => tab.id === panel.activeTabId!
      )!;
    }

    document.addEventListener(
      OPEN_SIDE_PANEL_EVENT,
      this.handleToggleSidePanel.bind(this)
    );

    document.addEventListener(
      CLOSE_SIDE_PANEL_EVENT,
      this.handleCloseRightSidePanel.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      NEW_TAB_EVENT,
      this.handleCreateEmptyTab.bind(this)
    );
  }

  handleCreateEmptyTab(e: CustomEvent<NewPanelTabEventType>) {
    if (!(e.detail.panelID === this.panelID)) return;

    this.tabs.push(new PanelTab('New Tab', 'New'));
    this.activeTab = this.tabs[this.tabs.length - 1];
    this.updatePanelWrapper();

    this.requestUpdate();
  }

  toggleHoverableTabs() {
    this.areTabsHoverable = !this.areTabsHoverable;
  }

  getManuscriptElement() {
    const manuscriptElement = document.querySelector('manuscript-element');
    return manuscriptElement;
  }

  private updateFill(): boolean {
    if (this.fill && this.panelContainer) {
      this.panelContainer.style.width = `100%`;
      this.style.width = '100%';
      return true;
    }

    this.style.width = 'auto';

    return false;
  }

  private updateResize(): void {
    if (!this.nextElementSibling) {
      this.fill = true; // last element should fill
      this.showHandle = false; // last element should not show handle
    } else {
      this.fill = false;
      this.showHandle = true;
    }
  }

  // updateSidePanelOpened(isSidePanelOpened: boolean) {
  //   if (isSidePanelOpened) {
  //     this.showHandle = true;
  //   } else {
  //     this.showHandle = false;
  //   }

  //   console.log(this.showHandle);
  // }

  dontShowPanelSplit() {
    // is at minimum width, dont show
    if (
      this.panelContainer.getBoundingClientRect().width <= this.minimumWidth
    ) {
    }
  }

  updateLastElement(isLastElement: boolean) {
    this.isLastElement = isLastElement;
    if (!isLastElement) {
      this.fill = false;
      this.showHandle = true;
    } else {
      this.fill = true;
      this.showHandle = true;
    }
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.panelContainer = this.shadowRoot!.querySelector('#panel-container')!;

    if (!this.updateFill()) {
      this.updateWidth();
    }

    setTimeout(this.handleToggleSidePanel.bind(this), 0);

    sendEvent(this, PANEL_CONSTRUCTION_EVENT, {
      panelID: this.panelID,
    });

    this.requestUpdate();
  }

  updateWidth(px?: number) {
    if (px) {
      this.width = px;
    }

    if (this.panelContainer) {
      this.panelContainer.style.width = `${this.width / 16}rem`;
    }
  }

  recalculateWidth() {}

  updateWidthToPercentage(percentage: number) {
    this.panelContainer.style.width = `100%`;
    this.style.width = `${percentage * 100}%`;
  }

  updateOnRender() {
    this.updateFill();
    this.updateResize();
  }

  renderHandle() {
    if (this.showHandle) {
      return html`
        <panel-handle-element
          right
          .parentElement=${this.panelContainer}
          .minimumWidth=${this.minimumWidth}
          .panelID=${this.panelID!}
        ></panel-handle-element>
      `;
    }

    return html``;
  }

  handleTabClick(e: any) {
    const tabClose = doesClickContainElement(e, { nodeName: 'SL-ICON-BUTTON' });

    const element = doesClickContainElement(e, { className: 'panel-tab' });

    if (tabClose) {
      let setNewActiveTab = false;
      this.tabs = this.tabs.filter((tab: PanelTab) => {
        if (this.activeTab?.id === tab.id) {
          setNewActiveTab = true;
        }
        // not this element
        if (tab.id === element?.id) {
          return false;
        }
        return true;
      });

      if (this.tabs.length === 0) {
        Panel.DeletePanel(
          new Panel(
            this.tabs,
            this.panelID!,
            this.width,
            false,
            this.activeTab?.id
          )
        );

        sendEvent(this, CLOSE_PANEL_EVENT, this.panelID);
        // if last tab, close out the panel.
        return;
      }

      // if we close out active tab, set the active tab to the first tab
      if (setNewActiveTab) {
        this.activeTab = this.tabs[0];
      }

      this.updatePanelWrapper();
      return;
    }

    if (!element) return;

    const tab = this.tabs.find((tab: PanelTab) => tab.id === element.id);

    this.activeTab = tab!;
    this.updatePanelWrapper();
  }

  private updatePanelWrapper() {
    Panel.UpdatePanel(
      new Panel(this.tabs, this.panelID!, this.width, false, this.activeTab?.id)
    );
  }

  // & this is 'toggle'
  handleToggleSidePanel() {
    console.log('open');
    setTimeout(() => {
      const panelElementWidth = document
        .querySelectorAll('side-panel-element')[1]
        .getBoundingClientRect().width;

      if (panelElementWidth > 0) {
        this.isRightSidePanelOpened = true;
      } else {
        this.isRightSidePanelOpened = false;
      }
    }, 0);
  }

  handleCloseRightSidePanel(e) {
    console.log('side panel closed');
    if ((e.detail.panelID as PanelSide) === 'right') {
      this.isRightSidePanelOpened = false;
    }
  }

  renderTabList() {
    // return html`
    //   <panel-tab-element
    //     .tabs=${this.tabs}
    //     .activeTab=${this.activeTab}
    //     .panelID=${this.panelID}
    //   >
    //   </panel-tab-element>
    // `;

    return html`
      <div class="tab-list-container" @click=${this.handleTabClick.bind(this)}>
        ${this.tabs.map((tab: PanelTab) => {
          return html`
            <div
              class="panel-tab ${this.activeTab?.id === tab.id ? 'active' : ''}"
              id=${tab.id}
              @pointerdown=${(e: PointerEvent) => {
                const isDraggingTab: IsDraggingTabEvent = {
                  tab: tab,
                  tabElement: e.target! as Element,
                  fromPanel: this.panelID,
                  el: null,
                  toPanel: null,
                  hoveredTab: null,
                  hoveredTabElement: null,
                  panel: this,
                  panelDrop: null,
                  isHoveringOverPanel: false,
                };

                sendEvent<IsDraggingTabEvent>(
                  this,
                  IS_DRAGGING_TAB_EVENT,
                  isDraggingTab
                );
              }}
            >
              <p>${tab.name}</p>
              <div class="enter-icon">
                <sl-icon-button color="#fff" name="x-lg"></sl-icon-button>
              </div>
            </div>
          `;
        })}
        <sl-icon-button
          @click=${() => {
            sendEvent<NewPanelTabEventType>(this, NEW_TAB_EVENT, {
              panelID: this.panelID!,
            });
          }}
          class="stretch"
          color="#fff"
          name="plus-lg"
        >
        </sl-icon-button>
      </div>
      <div
        class="add-more-box"
        @pointerenter=${(e: PointerEvent) => {
          if (!this.isDraggingTab) return;

          this.isDraggingTab.hoveredTabElement = e.target as Element;
          (e.target as Element).classList.add('hovered-element');
          sendEvent<IsDraggingTabEvent>(
            this,
            IS_DRAGGING_TAB_EVENT,
            this.isDraggingTab
          );
        }}
        @pointerleave=${(e: PointerEvent) => {
          if (!this.isDraggingTab) return;

          this.isDraggingTab.hoveredTabElement = null;

          (e.target as Element).classList.remove('hovered-element');
          sendEvent<IsDraggingTabEvent>(
            this,
            IS_DRAGGING_TAB_EVENT,
            this.isDraggingTab
          );
        }}
      ></div>

      <!-- show panel options -->
      <div class="panel-options">
        <sl-tooltip content="See changes">
          <sl-icon-button color="white" name="file-diff"></sl-icon-button>
        </sl-tooltip>
        <sl-tooltip content="Split panel">
          <sl-icon-button
            color="white"
            name="layout-split"
            @click=${() => {
              sendEvent<SplitPanelEventType>(this, SPLIT_PANEL_EVENT, {
                panelID: this.panelID!,
                tab: this.activeTab!,
                side: PanelDrop.Right,
              });
            }}
          ></sl-icon-button>
        </sl-tooltip>
        <sl-dropdown>
          <sl-icon-button
            slot="trigger"
            color="white"
            name="three-dots"
          ></sl-icon-button>
          <sl-menu>
            <sl-menu-item>Close all</sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </div>
    `;
  }

  renderTabContent() {
    return this.activeTab?.renderPanelContents();
  }

  render() {
    this.updateOnRender();

    return html`
      <div id="panel-container">
        <div
          class="top-container ${this.areTabsHoverable ? 'hoverable-tabs' : ''}"
        >
          ${this.renderTabList()}
        </div>
        <div class="tab-content-container">${this.renderTabContent()}</div>
        ${this.renderHandle()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'panel-element': PanelElement;
  }
}
