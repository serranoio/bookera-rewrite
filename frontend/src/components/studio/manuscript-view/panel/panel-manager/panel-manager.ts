import { notify } from '../../../../../lib/model/lit';
import {
  CLOSE_PANEL_EVENT,
  NEW_PANEL_EVENT,
  PanelDrop,
  SPLIT_PANEL_EVENT,
  SplitPanelEventType,
} from '../../../../../lib/model/panel';
import { OPEN_OUTLINE_EVENT } from '../../../../../lib/model/site';
import { genShortID } from '../../../../../lib/model/util';
import { ManuscriptElement } from '../../../../../pages/manuscript-element';
import { PanelElement, PanelTab } from '../panel-element';
import {
  PANEL_RESIZE_EVENT,
  PanelResizeEventDetail,
} from '../panel-handle/panel-handle-element';

function closePanelEvent(this: ManuscriptElement, e: any) {
  this.requestUpdate();

  const panels = this.getAllPanels();

  panels.forEach((panelElement: any, i: number) => {
    if (panelElement.panelID === e.detail) {
      if (i === panels.length - 1) {
        panels[i - 1].updateLastElement(true);
      }
      panelElement.remove();

      i = i;
    }
  });
}

function panelResize(
  this: ManuscriptElement,
  e: CustomEvent<PanelResizeEventDetail>
) {
  console.log('resize');
}

export function createPanelWithNewTabs(tabs: PanelTab[]): PanelElement {
  const panelElement = new PanelElement();
  panelElement.id = genShortID(6);
  panelElement.panelID = panelElement.id;
  panelElement.tabs = tabs;
  panelElement.activeTab = tabs[0];
  panelElement.updateLastElement(false);

  return panelElement;
}
// upon panel split, create new panel after old panel
function splitPanelEvent(
  this: ManuscriptElement,
  e: CustomEvent<SplitPanelEventType>
) {
  const panelElements = this.getAllPanels();

  const newTab = new PanelTab(e.detail.tab.name, e.detail.tab.type);
  const newPanel = createPanelWithNewTabs([newTab]);

  let foundElement = false;
  for (let i = 0; i < panelElements.length; i++) {
    const panel = panelElements[i];

    if (panel.id === e.detail.panelID) {
      foundElement = true;
      const canFit = updateWidths(panel, newPanel, panelElements, i);

      // panelDrop left is i
      let panelPosition = i;
      if (canFit && e.detail.side === PanelDrop.Right) {
        panelPosition++;
      }

      this.panelsSection?.insertBefore(newPanel, panelElements[panelPosition]);
      break;
    }
  }

  if (!foundElement) {
    const canFit = updateWidths(
      panelElements[panelElements.length - 1],
      newPanel,
      panelElements,
      panelElements.length - 1
    );

    if (canFit) {
      this.panelsSection?.appendChild(newPanel);
    }
  }

  this.updateAllPanels();

  // create a new panel
  this.requestUpdate();
}

function openSidePanelEvent(this: ManuscriptElement) {
  this.isSidePanelOpened = !this.isSidePanelOpened;

  const panels = this.getAllPanels();
  if (this.isSidePanelOpened) {
    // panels[panels.length - 1].updateSidePanelOpened(true);
  } else {
    // panels[panels.length - 1].updateSidePanelOpened(false);
  }
}

function newPanelEvent(this: ManuscriptElement, e: any) {
  const panels = this.getAllPanels();
  if (panels.length > 0) {
    panels[panels.length - 1].updateLastElement(false);
  }

  const panelElement = createPanelWithNewTabs([
    PanelTab.CreateNewPanel(e.detail),
  ]);

  panelElement.updateLastElement(true);

  this.panelsSection!.appendChild(panelElement);
}

function changePanelsToPercentage(this: ManuscriptElement) {
  const panels = this.getAllPanels();

  if (this.startTotalWidth === 0) {
    this.startTotalWidth = this.panelsSection?.getBoundingClientRect().width!;

    let widths: number[] = [];
    panels.forEach((panel) => {
      widths.push(panel.getBoundingClientRect().width / this.startTotalWidth);
    });

    panels.forEach((panel, i) => {
      panel.updateWidthToPercentage(widths[i]);
    });
  }

  if (this.timeout) {
    // invalidate existing timer
    clearTimeout(this.timeout);
  }

  this.timeout = setTimeout(this.endResizeEvent.bind(this), 200);
}

