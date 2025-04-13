import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';

export const outlineModule = new Module(
  DEFAULT_VERSION,
  'Outline',
  new Tab('Outline', 'files').setPosition('left').setOrder(1)
);
