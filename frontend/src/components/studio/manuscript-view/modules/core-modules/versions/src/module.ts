import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';

export const versionsModule = new Module(
  DEFAULT_VERSION,
  'Versions',
  new Tab('Versions', 'git').setPosition('left').setOrder(4)
);
