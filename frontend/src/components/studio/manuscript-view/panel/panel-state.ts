import { Bag, CreateBagManager } from '@pb33f/saddlebag';
import { PanelTab } from './panel-tab/panel-tab';
import localforage from 'localforage';
import { genShortID } from '../../../../lib/model/util';
import { Tab } from '../../../../lib/model/tab';

export class Panel {
  tabs?: PanelTab[];
  id?: string;
  width?: number;
  isFocused?: boolean;
  activeTabId?: string;

  static selectedTab = new PanelTab('New Tab', 'New');
  static panel1: Panel = new Panel(
    [this.selectedTab, new PanelTab('New Tab', 'New')],
    genShortID(10),
    300,
    true,
    this.selectedTab.id!
  );
  static selectedTab2 = new PanelTab('Settings', 'Settings');
  static panel2: Panel = new Panel(
    [this.selectedTab2, new PanelTab('New Tab', 'New')],
    genShortID(10),
    300,
    true,
    this.selectedTab2.id!
  );

  constructor(
    tabs?: PanelTab[],
    id?: string,
    width?: number,
    isFocused?: boolean,
    activeTabId?: string
  ) {
    this.tabs = tabs;
    this.id = id;
    if (!id) {
      this.id = genShortID(10);
    }

    this.width = width;
    this.isFocused = isFocused;
    this.activeTabId = activeTabId;
  }

  static UpdatePanel(panel: Panel) {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.createBag(PanelsKey)!;

    bag.set(panel.id!, panel);
    localforage.setItem(PanelsKey, bag.export());
  }

  static DeletePanel(panel: Panel) {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.createBag(PanelsKey)!;

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
