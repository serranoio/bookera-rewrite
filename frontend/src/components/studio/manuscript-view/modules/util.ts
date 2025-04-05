import { Tab } from "../../../../lib/model/tab";

export const SendSettingToSidebarEvent = "send-setting-to-sidebar";

export interface SendSettingsToSidebarType {
  tab: Tab;
}
