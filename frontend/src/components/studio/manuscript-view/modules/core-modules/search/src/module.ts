import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';

export const searchModule = new Module(
  DEFAULT_VERSION,
  'Search',
  new Tab('Search', 'search').setPosition('left').setOrder(2)
);
