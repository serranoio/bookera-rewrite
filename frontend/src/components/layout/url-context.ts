import {createContext} from '@lit/context';
import type {Logger} from 'my-logging-library';
export type {Logger} from 'my-logging-library';
export const urlContext = createContext<string>('url');