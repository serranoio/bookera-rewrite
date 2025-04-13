import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { genShortID } from '../../../../../../../lib/model/util';
import { SearchElement } from './search-element';

export const searchModule = new Module(
  DEFAULT_VERSION,
  'Search',
  new Tab('Search', 'search').setPosition('left').setOrder(2),
  genShortID(10),
  true,
  SearchElement
);
