// anything under settings & extensions is a module.

import { genShortID } from '../../../../lib/model/util';
import { User } from '../../../../lib/model/user/author';
import { Tab } from '../../../../lib/model/tab';

// module API
export const UPDATE_MODULE_EVENT = 'update-module-event';
export type UPDATE_MODULE_EVENT_TYPE = Module;

// modules
export const ModuleRegistryClasses = {};

// extensions are just extended functionality from the core system, modules
export class Module {
  version?: string;
  title?: string;
  tab?: Tab;
  id?: string;
  hasSettings?: boolean;
  // * no id since there will always be one instance, of modules. They are not meant to be passed. But, there are versions.
  constructor(
    version?: string,
    title?: string,
    tab?: Tab,
    id?: string,
    hasSettings?: boolean,
    constructorType?: any
  ) {
    if (version) {
      this.version = version;
    }
    if (title) {
      this.title = title;
    }
    if (constructorType) {
      ModuleRegistryClasses[this.getConstructorType()] = constructorType;
    }

    if (tab) {
      this.tab = tab;
    }
    if (tab && id) {
      this.tab!.id = id;
    }

    if (id) {
      this.id = id;
    } else {
      this.id = genShortID(10);
    }

    if (hasSettings) {
      this.hasSettings = hasSettings;
    } else {
      this.hasSettings = false;
    }
  }

  getConstructorType() {
    return this.title?.replaceAll(' ', '').concat('Element');
  }

  setHasSettings(val: boolean): this {
    this.hasSettings = val;
    return this;
  }
}

export enum ExtensionPageTitle {
  Details = 'details',
  Features = 'features',
  Changelog = 'changelog',
}

export class ExtensionPage {
  title: ExtensionPageTitle;
  description: string;
  constructor(title: ExtensionPageTitle, description: string) {
    this.title = title;
    this.description = description;
  }
}

export class Extension extends Module {
  isPublished?: string;
  id?: string;
  isEnabled?: boolean;
  downloads?: number;
  user?: User;
  extensionPage?: ExtensionPage;
  constructor(
    version?: string,
    title?: string,
    tab?: Tab,
    id?: string,
    hasSettings?: boolean,
    constructorType?: string,
    isEnabled?: boolean,
    isPublished?: string,
    downloads?: number,
    user?: User,
    extensionPage?: ExtensionPage
  ) {
    super(version, title, tab, id, hasSettings, constructorType);
    this.isPublished = isPublished;
    if (id) {
      this.id = id;
    } else {
      this.id = genShortID(6);
    }

    this.isEnabled = isEnabled;
    this.downloads = downloads;
    this.user = user;
    this.extensionPage = extensionPage;
  }
}
