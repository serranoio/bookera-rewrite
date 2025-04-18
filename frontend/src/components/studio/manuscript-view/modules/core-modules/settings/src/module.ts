import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { genShortID } from '../../../../../../../lib/model/util';
import { SettingsElement } from './settings';

export const settingsModule = new Module(
  DEFAULT_VERSION,
  'Settings',
  new Tab('Settings', 'layout-text-sidebar', '', 'right')
    .setPosition('right')
    .removeTab()
    .setOrder(1),
  genShortID(10),
  true,
  SettingsElement
);