// todo: unused
function updatePanelWidth(panelID: string, width: number) {
  const updatedPanel = document
    .querySelector(`#${panelID}`)
    ?.shadowRoot?.querySelector('#panel-container');
  updatedPanel!.style.width = `${width}rem`;
}

function updateWidths(
  panel,
  newPanel,
  panelElements,
  currentPanelLocation: number
): boolean {
  // if we cannot take space from the owner, take space from the left. if none, take from right.
  // if none, you cannot create new panel

  let takeMoreSpace = false;

  // lets split in between
  let newWidth = panel.getBoundingClientRect().width / 2;
  if (newWidth < panel.minimumWidth) {
    takeMoreSpace = true;
  }

  if (takeMoreSpace) {
    let spaceNeeded = newPanel.minimumWidth;
    let panelsWidthTakenOff = [];

    for (let i = currentPanelLocation - 1; i >= 0; i--) {
      // if we can close this further, do it, if not move on.
      const checkPanel = panelElements[i];
      const checkPanelWidth = checkPanel.getBoundingClientRect().width;

      if (checkPanelWidth <= checkPanel.minimumWidth) {
        panelsWidthTakenOff.push(0);
      } else {
        // get how much we can take off this panel
        let widthToTakeOff = checkPanelWidth - checkPanel.minimumWidth;

        if (widthToTakeOff >= spaceNeeded) {
          panelsWidthTakenOff.push({ i: i, spaceNeeded: spaceNeeded });
          spaceNeeded = 0;
          break;
        } else {
          // shrink this panel by width
          panelsWidthTakenOff.push({ i: i, spaceNeeded: widthToTakeOff });
          spaceNeeded -= widthToTakeOff;
        }
      }
    }

    if (spaceNeeded === 0) {
      panelsWidthTakenOff.forEach((panelWidths) => {
        if (panelWidths === 0) return;
        panelElements[panelWidths.i].updateWidth(
          panelElements[panelWidths.i].getBoundingClientRect().width -
            panelWidths.spaceNeeded
        );
      });

      newPanel.updateWidth(newPanel.minimumWidth);
    } else {
      console.log(
        'could not find more width to the left, searching to the right'
      );
      for (let i = currentPanelLocation + 1; i < panelElements.length; i++) {
        // if we can close this further, do it, if not move on.
        const checkPanel = panelElements[i];
        const checkPanelWidth = checkPanel.getBoundingClientRect().width;

        if (checkPanelWidth <= checkPanel.minimumWidth) {
          panelsWidthTakenOff.push(0);
        } else {
          // get how much we can take off this panel
          let widthToTakeOff = checkPanelWidth - checkPanel.minimumWidth;

          if (widthToTakeOff >= spaceNeeded) {
            panelsWidthTakenOff.push({ i: i, spaceNeeded: spaceNeeded });
            spaceNeeded = 0;
            break;
          } else {
            // shrink this panel by width
            panelsWidthTakenOff.push({ i: i, spaceNeeded: widthToTakeOff });
            spaceNeeded -= widthToTakeOff;
          }
        }
      }

      if (spaceNeeded === 0) {
        panelsWidthTakenOff.forEach((panelWidths) => {
          if (panelWidths === 0) return;
          panelElements[panelWidths.i].updateWidth(
            panelElements[panelWidths.i].getBoundingClientRect().width -
              panelWidths.spaceNeeded
          );
        });
      } else {
        notify(
          'Panel doesnt fit. If you got here, just delete some panels haha, you have too much',
          'warning',
          ''
        );
        return false;
      }
    }
  } else {
    panel.updateWidth(newWidth);
    newPanel.updateWidth(newWidth);
  }
  return true;
}

export function addEventListeners(this: ManuscriptElement) {
  document.addEventListener(CLOSE_PANEL_EVENT, closePanelEvent.bind(this));

  // @ts-ignore
  document.addEventListener(PANEL_RESIZE_EVENT, panelResize.bind(this));

  // @ts-ignore
  document.addEventListener(SPLIT_PANEL_EVENT, splitPanelEvent.bind(this));

  // @ts-ignore
  document.addEventListener(NEW_PANEL_EVENT, newPanelEvent.bind(this));

  // @ts-ignore
  document.addEventListener(OPEN_OUTLINE_EVENT, openSidePanelEvent.bind(this));

  // @ts-ignore
  document.addEventListener('resize', changePanelsToPercentage.bind(this));
}
