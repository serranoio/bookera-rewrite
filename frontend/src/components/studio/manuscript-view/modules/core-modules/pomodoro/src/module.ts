import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';

export const pomodoroModule = new Module(
  DEFAULT_VERSION,
  'Pomodoro',
  new Tab('Pomodoro', 'stopwatch').setPosition('right').setOrder(2)
);
