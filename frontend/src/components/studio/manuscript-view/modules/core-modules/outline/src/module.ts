import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { genShortID } from '../../../../../../../lib/model/util';
import { OutlineElement } from './outline-element';

export const outlineModule = new Module(
  DEFAULT_VERSION,
  'Outline',
  new Tab('Outline', 'files').setPosition('left').setOrder(1),
  genShortID(10),
  true,
  OutlineElement
);
