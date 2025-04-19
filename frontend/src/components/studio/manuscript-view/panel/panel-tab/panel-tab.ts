import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PanelContentElement } from '../panel-content-element';
import {
  genShortID,
  sendEvent,
  swapBasedOnKey,
} from '../../../../../lib/model/util';
import {
  CLOSE_PANEL_EVENT,
  IS_DRAGGING_TAB_EVENT,
  PanelDrop,
  SPLIT_PANEL_EVENT,
} from '../../../../../lib/model/panel';
import { ManuscriptElement } from '../../../../../pages/manuscript-element';
import { PanelElement } from '../panel-element';
import { add } from 'isomorphic-git';
import { Panel, PanelTab } from '../panel-state';

export const HOVER_CONATINER_CSS = 'hover-container';
export const DRAGGED_ELEMENT_CSS = 'dragged-element';
export const HOVERED_ELEMENT_HIGHLIGHTING = 'hovered-element';
export const BORDER_HIGHLIGHTING = 'border-highlighting';

export const ADD_MORE_BOX_CSS = 'add-more-box';
export const PANEL_TAB_CSS = 'panel-tab';

export function setPanelTabEventListeners(this: ManuscriptElement) {
  // @ts-ignore
  document.addEventListener(IS_DRAGGING_TAB_EVENT, setDraggedTab.bind(this));
}

function searchListForClasses(
  this: ManuscriptElement,
  list: HTMLElement[]
): {
  tab: HTMLElement | null;
  addMoreBox: HTMLElement | null;
  panel: PanelElement | null;
} {
  let panel: PanelElement | null = null;
  let addMoreBox: HTMLElement | null = null;
  let tab: HTMLElement | null = null;

  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (element instanceof DocumentFragment) {
      continue;
    }

    if (element.classList.contains(`${PANEL_TAB_CSS}`)) {
      tab = element;
    } else if (element.classList.contains(`${ADD_MORE_BOX_CSS}`)) {
      addMoreBox = element;
    }

    if (element.nodeName === 'PANEL-ELEMENT') {
      panel = element as PanelElement;
    }
  }

  return { tab: tab, addMoreBox: addMoreBox, panel: panel as PanelElement };
}

/* Start handleDragTab */

function createDraggingTab(this: ManuscriptElement) {
  if (!this.draggedTab) return;

  if (!this.draggedTab.el) {
    const el = document.createElement('div');
    el.textContent = this.draggedTab.tab.name;
    el.classList.add('dragged-element');
    el.classList.add(`${PANEL_TAB_CSS}`);
    if (this.draggedTab.tabElement.classList.contains('active')) {
      el.classList.add('active');
    }
    this.draggedTab.el = el;
    document.body.appendChild(el);
    return el;
  }

  return null;
}

/* */

