import { NEW_PANEL_EVENT, OPEN_SIDE_PANEL_EVENT } from './panel';
import { genShortID } from './util';
import localforage from 'localforage';
import { TemplateResult } from 'lit';
import { Module } from '../../components/studio/manuscript-view/modules/module';
import { BagManager, CreateBagManager, Bag } from '@pb33f/saddlebag';

export const UPDATE_TAB_EVENT = 'update-tab-event';

export type TabType = 'Menu' | 'Action' | 'SidePanel' | 'Both';
// menu is for theme switcher
// side panel is for search
// action => opening the side panel

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
  private _isToggledInDrawer?: boolean;
  private _tabType?: TabType;
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
    isAppended?: boolean,
    tabType?: TabType,
    isToggledInDrawer?: boolean,
    module?: Module
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

    if (tabType) {
      this._tabType = tabType;
    } else {
      this._tabType = 'SidePanel';
    }

    if (isToggledInDrawer) {
      this._isToggledInDrawer = isToggledInDrawer;
    } else {
      this._isToggledInDrawer = false;
    }
  }

  toggleTabInDrawer(newState?: boolean) {
    if (newState !== undefined) {
      this._isToggledInDrawer = newState;
      return;
    }

    this._isToggledInDrawer = !this._isToggledInDrawer;
  }

  get isToggledInDrawer(): boolean {
    return this._isToggledInDrawer!;
  }

  setPosition(value: TabPosition): Tab {
    this._position = value;

    return this;
  }

  setTabType(value: TabType): Tab {
    this._tabType = value;

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

  get tabType(): TabType {
    return this._tabType!;
  }

  set tabType(value: TabType) {
    this._tabType = value;
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
