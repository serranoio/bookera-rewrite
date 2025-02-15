import {
  BodyView,
  BookeraPlusView,
  FrontMatterView,
  OtherViews,
  StudioPageView,
  TypeSettingView,
} from "./context";

export const URL_EVENT_CHANGE = "url-event-change";

export const UPDATE_GRAPH_EVENT = "update-graph-event";

export const NEW_PANEL_EVENT = "new-panel-event";

export interface NewPanelEventType {
  type:
    | BookeraPlusView
    | FrontMatterView
    | TypeSettingView
    | BodyView
    | StudioPageView
    | OtherViews;
  name: string;
  id?: string;
  extraData?: any;
}

export type DragDropEventType = HTMLElement;
export const DRAG_DROP_EVENT = "drag-drop-event";
export const OPEN_OUTLINE_EVENT = "open-outline-event";
export const REMOVE_PANEL_EVENT = "remove-panel-event";

export const GET_COMPONENT_ID = "get-component-d";

export const SET_COMPONENT_ID = "set-component-id";

export const CHANGE_TITLE = "change-title";
