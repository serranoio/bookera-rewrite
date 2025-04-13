import { Tab } from '../../../../../../../lib/model/tab';
import { genShortID } from '../../../../../../../lib/model/util';
import { DEFAULT_VERSION, Module } from '../../../module';
import { VersionsElement } from './versions-element';

export const versionsModule = new Module(
  DEFAULT_VERSION,
  'Versions',
  new Tab('Versions', 'git').setPosition('left').setOrder(4),
  genShortID(10),
  true,
  VersionsElement
);
