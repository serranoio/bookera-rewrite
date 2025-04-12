import {
  NEW_PANEL_EVENT,
  OPEN_SIDE_PANEL_EVENT,
} from '../../../../lib/model/panel';
import { Tab } from '../../../../lib/model/tab';
import { genShortID } from '../../../../lib/model/util';
import { Module } from './module';
import { ThemeSwitcherElement } from './modules/theme-switcher/theme-switcher-element';

// should the settings page be it's own module? Or is settings just all modules combined?

export const DEFAULT_VERSION = '0.0.1';

export const outlineModule = new Module(
  DEFAULT_VERSION,
  'Outline',
  new Tab('Outline', 'files').setPosition('left').setOrder(1)
);

export const searchModule = new Module(
  DEFAULT_VERSION,
  'Search',
  new Tab('Search', 'search').setPosition('left').setOrder(2)
);
export const extensionsModule = new Module(
  DEFAULT_VERSION,
  'Search',
  new Tab('Extensions', 'puzzle').setPosition('left').setOrder(3)
);
export const versionsModule = new Module(
  DEFAULT_VERSION,
  'Versions',
  new Tab('Versions', 'git').setPosition('left').setOrder(4)
);
export const openPanelModule = new Module(
  DEFAULT_VERSION,
  'Open Panel',
  new Tab('Open Panel', 'bookshelf', '', NEW_PANEL_EVENT)
    .setPosition('left')
    .setOrder(5)
);

export const openSidePanelModule = new Module(
  DEFAULT_VERSION,
  'Open Side panel',
  new Tab(
    'Open Side Panel',
    'layout-text-sidebar',
    '',
    OPEN_SIDE_PANEL_EVENT,
    'right'
  )
    .setPosition('right')
    .setOrder(1)
);

export const pomodoroModule = new Module(
  DEFAULT_VERSION,
  'Pomodoro',
  new Tab('Pomodoro', 'stopwatch').setPosition('right').setOrder(2)
);
export const calendarModule = new Module(
  DEFAULT_VERSION,
  'Calendar',
  new Tab('Calendar', 'calendar-event').setPosition('right').setOrder(3)
);

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
