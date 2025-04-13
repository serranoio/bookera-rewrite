import { Tab } from '../../../../../../../lib/model/tab';
import { genShortID } from '../../../../../../../lib/model/util';
import { DEFAULT_VERSION, Module } from '../../../module';
import { ThemesElement } from './theme-switcher-element';

export const themeSwitcherModule = new Module(
  DEFAULT_VERSION,
  'Themes',
  new Tab('Themes', 'palette', '', 'themes-element', 'left').removeTab(),
  genShortID(10),
  true,
  ThemesElement
);
