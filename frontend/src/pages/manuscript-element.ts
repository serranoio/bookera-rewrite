import FroalaEditor from "froala-editor";
import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "../components/studio/manuscript-view/side-panel/side-panel-element";
import "../components/studio/manuscript-view/panel/panel-element";
import {
  MINIMMAL_PANEL_WIDTH,
  PanelElement,
  PanelTab,
} from "../components/studio/manuscript-view/panel/panel-element";
import { genShortID, transformVariableIntoKey } from "../lib/model/util";
import {
  MINIMUM_WIDTH_HIT,
  PANEL_RESIZE_EVENT,
  PanelResizeEventDetail,
} from "../components/studio/manuscript-view/panel/panel-handle/panel-handle-element";
import { Bag, BagManager, CreateBagManager } from "@pb33f/saddlebag";
import { render } from "lit-element";
import { notify } from "../lib/model/lit";
import {
  OUTLINE_TAB,
  SEARCH_TAB,
  EXTENSIONS_TAB,
  OPEN_PANEL,
  OPEN_SIDE_PANEL_TAB,
  POMODORO_TAB,
  CALENDAR_TAB,
} from "../components/studio/manuscript-view/side-panel/panel-bar-element/panel-bar-element";
import {
  SendSettingToSidebar,
  SendSettingToSidebarEvent,
  SendSettingsToSidebarEvent,
  SendSettingsToSidebarType,
} from "../components/studio/manuscript-view/modules/util";
import {
  LeftTabsKey,
  RightTabsKey,
  SelectedRightTabKey,
  Tab,
  TabsBag,
  TabsBagKey,
  TabsSingleton,
} from "../lib/model/tab";
import {
  CLOSE_PANEL_EVENT,
  NEW_PANEL_EVENT,
  PanelDrop,
  SPLIT_PANEL_EVENT,
  SplitPanelEventType,
} from "../lib/model/panel";
import { OPEN_OUTLINE_EVENT } from "../lib/model/site";
import localforage from "localforage";

interface Panel {
  tabs: PanelTab[];
  id: string;
  isMinimumWidth: boolean;
  cannotResize: boolean;
  width: number;
}

// what if we make Panels a reference to the dom instead?

@customElement("manuscript-element")
export class ManuscriptElement extends LitElement {
  @query("#editor-div")
  editorDiv: Element | null;

  @query("#panels-section")
  panelsSection: Element | null;

  @state()
  isSidePanelOpened: boolean = false;

  @state()
  tabsSingleton: TabsSingleton = new TabsSingleton();

