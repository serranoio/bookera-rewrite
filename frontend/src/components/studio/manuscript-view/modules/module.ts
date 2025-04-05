// anything under settings & extensions is a module.

import { Bag, BagManager } from "@pb33f/saddlebag";
import { genShortID } from "../../../../lib/model/util";
import localforage from "localforage";
import {
  ColorPalette,
  ColorPalettesKey,
} from "./core-modules/theme-switcher/stateful";
import { User } from "../../../../lib/model/user/author";

// modules

// extensions are just extended functionality from the core system, modules
export class Module {
  version?: string;
  title?: string;
  // * no id since there will always be one instance, of modules. They are not meant to be passed. But, there are versions.
  constructor(version?: string, title?: string) {
    if (this.version) {
      this.version = version;
    }
    if (this.title) {
      this.title = title;
    }
  }
}

export enum ExtensionPageTitle {
  Details = "details",
  Features = "features",
  Changelog = "changelog",
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
    isEnabled?: boolean,
    isPublished?: string,
    downloads?: number,
    user?: User,
    extensionPage?: ExtensionPage,
    id?: string
  ) {
    super(version, title);
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

export class ModuleSingleton {
  constructor() {}

  static NewModule() {}

  static async InitializeModulesInBag(
    bagManager: BagManager
  ): Promise<Bag | undefined> {
    const modulesBag = bagManager.createBag<Module>(ColorPalettesKey)!;

    let savedModules = await localforage.getItem<Map<string, Module>>(
      ModuleKey
    );

    if (!savedModules) {
    } else {
      modulesBag.populate(savedModules);
    }

    return modulesBag;
  }
}

export const ModuleKey = "module-key";
