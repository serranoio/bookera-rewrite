import { Tab } from '../../../../../../../lib/model/tab';
import { genShortID } from '../../../../../../../lib/model/util';
import { DEFAULT_VERSION, Module } from '../../../module';
import { ThemeSwitcherElement } from './theme-switcher-element';

export const themeSwitcherModule = new Module(
  DEFAULT_VERSION,
  'Theme Switcher',
  new Tab('Theme Switcher', 'palette', '', 'theme-switcher-element', 'left')
    .removeTab()
    .setTabType('Menu'),
  genShortID(10),
  true,
  ThemeSwitcherElement
);
