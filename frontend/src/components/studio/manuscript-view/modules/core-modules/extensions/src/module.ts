import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';

export const extensionsModule = new Module(
  DEFAULT_VERSION,
  'Extensions',
  new Tab('Extensions', 'puzzle').setPosition('left').setOrder(3)
);
