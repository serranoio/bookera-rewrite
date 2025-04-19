import { Bag, CreateBagManager } from '@pb33f/saddlebag';
import localforage from 'localforage';
import { genShortID } from '../../../../lib/model/util';
import { Tab } from '../../../../lib/model/tab';
import { PanelContentElement } from './panel-content-element';
import { html, TemplateResult } from 'lit';
import { PanelElement } from './panel-element';

export const PanelTabs = {
  Settings: 'Settings',
  New: 'New',
  Module: 'Module',
  Undefined: 'Undefined',
} as const;
export type PanelTabType = keyof typeof PanelTabs;

export class PanelTab {
  name?: string;
  type?: PanelTabType;
  id?: string;

  constructor(name?: string, type?: PanelTabType, id?: string) {
    this.name = name;
    this.type = type;
    if (id) {
      this.id = id;
    } else {
      this.id = genShortID(6);
    }
  }

  static CreateNewPanel(panelTab: PanelTabType) {
    if (Object.keys(PanelTabs).includes(panelTab)) {
      return new PanelTab(panelTab, panelTab);
    }

    return new PanelTab('undefined', 'Undefined');
  }

  renderPanelContents(): TemplateResult {
    const panelContent = new PanelContentElement(this.type as PanelTabType);

    return html`${panelContent}`;
  }
}
export class Panel {
  tabs?: PanelTab[];
  id?: string;
  width?: number;
  isFocused?: boolean;
  activeTabId?: string;
  panelOrder?: number;

  static selectedTab = new PanelTab('New Tab', 'New');
  static panel1: Panel = new Panel(
    [this.selectedTab, new PanelTab('New Tab', 'New')],
    genShortID(10),
    300,
    true,
    this.selectedTab.id!,
    0
  );
  static selectedTab2 = new PanelTab('Settings', 'Settings');
  static panel2: Panel = new Panel(
    [this.selectedTab2, new PanelTab('New Tab', 'New')],
    genShortID(10),
    300,
    true,
    this.selectedTab2.id!,
    1
  );

  constructor(
    tabs?: PanelTab[],
    id?: string,
    width?: number,
    isFocused?: boolean,
    activeTabId?: string,
    panelOrder?: number
  ) {
    this.tabs = tabs;
    this.id = id;
    if (!id) {
      this.id = genShortID(10);
    }

    this.width = width;
    this.isFocused = isFocused;
    this.activeTabId = activeTabId;
    this.panelOrder = panelOrder;
  }

  static UpdatePanel(panel: Panel) {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.getBag(PanelsKey)!;

    const onlyUpdateExistingPanel = bag.get(panel.id!);

    if (onlyUpdateExistingPanel) {
      bag.set(panel.id!, panel);
    }

    localforage.setItem(PanelsKey, bag.export());
  }

  static AddPanel(panel: Panel) {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.getBag(PanelsKey)!;

    bag.set(panel.id!, panel);

    localforage.setItem(PanelsKey, bag.export());
  }

  static UpdatePanelOrderOnPanelCreation(panelElements: PanelElement[]) {
    // how to update order? match id's in the array of panels
    const bagManager = CreateBagManager(true);
    const bag = bagManager.getBag<Panel>(PanelsKey)!;

    for (let order = 0; order < panelElements.length; order++) {
      const panel = bag.get(panelElements[order].panelID!)!;
      panel.panelOrder = order;
      panelElements[order].panelOrder = order;
      bag.set(panel.id!, panel);
    }

    localforage.setItem(PanelsKey, bag.export());
  }

  static DeletePanel(panel: Panel) {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.getBag(PanelsKey)!;

    bag.export().delete(panel.id!);
    localforage.setItem(PanelsKey, bag.export());
  }

  static async InitiatlizePanelsInBag(): Promise<Bag | undefined> {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.createBag(PanelsKey);
    let savedContent = await localforage.getItem<Map<string, Panel>>(PanelsKey);

    if (!savedContent) {
      bag?.set(this.panel1.id!, this.panel1);
      bag?.set(this.panel2.id!, this.panel2);

      await localforage.setItem(PanelsKey, bag?.export());
    } else {
      bag?.populate(savedContent);
    }

    return bag;
  }
}

export const PanelsKey = 'panels-key';
