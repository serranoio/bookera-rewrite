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
import { createPanelTab } from '../../../../pages/manuscript-element';
import { QuoteList } from '../../../../lib/model/hard-coded';
import '../modules/core-modules/theme-switcher/src/theme-switcher-element';
import { ThemeSwitcherElement } from '../modules/core-modules/theme-switcher/src/theme-switcher-element';
import {
  CLOSE_PANEL_EVENT,
  CLOSE_SIDE_PANEL_EVENT,
  IS_DRAGGING_TAB_EVENT,
  IsDraggingTabEvent,
  NEW_TAB_EVENT,
  NewPanelTabEventType,
  OPEN_SIDE_PANEL_EVENT,
  PANEL_CONSTRUCTION_EVENT,
  PanelDrop,
  SPLIT_PANEL_EVENT,
  SplitPanelEventType,
} from '../../../../lib/model/panel';
import { ModuleRegistry } from '../modules/registry';
import { Module } from '../modules/module';
import { mo } from '@twind/core';
import { CreateBagManager, GetBagManager } from '@pb33f/saddlebag';
import { PanelContentElement, PanelContentType } from './panel-content-element';

export const MINIMMAL_PANEL_WIDTH = 200;

export type PanelTabTypes = 'New Tab' | 'Body' | 'Divider' | 'Settings';

export class PanelTab {
  name: string;
  type: PanelTabTypes;
  id: string;

  constructor(name: string, type: PanelTabTypes) {
    this.name = name;
    this.type = type;
    this.id = genShortID(6);
  }

  static CreateNewPanel(panelTab: PanelTabTypes) {
    if (panelTab === 'Settings') {
      return new PanelTab(panelTab, panelTab);
    }

    return new PanelTab('undefined', 'Body');
  }

  renderPanelContents(): TemplateResult {
    const panelContent = new PanelContentElement(this.type as PanelContentType);

    return html`${panelContent}`;
  }
}

