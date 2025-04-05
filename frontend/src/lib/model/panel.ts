import { PanelTab } from "../../components/studio/manuscript-view/panel/panel-element";

export const CLOSE_PANEL_EVENT = "close-panel-event";
export const SPLIT_PANEL_EVENT = "split-panel-event";
export const PANEL_CONSTRUCTION_EVENT = "panel-construction-event";
export const OPEN_SIDE_PANEL_EVENT = "open-side-panel-event";
export const NEW_PANEL_EVENT = "new-panel-event";
export const IS_DRAGGING_TAB_EVENT = "is-dragging-tab-event";
export const NEW_TAB_EVENT = "new-tab-event";

export interface NewPanelTabEventType {
  panelID: string;
}

export interface SplitPanelEventType {
  panelID: string;
  tab: PanelTab;
  side: PanelDrop;
}

export enum PanelDrop {
  Left = "Left",
  Right = "Right",
  Center = "Center",
}

export interface IsDraggingTabEvent {
  tab: PanelTab;
  tabElement: Element;
  el: Element;
  hoveredTab: PanelTab | null;
  hoveredTabElement: Element | null;
  panelDrop: PanelDrop | null;
  fromPanel: string | null;
  toPanel: string | null;
}
