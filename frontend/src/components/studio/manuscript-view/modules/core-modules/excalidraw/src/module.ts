import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { genShortID } from '../../../../../../../lib/model/util';
import { ExcalidrawElement } from './excalidraw-element';

export const excalidrawModule = new Module(
  DEFAULT_VERSION,
  'Excalidraw',
  new Tab('Excalidraw', 'easel').setPosition('left').setOrder(8).removeTab(),
  genShortID(10),
  true,
  ExcalidrawElement
);
