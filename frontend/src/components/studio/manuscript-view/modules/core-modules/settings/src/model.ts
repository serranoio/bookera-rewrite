export class Settings {
  constructor() {}
}

export class SettingsState {
  static settings: Settings = new Settings();
}

export const SettingsKey = 'panel-settings-key';
