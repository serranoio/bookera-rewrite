import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { NEW_PANEL_EVENT } from '../../../../../../../lib/model/panel';

export const openPanelModule = new Module(
  DEFAULT_VERSION,
  'Open Panel',
  new Tab('Open Panel', 'bookshelf', '', NEW_PANEL_EVENT)
    .setPosition('left')
    .setOrder(5)
);