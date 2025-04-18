import { Tab } from '../../../../../../../lib/model/tab';
import { genShortID } from '../../../../../../../lib/model/util';
import { DEFAULT_VERSION, Module } from '../../../module';
import { CalendarElement } from './calendar-element';

export const calendarModule = new Module(
  DEFAULT_VERSION,
  'Calendar',
  new Tab('Calendar', 'calendar-event').setPosition('right').setOrder(3),
  genShortID(10),
  true,
  CalendarElement
);
