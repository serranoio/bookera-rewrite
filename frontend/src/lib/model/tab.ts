import { Bag, BagManager } from "@pb33f/saddlebag";
import { NEW_PANEL_EVENT, OPEN_SIDE_PANEL_EVENT } from "./panel";
import { genShortID } from "./util";
import localforage from "localforage";
import { TemplateResult } from "lit";

export class Tab {
  name?: string;
  // this is the icon
  value?: string;
  hotkey?: string;
  // this sends an event
  action?: string;
  // is this on the left bar or the right bar
  position?: "left" | "right";
  // if a component is registered, we will render this
  element?: string;
  menuItems?: TemplateResult;
  sidePanel?: TemplateResult;
  // ! Tabs need to be registered. If there is a matching ID, then there cannot be duplicate names
  id?: string;
  constructor(
    name?: string,
    value?: string,
    hotkey?: string,
    action?: string,
    position?: "left" | "right",
    element?: string,
    id?: string,
    menuItems?: TemplateResult,
    sidePanel?: TemplateResult
  ) {
    this.name = name;
    this.value = value;
    if (hotkey) {
      this.hotkey = hotkey;
    }

    if (this.action) {
      this.action = action;
    }

    if (position) {
      this.position = position;
    }
    if (element) {
      this.element = element;
    }
    if (id) {
      this.id = id;
    } else {
      this.id = genShortID(6);
    }

    this.menuItems = menuItems;
    this.sidePanel = sidePanel;
  }
}

// Converted tab instances
export const OUTLINE_TAB = new Tab("Outline", "files");
export const SEARCH_TAB = new Tab("Search", "search");
export const EXTENSIONS_TAB = new Tab("Extensions", "puzzle");
export const VERSIONS_TAB = new Tab("Versions", "git");
export const OPEN_PANEL = new Tab(
  "Open Panel",
  "bookshelf",
  "",
  NEW_PANEL_EVENT
);
export const OPEN_SIDE_PANEL_TAB = new Tab(
  "Open Side Panel",
  "layout-text-sidebar",
  "",
  OPEN_SIDE_PANEL_EVENT,
  "right"
);
export const POMODORO_TAB = new Tab("Pomodoro", "stopwatch");
export const CALENDAR_TAB = new Tab("Calendar", "calendar-event");

export class TabsSingleton {
  // Initialized
  static leftTabs: Tab[] = [
    OUTLINE_TAB,
    SEARCH_TAB,
    EXTENSIONS_TAB,
    OPEN_PANEL,
    OPEN_SIDE_PANEL_TAB,
  ];

  static rightTabs: Tab[] = [POMODORO_TAB, CALENDAR_TAB, OPEN_SIDE_PANEL_TAB];

  static selectedLeftTab: Tab = OUTLINE_TAB;
  static selectedRightTab: Tab = POMODORO_TAB;
  // End Initialized

  constructor() {}

  static AddToLeftTabs(bagManager: BagManager, tab: Tab): boolean {
    const bag = TabsSingleton.GetTabsBag(bagManager);
    const tabs = bag?.get(LeftTabsKey) as Tab[];

    if (TabsSingleton.IsTabRegistered(bagManager, tab)) {
      return false;
    }

    tabs.push(tab);
    bag?.set(LeftTabsKey, tabs);

    this.UpdateTabsBag(bagManager);

    return true;
  }

  static IsTabRegistered(bagManager: BagManager, tab: Tab) {
    const tabsBag = TabsSingleton.GetTabsBag(bagManager);
    const leftTabs = tabsBag?.get(LeftTabsKey) as Tab[];
    const rightTabs = tabsBag?.get(RightTabsKey) as Tab[];

    // find tab, if it eixsts
    return (
      [...leftTabs, ...rightTabs].filter(
        (thisTab: Tab) => thisTab.id === tab.id
      )[0]?.name === tab.name
    );
  }

  static UpdateTabsBag(bagManager: BagManager) {
    localforage.setItem(
      TabsBagKey,
      bagManager.getBag<TabsBag>(TabsBagKey)?.export()
    );
  }

  // make
  static async InitializeTabsInBag(
    bagManager: BagManager
  ): Promise<Bag | undefined> {
    const tabsBag = bagManager.createBag<TabsBag>(TabsBagKey)!;

    let savedTabsContent = await localforage.getItem<Map<string, TabsBag>>(
      TabsBagKey
    );

    if (!savedTabsContent) {
      tabsBag?.set(LeftTabsKey, TabsSingleton.leftTabs);
      tabsBag?.set(RightTabsKey, TabsSingleton.rightTabs);
      tabsBag?.set(SelectedRightTabKey, TabsSingleton.selectedRightTab);
      tabsBag?.set(SelectedLeftTabKey, TabsSingleton.selectedLeftTab);
      localforage.setItem<Map<string, TabsBag>>(TabsBagKey, tabsBag.export());
    } else {
      tabsBag.populate(savedTabsContent);
    }

    return tabsBag;
  }

  static GetTabsBag(bagManager: BagManager): Bag<TabsBag> | undefined {
    const bag = bagManager.getBag<TabsBag>(TabsBagKey);

    return bag;
  }
}

export type TabsBag = Tab[] | Tab;
export const TabsBagKey = "tabs-bag-key";
export const LeftTabsKey = "left-tabs-key";
export const RightTabsKey = "right-tabs-key";
export const SelectedRightTabKey = "selected-right-tab-key";
export const SelectedLeftTabKey = "selected-left-tab-key";