  closePanelEvent(e: any) {
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

  updatePanelWidth(panelID: string, width: number) {
    const updatedPanel = document
      .querySelector(`#${panelID}`)
      ?.shadowRoot?.querySelector("#panel-container");
    updatedPanel!.style.width = `${width}rem`;
  }

  updateWidths(
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
          "could not find more width to the left, searching to the right"
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
            "Panel doesnt fit. If you got here, just delete some panels haha, you have too much",
            "warning",
            ""
          );
          return false;
        }
      }

      console.log(panelsWidthTakenOff);
      console.log(panelElements);
    } else {
      panel.updateWidth(newWidth);
      newPanel.updateWidth(newWidth);
    }
    return true;
  }

  // upon panel split, create new panel after old panel
  splitPanelEvent(e: CustomEvent<SplitPanelEventType>) {
    const panelElements = this.getAllPanels();

    const newTab = new PanelTab(e.detail.tab.name, e.detail.tab.type);
    const newPanel = this.createPanelWithNewTabs([newTab]);

    let foundElement = false;
    for (let i = 0; i < panelElements.length; i++) {
      const panel = panelElements[i];

      if (panel.id === e.detail.panelID) {
        foundElement = true;
        const canFit = this.updateWidths(panel, newPanel, panelElements, i);

        // panelDrop left is i
        let panelPosition = i;
        if (canFit && e.detail.side === PanelDrop.Right) {
          panelPosition++;
        }

        this.panelsSection?.insertBefore(
          newPanel,
          panelElements[panelPosition]
        );
        break;
      }
    }

    if (!foundElement) {
      const canFit = this.updateWidths(
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

  updateAllPanels() {
    const newPanels = this.getAllPanels();
    newPanels.forEach((panel, i) => {
      if (i === newPanels.length - 1) {
        panel.updateLastElement(true);
      } else {
        panel.updateLastElement(false);
      }
    });
  }

  private getAllPanels = () => {
    return this.panelsSection!.querySelectorAll("panel-element")!;
  };

  // if I can move a panel to the right, AND the panel shrinks as well up until minimumWidth, that would be money
  panelResizeEvent(e: CustomEvent<PanelResizeEventDetail>) {
    // const panelElements = this.getAllPanels();
    // const lastElement = panelElements[panelElements.length - 1]
    // if (lastElement.getBoundingClientRect().width <== lastElement.minimumWidth) {
    //   break
    // }
  }

  openSidePanelEvent() {
    this.isSidePanelOpened = !this.isSidePanelOpened;

    console.log(this.isSidePanelOpened);
    const panels = this.getAllPanels();
    if (this.isSidePanelOpened) {
      // panels[panels.length - 1].updateSidePanelOpened(true);
    } else {
      // panels[panels.length - 1].updateSidePanelOpened(false);
    }
  }

  private createPanelWithNewTabs(tabs: PanelTab[]) {
    const panelElement = new PanelElement();
    panelElement.id = genShortID(6);
    panelElement.panelID = panelElement.id;
    panelElement.tabs = tabs;
    panelElement.activeTab = tabs[0];
    panelElement.updateLastElement(false);

    return panelElement;
  }

  private newPanelEvent(e: any) {
    const panels = this.getAllPanels();
    if (panels.length > 0) {
      panels[panels.length - 1].updateLastElement(false);
    }

    const panelElement = this.createPanelWithNewTabs([
      PanelTab.CreateNewPanel(e.detail),
    ]);
    panelElement.updateLastElement(true);

    this.panelsSection!.appendChild(panelElement);
  }

  constructor() {
    super();

    document.addEventListener(
      CLOSE_PANEL_EVENT,
      this.closePanelEvent.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      PANEL_RESIZE_EVENT,
      this.panelResizeEvent.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      SPLIT_PANEL_EVENT,
      this.splitPanelEvent.bind(this)
    );

    // @ts-ignore
    document.addEventListener(NEW_PANEL_EVENT, this.newPanelEvent.bind(this));

    // @ts-ignore
    document.addEventListener(
      OPEN_OUTLINE_EVENT,
      this.openSidePanelEvent.bind(this)
    );

    addEventListener("resize", this.changePanelsToPercentage.bind(this));

    const bagManager = CreateBagManager(true);
    const tabsBag = TabsSingleton.InitializeTabsInBag(bagManager);
  }

  @state()
  startTotalWidth = 0;

  endResizeEvent() {
    if (this.startTotalWidth > 0) {
      const panels = this.getAllPanels();
      panels.forEach((panel) => {
        panel.updateWidth(panel.getBoundingClientRect().width);
      });
    }

    this.startTotalWidth = 0;
  }

  @state()
  timeout;

  changePanelsToPercentage() {
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

    // invalidate existing timer
    clearTimeout(this.timeout);

    this.timeout = setTimeout(this.endResizeEvent.bind(this), 200);
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
      ],
    });

    document?.querySelectorAll(".editor-div").forEach((div) => {
      new FroalaEditor(div, {
        events: {
          contentChanged: () => {},
          initialized: () => {},
        },
        placeholderText: "",
        fullPage: true,
        toolbarInline: true,
        toolbarButtons: [
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

            "image",
          ],
        ],
      });
    });
  }

  firstUpdated() {
    this.panelsSection?.appendChild(
      this.createPanelWithNewTabs([new PanelTab("Settings", "Settings")])
    );
    this.panelsSection?.appendChild(
      this.createPanelWithNewTabs([new PanelTab("New Tab", "New Tab")])
    );
  }

  render() {
    return html`
      <side-panel-element .panelID=${"left"}></side-panel-element>
      <div id="panels-section"></div>
      <side-panel-element
        .panelBarPosition=${"top"}
        .panelID=${"right"}
      ></side-panel-element>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "manuscript-element": ManuscriptElement;
  }
}