const HOVER_CONATINER_CSS = 'hover-container';
const DRAGGED_ELEMENT_CSS = 'dragged-element';
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

  @property()
  isDraggingTab: IsDraggingTabEvent | null = null;

  @property()
  isPointerDown: boolean = false;

  constructor() {
    super();

    document.addEventListener(
      OPEN_SIDE_PANEL_EVENT,
      this.handleOpenRightSidePanel.bind(this)
    );

    document.addEventListener(
      CLOSE_SIDE_PANEL_EVENT,
      this.handleCloseRightSidePanel.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      IS_DRAGGING_TAB_EVENT,
      this.setDraggedTab.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      NEW_TAB_EVENT,
      this.handleCreateEmptyTab.bind(this)
    );

    document.addEventListener('pointermove', this.handleDragTab.bind(this));
    document.addEventListener('pointerup', this.handleDestroyTab.bind(this));
  }

  handleCreateEmptyTab(e: CustomEvent<NewPanelTabEventType>) {
    if (!(e.detail.panelID === this.panelID)) return;

    this.tabs.push(new PanelTab('New Tab', 'New Tab'));
    this.activeTab = this.tabs[this.tabs.length - 1];
    this.requestUpdate();
  }

  setDraggedTab(e: CustomEvent<any>) {
    this.isDraggingTab = e.detail;
  }

  private addTabsToDifferentPanels() {
    if (!this.isDraggingTab) return;

    // & simply add other tabs
    // * but specifically in a tab location
    if (
      this.isDraggingTab.fromPanel !== this.isDraggingTab.toPanel &&
      (this.isDraggingTab.hoveredTab || this.isDraggingTab.hoveredTabElement)
    ) {
      // to panel
      if (this.isDraggingTab.toPanel === this.panelID) {
        // & now splice the tabs
        const hoveredTabIndex = this.tabs.findIndex(
          (tab: PanelTab) => tab.id === this.isDraggingTab?.hoveredTab?.id
        );

        if (hoveredTabIndex >= 0) {
          this.tabs = [
            ...this.tabs.slice(0, hoveredTabIndex),
            this.isDraggingTab.tab,
            ...this.tabs.slice(hoveredTabIndex),
          ];
        } else {
          // append to the end of the list
          this.tabs.push(this.isDraggingTab.tab);
        }

        this.activeTab = this.isDraggingTab.tab;
        this.requestUpdate();
      } else {
        // this happens to the other panel
        this.tabs = this.tabs.filter(
          (tab: PanelTab) => tab.id !== this.isDraggingTab?.tab.id
        );
        if (this.tabs.length > 0) {
          this.activeTab = this.tabs[0];
        } else {
          sendEvent(this, CLOSE_PANEL_EVENT, this.panelID);
        }
      }

      this.requestUpdate();
    }
  }

  private addTabToEndOfList() {
    if (!this.isDraggingTab) return;

    // if we have a tab at the beginnig, we remove it. it goes to the end
    this.tabs = this.tabs.filter(
      (tab: PanelTab) => tab.id !== this.isDraggingTab?.tab.id
    );
    this.tabs.push(this.isDraggingTab.tab);
  }

  private addTabsToEndOfTabListViaTabList() {
    if (!this.isDraggingTab) return;
    // for adding to the end of the list
    if (
      !this.isDraggingTab.hoveredTab &&
      this.isDraggingTab.hoveredTabElement &&
      this.isDraggingTab.fromPanel === this.isDraggingTab.toPanel &&
      this.panelID === this.isDraggingTab.fromPanel
    ) {
      this.addTabToEndOfList();
    }
  }

  private swapTabsInSamePanel() {
    if (!this.isDraggingTab) return;
    // I only want to replace tabs if they are coming from the same panel.
    if (
      this.isDraggingTab.hoveredTab &&
      this.isDraggingTab.fromPanel === this.isDraggingTab.toPanel &&
      this.panelID === this.isDraggingTab.fromPanel
    ) {
      this.tabs = this.tabs.map((tab: PanelTab) => {
        if (tab.id === this.isDraggingTab?.hoveredTab?.id) {
          tab = this.isDraggingTab.tab;
        } else if (tab.id === this.isDraggingTab?.tab.id) {
          tab = this.isDraggingTab.hoveredTab!;
        }
        return tab;
      });
    }
  }

  getManuscriptElement() {
    const manuscriptElement = document.querySelector('manuscript-element');
    return manuscriptElement;
  }

  private addTabViaPanelHover() {
    if (!this.isDraggingTab) return;
    if (!this.isDraggingTab.panelDrop) return;
    // the panel that the tab came from should be deleted

    // if we drag to same panel
    if (this.isDraggingTab.fromPanel === this.panelID) {
      // do not do ANYTHING if we have only 1 tab
      if (this.tabs.length === 1) {
        return;
      }

      this.tabs = this.tabs.filter(
        (tab: PanelTab) => tab.id !== this.isDraggingTab?.tab.id
      );
      if (!this.tabs[0]) {
        this.remove();
      }
      this.activeTab = this.tabs[0];

      this.getManuscriptElement()!.updateAllPanels();
    }

    // no need to create a new tab
    if (!(this.isDraggingTab.toPanel === this.panelID)) return;

    // this simply adds the tab to the panel
    if (this.isDraggingTab.panelDrop === PanelDrop.Center) {
      // if tab is already in same panel, it does nothing.
      if (this.isDraggingTab.fromPanel === this.isDraggingTab.toPanel) {
        return;
      }

      this.addTabToEndOfList();
      this.activeTab = this.isDraggingTab.tab;

      // if tab comes from new panel, add it to the tab list at the end
    } else if (this.isDraggingTab.panelDrop === PanelDrop.Left) {
      sendEvent(this, SPLIT_PANEL_EVENT, {
        panelID: this.panelID,
        tab: this.isDraggingTab.tab,
        side: PanelDrop.Left,
      });
    } else if (this.isDraggingTab.panelDrop === PanelDrop.Right) {
      sendEvent(this, SPLIT_PANEL_EVENT, {
        panelID: this.panelID,
        tab: this.isDraggingTab.tab,
        side: PanelDrop.Right,
      });
    }
  }

  private retrieveToPanel(e: any) {
    if (
      e.target.classList.contains(`${HOVER_CONATINER_CSS}`) ||
      e.target.classList.contains(`${DRAGGED_ELEMENT_CSS}`)
    ) {
      return this.isDraggingTab?.toPanel;
    }

    return e.target.id;
  }

  handleDestroyTab(e: any) {
    if (!this.isDraggingTab) {
      document.querySelector(`.${DRAGGED_ELEMENT_CSS}`)?.remove();
      return;
    }

    this.isPointerDown = false;
    this.isDraggingTab.hoveredTabElement?.classList.remove('hovered-element');
    // @ts-ignore
    this.isDraggingTab = {
      ...this.isDraggingTab,
      toPanel: this.retrieveToPanel(e),
    };

    this.addTabsToDifferentPanels();
    this.addTabsToEndOfTabListViaTabList();
    this.swapTabsInSamePanel();
    this.addTabViaPanelHover();

    this.removeDraggedTabDOMElement();
    this.requestUpdate();
  }

  private removeDraggedTabDOMElement() {
    // remove dragging shit
    if (this.isDraggingTab?.el) {
      this.isDraggingTab?.el.remove();
    }
    this.isDraggingTab = null;

    const els = document.querySelectorAll(`.${DRAGGED_ELEMENT_CSS}`);
    els.forEach((el) => {
      el.remove();
    });

    document.querySelector(`.${HOVER_CONATINER_CSS}`)?.remove();
  }

  setDraggedElementPosition(e: PointerEvent) {
    if (!this.isDraggingTab) return;

    const rect = this.isDraggingTab?.tabElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (this.isDraggingTab.el) {
      this.isDraggingTab.el.setAttribute(
        'style',
        `left: ${e.x - width / 2}px; top: ${e.y - height / 2}px;`
      );
    }
  }

  private createDraggingTab() {
    if (!this.isDraggingTab) return;

    if (!this.isDraggingTab.el && this.isPointerDown) {
      const el = document.createElement('div');
      el.textContent = this.isDraggingTab.tab.name;
      el.classList.add('dragged-element');
      el.classList.add('panel-tab');
      if (this.isDraggingTab.tabElement.classList.contains('active')) {
        el.classList.add('active');
      }
      this.isDraggingTab.el = el;
      document.body.appendChild(el);
      return el;
    }

    return null;
  }

  private handleHoverOverPanel(e: PointerEvent) {
    if (!this.isDraggingTab) return;

    const rect = this.shadowRoot
      ?.querySelector('.tab-content-container')
      ?.getBoundingClientRect()!;

    if (
      e.x > rect.left &&
      e.x < rect.right &&
      e.y > rect.top &&
      e.y < rect.bottom
    ) {
      this.isDraggingTab.toPanel = this.panelID;
      let element = document.querySelector(`.${HOVER_CONATINER_CSS}`);
      const hoverContainer = element ? element : document.createElement('div');
      if (!element) {
        hoverContainer.classList.add(HOVER_CONATINER_CSS);
      }

      let width = rect.width;
      let left = rect.left;
      // place on left side
      const DIVIDING_FACTOR = 5;
      if (e.x < rect.left + rect.width / DIVIDING_FACTOR) {
        width /= DIVIDING_FACTOR;
        this.isDraggingTab.panelDrop = PanelDrop.Left;

        // place in the middle
      } else if (
        e.x >
        rect.left + (rect.width / DIVIDING_FACTOR) * (DIVIDING_FACTOR - 1)
      ) {
        // place on right side
        this.isDraggingTab.panelDrop = PanelDrop.Right;

        width /= DIVIDING_FACTOR;
        left = rect.left + width * (DIVIDING_FACTOR - 1);
      } else {
        this.isDraggingTab.panelDrop = PanelDrop.Center;
      }

      hoverContainer.animate(
        {
          left: `${left}px`,
          top: `${rect.top}px`,
          width: `${width}px`,
          height: `${rect.height}px`,
          opactiy: `${0.25}`,
        },
        {
          duration: 500,
          fill: 'forwards',
        }
      );

      document.body.appendChild(hoverContainer);

      console.log('create hover container');
    }
  }

  handleDragTab(e: PointerEvent) {
    if (!this.isDraggingTab) return;

    this.createDraggingTab();
    this.handleHoverOverPanel(e);
    this.setDraggedElementPosition(e);
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

    setTimeout(this.handleOpenRightSidePanel.bind(this), 0);

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
    // handle tab close
    const tabClose = doesClickContainElement(e, { nodeName: 'SL-ICON-BUTTON' });

    // handle tab click
    const element = doesClickContainElement(e, { className: 'panel-tab' });
    if (tabClose) {
      let setNewActiveTab = false;
      this.tabs = this.tabs.filter((tab: PanelTab) => {
        if (this.activeTab?.id === tab.id) {
          setNewActiveTab = true;
        }
        if (tab.id === element!.dataset.id) {
          return false;
        }
        return true;
      });
      if (this.tabs.length === 0) {
        sendEvent(this, CLOSE_PANEL_EVENT, this.panelID);
        // if last tab, close out the panel.
        return;
      }

      // if we close out active tab, set the active tab to the first tab
      if (setNewActiveTab) {
        this.activeTab = this.tabs[0];
      }

      return;
    }

    if (!element) return;

    const tab = this.tabs.find(
      (tab: PanelTab) => tab.id === element.dataset.id
    );

    this.activeTab = tab!;
  }

  // & this is 'toggle'
  handleOpenRightSidePanel() {
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
    if ((e.detail.panelID as PanelSide) === 'right') {
      this.isRightSidePanelOpened = false;
    }
  }

  renderTabList() {
    let openSidePanel;

    if (this.fill && !this.isRightSidePanelOpened) {
      openSidePanel = html` <sl-tooltip content="Open Side Panel">
        <sl-icon-button
          name="layout-text-sidebar"
          @click=${() => {
            sendEvent(this, OPEN_SIDE_PANEL_EVENT, {
              panelID: 'right',
              position: 'right',
            });
          }}
        ></sl-icon-button>
      </sl-tooltip>`;
    }

    return html`
      <div class="tab-list-container" @click=${this.handleTabClick.bind(this)}>
        ${this.tabs.map((tab: PanelTab) => {
          return html`
            <div
              class="panel-tab ${this.activeTab?.id === tab.id ? 'active' : ''}"
              data-id=${tab.id}
              @pointerenter=${(e: PointerEvent) => {
                if (
                  this.isDraggingTab &&
                  this.isDraggingTab.tab.id !== tab.id
                ) {
                  e.target!.classList.add('hovered-element');
                  this.isDraggingTab.hoveredTab = tab;
                  this.isDraggingTab.hoveredTabElement = e.target as Element;
                  sendEvent(this, IS_DRAGGING_TAB_EVENT, this.isDraggingTab);
                }
              }}
              @pointerleave=${(e: PointerEvent) => {
                if (
                  this.isDraggingTab &&
                  this.isDraggingTab.tab.id !== tab.id
                ) {
                  this.isDraggingTab.hoveredTab = null;
                  this.isDraggingTab.hoveredTabElement = null;
                  e.target!.classList.remove('hovered-element');
                  sendEvent(this, IS_DRAGGING_TAB_EVENT, this.isDraggingTab);
                }
              }}
              @pointerdown=${(e: PointerEvent) => {
                this.isDraggingTab = {
                  tab: tab,
                  tabElement: e.target! as Element,
                  fromPanel: this.panelID,
                  el: null,
                  toPanel: null,
                  hoveredTab: null,
                  hoveredTabElement: null,
                };

                this.isPointerDown = true;
                sendEvent(this, IS_DRAGGING_TAB_EVENT, this.isDraggingTab);
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
        ${openSidePanel}
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
        <div class="top-container">${this.renderTabList()}</div>
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
