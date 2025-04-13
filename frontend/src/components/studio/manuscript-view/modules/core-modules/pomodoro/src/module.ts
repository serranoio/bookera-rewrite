import { Tab } from '../../../../../../../lib/model/tab';
import { DEFAULT_VERSION, Module } from '../../../module';
import { genShortID } from '../../../../../../../lib/model/util';
import { PomodoroElement } from './pomodoro-element';

export const pomodoroModule = new Module(
  DEFAULT_VERSION,
  'Pomodoro',
  new Tab('Pomodoro', 'stopwatch').setPosition('right').setOrder(2),
  genShortID(10),
  true,
  PomodoroElement
);
