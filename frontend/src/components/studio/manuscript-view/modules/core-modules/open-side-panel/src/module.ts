import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { OPEN_SIDE_PANEL_EVENT } from '../../../../../../../lib/model/panel';

export const openSidePanelModule = new Module(
  DEFAULT_VERSION,
  'Open Side Panel',
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