function handleHoverOverPanel(
  this: ManuscriptElement,
  e: PointerEvent,
  panel: PanelElement | null
) {
  if (!panel) return;

  const rect = panel.shadowRoot
    ?.querySelector('.tab-content-container')
    ?.getBoundingClientRect()!;

  if (
    e.x > rect.left &&
    e.x < rect.right &&
    e.y > rect.top &&
    e.y < rect.bottom
  ) {
    this.draggedTab!.toPanel = panel.panelID;
    let element = document.querySelector(`.${HOVER_CONATINER_CSS}`);
    const hoverContainer = element ? element : document.createElement('div');
    if (!element) {
      hoverContainer.classList.add(HOVER_CONATINER_CSS);
    }
    this.draggedTab!.isHoveringOverPanel = true;

    let width = rect.width;
    let left = rect.left;
    // place on left side
    const DIVIDING_FACTOR = 5;
    if (e.x < rect.left + rect.width / DIVIDING_FACTOR) {
      width /= DIVIDING_FACTOR;
      this.draggedTab!.panelDrop = PanelDrop.Left;

      // place in the middle
    } else if (
      e.x >
      rect.left + (rect.width / DIVIDING_FACTOR) * (DIVIDING_FACTOR - 1)
    ) {
      // place on right side
      this.draggedTab!.panelDrop = PanelDrop.Right;

      width /= DIVIDING_FACTOR;
      left = rect.left + width * (DIVIDING_FACTOR - 1);
    } else {
      if (this.draggedTab?.fromPanel !== this.draggedTab?.toPanel) {
        this.draggedTab!.panelDrop = PanelDrop.Center;
      } else {
        this.draggedTab!.panelDrop = null;
      }
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
  } else {
    this.draggedTab!.isHoveringOverPanel = false;
  }
}

function removeHoveredElementHighlighting(this: ManuscriptElement) {
  if (this.draggedTab && this.draggedTab?.hoveredTab) {
    this.draggedTab.hoveredTab.classList.remove(
      `${HOVERED_ELEMENT_HIGHLIGHTING}`
    );
    this.draggedTab.hoveredTab.classList.remove(`${BORDER_HIGHLIGHTING}`);
    this.draggedTab.hoveredTab = null;
  }
}

function setHoveredElement(this: ManuscriptElement, el: HTMLElement) {
  if (el.id !== this.draggedTab?.tab.id && this.draggedTab) {
    this.draggedTab.hoveredTab = el;
    if (this.draggedTab.hoveredTab.classList.contains(`${ADD_MORE_BOX_CSS}`)) {
      this.draggedTab.hoveredTab.classList.add(HOVERED_ELEMENT_HIGHLIGHTING);
    }

    if (this.draggedTab.hoveredTab.classList.contains(`${PANEL_TAB_CSS}`)) {
      this.draggedTab.hoveredTab.classList.add(BORDER_HIGHLIGHTING);
    }
  }
}

function setDraggedElementPosition(this: ManuscriptElement, e: PointerEvent) {
  if (!this.draggedTab) return;

  const rect = this.draggedTab?.tabElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  if (this.draggedTab.el) {
    this.draggedTab.el.setAttribute(
      'style',
      `left: ${e.x - width / 2}px; top: ${e.y - height / 2}px;`
    );
  }
}

function setActiveTab(this: ManuscriptElement, panel: PanelElement) {
  this.draggedTab;
  panel.tabs.forEach((tab: PanelTab) => {
    if (tab.id === this.draggedTab?.tab.id) {
      panel.activeTab = tab;
    }
  });
}

export function handleDragTab(this: ManuscriptElement, e: PointerEvent) {
  const list: HTMLElement[] = e.composedPath().slice(0, -4) as HTMLElement[];

  const panelTab = searchListForClasses.bind(this)(list);

  if (panelTab.panel) {
    setActiveTab.bind(this)(panelTab.panel);
  }

  createDraggingTab.bind(this)();

  if (panelTab.tab?.id !== this.draggedTab?.hoveredTab?.id) {
    removeHoveredElementHighlighting.bind(this)();
  }

  if (panelTab.tab) {
    setHoveredElement.bind(this)(panelTab.tab);
  } else if (panelTab.addMoreBox) {
    setHoveredElement.bind(this)(panelTab.addMoreBox);
  }

  setDraggedElementPosition.bind(this)(e);
  handleHoverOverPanel.bind(this)(e, panelTab.panel);

  if (!this.draggedTab?.isHoveringOverPanel) {
    document.querySelector(`.${HOVER_CONATINER_CSS}`)?.remove();
    this.draggedTab!.panelDrop = null;
    this.draggedTab!.toPanel = null;
  }
}

/* END handleDragTab */

/* START handleDragTab */

function removeThisTab(this: ManuscriptElement) {
  if (!this.draggedTab) return;

  this.draggedTab.panel.tabs = this.draggedTab.panel.tabs.filter(
    (tab: PanelTab) => tab.id !== this.draggedTab?.tab.id
  );
  if (this.draggedTab.panel.tabs.length > 0) {
    this.draggedTab.panel.activeTab = this.draggedTab.panel.tabs[0];
    Panel.UpdatePanel(this.draggedTab.panel.formPanel());
  } else {
    sendEvent(this, CLOSE_PANEL_EVENT, this.draggedTab.panel.panelID);
  }
}

function addTabsToDifferentPanels(
  this: ManuscriptElement,
  panel: PanelElement
): boolean {
  if (!this.draggedTab) return false;

  // & simply add other tabs
  // * but specifically in a tab location
  if (
    this.draggedTab.fromPanel !== this.draggedTab.toPanel &&
    this.draggedTab.hoveredTab &&
    this.draggedTab.hoveredTab.classList.contains(`${PANEL_TAB_CSS}`)
  ) {
    // if we are dropping to other panel
    if (this.draggedTab.toPanel === panel.panelID) {
      // & now splice the tabs
      const hoveredTabIndex = panel.tabs.findIndex(
        (tab: PanelTab) => tab.id === this.draggedTab?.hoveredTab?.id
      );

      if (hoveredTabIndex >= 0) {
        panel.tabs = [
          ...panel.tabs.slice(0, hoveredTabIndex),
          this.draggedTab.tab,
          ...panel.tabs.slice(hoveredTabIndex),
        ];
      } else {
        // append to the end of the list
        panel.tabs.push(this.draggedTab.tab);
      }

      panel.activeTab = this.draggedTab.tab;

      this.requestUpdate();
    }

    removeThisTab.bind(this)();
    this.draggedTab.panel.requestUpdate();
    Panel.UpdatePanel(this.draggedTab.panel.formPanel());
    return true;
  }

  this.requestUpdate();
  return false;
}

function addTabToEndOfList(this: ManuscriptElement, panel: PanelElement) {
  if (!this.draggedTab) return;

  if (this.draggedTab.fromPanel === this.draggedTab.toPanel) {
    panel.tabs = panel.tabs.filter(
      (tab: PanelTab) => tab.id !== this.draggedTab?.tab.id
    );
  } else {
    removeDraggedTab.bind(this)(this.draggedTab.panel);
    if (this.draggedTab.panel.tabs.length === 0) {
      sendEvent(this, CLOSE_PANEL_EVENT, this.draggedTab.panel.panelID);
    } else {
      this.draggedTab.panel.activeTab = this.draggedTab.panel.tabs[0];
    }
  }
  panel.tabs.push(this.draggedTab.tab);

  panel.activeTab = this.draggedTab.tab;
  Panel.UpdatePanel(panel.formPanel());
}

function removeDraggedTab(this: ManuscriptElement, panel: PanelElement) {
  panel.tabs = panel.tabs.filter(
    (tab: PanelTab) => tab.id !== this.draggedTab?.tab.id
  );
}

function addTabViaPanelHover(
  this: ManuscriptElement,
  panel: PanelElement
): boolean {
  if (!this.draggedTab) return false;
  if (!this.draggedTab.panelDrop) return false;
  // the panel that the tab came from should be deleted

  // if we drag to same panel
  if (this.draggedTab.fromPanel === panel.panelID) {
    // do not do ANYTHING if we have only 1 tab
    if (panel.tabs.length === 1) {
      return false;
    }

    removeDraggedTab.bind(this)(panel);

    if (!panel.tabs[0]) {
      panel.remove();
    }
    panel.activeTab = panel.tabs[0];
    this.updateAllPanels();
  }

  // no need to create a new tab
  if (!(this.draggedTab.toPanel === panel.panelID)) return false;

  // this simply adds the tab to the panel
  if (this.draggedTab.panelDrop === PanelDrop.Center) {
    // if tab is already in same panel, it does nothing.
    if (this.draggedTab.fromPanel === this.draggedTab.toPanel) {
      return false;
    }

    addTabToEndOfList.bind(this)(panel);
    panel.activeTab = this.draggedTab.tab;

    return true;
    // if tab comes from new panel, add it to the tab list at the end
  } else if (this.draggedTab.panelDrop === PanelDrop.Left) {
    sendEvent(this, SPLIT_PANEL_EVENT, {
      panelID: panel.panelID,
      tab: this.draggedTab.tab,
      side: PanelDrop.Left,
    });
    return true;
  } else if (this.draggedTab.panelDrop === PanelDrop.Right) {
    sendEvent(this, SPLIT_PANEL_EVENT, {
      panelID: panel.panelID,
      tab: this.draggedTab.tab,
      side: PanelDrop.Right,
    });

    // this happens to the other panel
    removeThisTab.bind(this)();

    return true;
  }
  return false;
}

function addTabsToEndOfTabListViaTabList(
  this: ManuscriptElement,
  panel: PanelElement
): boolean {
  if (!this.draggedTab) return false;
  // for adding to the end of the list
  if (this.draggedTab.hoveredTab?.classList.contains(`${ADD_MORE_BOX_CSS}`)) {
    addTabToEndOfList.bind(this)(panel);

    return true;
  }
  return false;
}

function swapTabsInSamePanel(this: ManuscriptElement, panel: PanelElement) {
  if (!this.draggedTab) return;
  // I only want to replace tabs if they are coming from the same panel.
  if (
    this.draggedTab.hoveredTab &&
    this.draggedTab.fromPanel === this.draggedTab.toPanel &&
    panel.panelID === this.draggedTab.fromPanel
  ) {
    panel.tabs = swapBasedOnKey<PanelTab, string>(
      panel.tabs,
      'id',
      this.draggedTab.tab.id,
      this.draggedTab.hoveredTab.id
    );

    panel.requestUpdate();
  }
}

function removeDraggedTabDOMElement(this: ManuscriptElement) {
  // remove dragging shit
  if (this.draggedTab?.el) {
    this.draggedTab?.el.remove();
  }
  if (this.draggedTab?.hoveredTab) {
    removeHoveredElementHighlighting.bind(this)();
  }

  this.draggedTab = null;

  const els = document.querySelectorAll(`.${DRAGGED_ELEMENT_CSS}`);
  els.forEach((el) => {
    el.remove();
  });

  document.querySelector(`.${HOVER_CONATINER_CSS}`)?.remove();
  document.querySelector(`.${DRAGGED_ELEMENT_CSS}`)?.remove();

  document.removeEventListener('pointermove', this.handleDragTab);
  document.removeEventListener('pointerup', this.handleDropTab);
}

export function handleDropTab(this: ManuscriptElement, e: PointerEvent) {
  const list: HTMLElement[] = e.composedPath().slice(0, -4) as HTMLElement[];
  const panelTab = searchListForClasses.bind(this)(list);

  if (!panelTab.panel) {
    return;
  }

  if (this.draggedTab) {
    this.draggedTab.toPanel = panelTab.panel.panelID!;
  }
  if (this.draggedTab) {
    removeHoveredElementHighlighting.bind(this)();
    if (panelTab.tab) {
      this.draggedTab.hoveredTab = panelTab.tab;
    } else if (panelTab.addMoreBox) {
      this.draggedTab.hoveredTab = panelTab.addMoreBox;
    }
  }

  let added = addTabsToDifferentPanels.bind(this)(panelTab.panel);
  if (!added) {
    added = addTabViaPanelHover.bind(this)(panelTab.panel);
  }
  if (!added) {
    added = addTabsToEndOfTabListViaTabList.bind(this)(panelTab.panel);
  }
  if (!added) {
    swapTabsInSamePanel.bind(this)(panelTab.panel);
  }

  Panel.UpdatePanel(panelTab.panel.formPanel());
  if (this.draggedTab) {
    Panel.UpdatePanel(this.draggedTab?.panel.formPanel());
  }

  removeDraggedTabDOMElement.bind(this)();
}

function setDraggedTab(this: ManuscriptElement, e: CustomEvent<any>) {
  this.draggedTab = e.detail;

  if (this.draggedTab) {
    document.addEventListener('pointermove', this.handleDragTab);
    document.addEventListener('pointerup', this.handleDropTab);
  } else {
    // todo remove event listener
  }
}
