import { Bag, BagManager } from '@pb33f/saddlebag';
import { NEW_PANEL_EVENT, OPEN_SIDE_PANEL_EVENT } from './panel';
import { genShortID } from './util';
import localforage from 'localforage';
import { TemplateResult } from 'lit';
import { Module } from '../../components/studio/manuscript-view/modules/module';

export const UPDATE_TAB_EVENT = 'update-tab-event';

export type TabPosition = 'left' | 'right';
export class Tab {
  name?: string;
  // this is the icon
  value?: string;
  hotkey?: string;
  _order?: number;
  // pressing this tab merely sends an event and does nothing more
  action?: string;
  // is this on the left bar or the right bar
  private _position?: TabPosition;
  private _isAppended?: boolean;
  // ! Tabs need to be registered. If there is a matching ID, then there cannot be duplicate names
  id?: string;
  constructor(
    name?: string,
    value?: string,
    hotkey?: string,
    action?: string,
    position?: 'left' | 'right',
    id?: string,
    order?: number,
    isAppended?: boolean
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
      this._position = position;
    }

    if (id) {
      this.id = id;
    } else {
      this.id = genShortID(6);
    }

    if (order) {
      this._order = order;
    }

    if (isAppended) {
      this._isAppended = isAppended;
    } else {
      this._isAppended = true;
    }
  }

  setPosition(value: TabPosition): Tab {
    this._position = value;

    return this;
  }

  setOrder(value: number): Tab {
    this._order = value;

    return this;
  }

  get order(): number {
    return this.order;
  }

  getPosition(): TabPosition {
    return this._position!;
  }

  set position(value: TabPosition) {
    this._position = value;
  }

  get position(): TabPosition {
    return this._position!;
  }

  get isAppended(): boolean {
    return this._isAppended!;
  }

  appendTab(): Tab {
    this._isAppended = true;
    return this;
  }

  removeTab(): Tab {
    this._isAppended = false;
    return this;
  }
}

// Converted tab instances
export const OUTLINE_TAB = new Tab('Outline', 'files');
export const SEARCH_TAB = new Tab('Search', 'search');
export const EXTENSIONS_TAB = new Tab('Extensions', 'puzzle');
export const VERSIONS_TAB = new Tab('Versions', 'git');
export const OPEN_PANEL = new Tab(
  'Open Panel',
  'bookshelf',
  '',
  NEW_PANEL_EVENT
);
export const OPEN_SIDE_PANEL_TAB = new Tab(
  'Open Side Panel',
  'layout-text-sidebar',
  '',
  OPEN_SIDE_PANEL_EVENT,
  'right'
);
export const POMODORO_TAB = new Tab('Pomodoro', 'stopwatch');
export const CALENDAR_TAB = new Tab('Calendar', 'calendar-event');

// ! should be initiatlized with Modules
export class TabsSingleton {
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

  static CreateBag(bagManager: BagManager) {
    bagManager.createBag<TabsBag>(TabsBagKey)!;
  }

  // make
  static async InitializeTabsInBag(
    bagManager: BagManager,
    moduleRegistryBag: Map<string, Module>
  ): Promise<Bag | undefined> {
    const tabsBag = TabsSingleton.GetTabsBag(bagManager)!;
    let savedTabsContent = await localforage.getItem<Map<string, TabsBag>>(
      TabsBagKey
    );

    if (!savedTabsContent) {
      const tabs = Array.from(moduleRegistryBag.values()).reduce(
        (acc: { leftTabs: Tab[]; rightTabs: Tab[] }, module: Module) => {
          const tab = Object.assign(new Tab(), module.tab);

          if (!tab.isAppended) return acc;

          if (tab?.position === 'left') {
            acc.leftTabs.push(tab);
          } else {
            acc.rightTabs.push(tab!);
          }
          return acc;
        },
        {
          leftTabs: [],
          rightTabs: [],
        }
      );

      tabsBag?.set(LeftTabsKey, tabs.leftTabs);
      tabsBag?.set(RightTabsKey, tabs.rightTabs);
      tabsBag?.set(SelectedRightTabKey, null);
      tabsBag?.set(SelectedLeftTabKey, null);
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

export type TabsBag = Tab[] | Tab | null;
export const TabsBagKey = 'tabs-bag-key';
export const LeftTabsKey = 'left-tabs-key';
export const RightTabsKey = 'right-tabs-key';
export const SelectedRightTabKey = 'selected-right-tab-key';
export const SelectedLeftTabKey = 'selected-left-tab-key';
