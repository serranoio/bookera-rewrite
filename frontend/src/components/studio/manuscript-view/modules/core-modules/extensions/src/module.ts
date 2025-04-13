import { Tab } from '../../../../../../../lib/model/tab';
import { genShortID } from '../../../../../../../lib/model/util';
import { DEFAULT_VERSION, Module } from '../../../module';
import { ExtensionsElement } from './extensions-element';

export const extensionsModule = new Module(
  DEFAULT_VERSION,
  'Extensions',
  new Tab('Extensions', 'puzzle').setPosition('left').setOrder(3),
  genShortID(10),
  true,
  ExtensionsElement
);
