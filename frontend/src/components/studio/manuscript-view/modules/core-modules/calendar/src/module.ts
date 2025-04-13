import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';

export const calendarModule = new Module(
  DEFAULT_VERSION,
  'Calendar',
  new Tab('Calendar', 'calendar-event').setPosition('right').setOrder(3)
);
