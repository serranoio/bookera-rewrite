import { BagManager, Bag, CreateBagManager } from '@pb33f/saddlebag';
import localforage from 'localforage';
import { Module, ModuleRegistryClasses, UPDATE_MODULE_EVENT } from './module';
import { ColorPalettesKey } from './modules/theme-switcher/stateful';
import {
  calendarModule,
  extensionsModule,
  openPanelModule,
  openSidePanelModule,
  outlineModule,
  pomodoroModule,
  searchModule,
  themeSwitcherModule,
  versionsModule,
} from './core-modules';
import { z } from 'zod';
import { RenderMode } from './modules/theme-switcher/theme-switcher-element';
import { Tab, TabPosition } from '../../../../lib/model/tab';

export type ModuleConstructorSchema = (
  renderMode: RenderMode,
  module: Module
) => void;
// z.object({

// })

export class ModuleRegistry {
  static coreModules = [
    outlineModule,
    searchModule,
    extensionsModule,
    versionsModule,
    openPanelModule,
    themeSwitcherModule,
    openSidePanelModule,
    pomodoroModule,
    calendarModule,
  ];

  constructor() {
    // @ts-ignore
    document.addEventListener(
      UPDATE_MODULE_EVENT,
      ModuleRegistry.UpdateModuleEvent.bind(this)
    );
  }

  static NewExtension() {}

  static setLF(moduleBag: Bag<Module>) {
    localforage.setItem<Map<string, Module>>(
      ModuleRegistryKey,
      moduleBag.export()!
    );
  }

  static UpdateModule(module: Module) {
    const registryBag = ModuleRegistry.GetModuleBag();
    registryBag.set(module.id!, module);

    ModuleRegistry.setLF(registryBag);
  }

  static UpdateModuleEvent(moduleEvent: CustomEvent<Module>) {
    const registryBag = ModuleRegistry.GetModuleBag();
    const module = moduleEvent.detail;
    registryBag.set(module.id!, module);

    ModuleRegistry.setLF(registryBag);
  }

  static GetModuleBag(): Bag<Module> {
    const bagManager = CreateBagManager(true);
    return bagManager.getBag<Module>(ModuleRegistryKey)!;
  }

  static GetModulesInSettings(bag: Map<string, Module>) {
    return Array.from(bag.values()).filter((module: Module) => {
      return module.hasSettings;
    });
  }

  // * called after onPopulated
  static GetTabsWithPosition(
    bag: Map<string, Module>,
    position: TabPosition
  ): Tab[] {
    return Array.from(bag.values())
      .filter((module: Module) => {
        module.tab = Object.assign(new Tab(), module.tab);
        module = Object.assign(new Module(), module);

        if (!module.tab?.isAppended) return false;

        if (module.tab?.position === position) {
          return true;
        }

        return false;
      })
      .map((module: Module) => module.tab!);
  }

  static async InitializeModulesInBag(
    bagManager: BagManager
  ): Promise<Bag | undefined> {
    const registryBag = bagManager.createBag<Module>(ModuleRegistryKey)!;

    new ModuleRegistry();
    let savedModules = await localforage.getItem<Map<string, Module>>(
      ModuleRegistryKey
    );

    if (!savedModules) {
      ModuleRegistry.coreModules.map((module: Module) => {
        registryBag.set(module.id!, module);
      });
      ModuleRegistry.setLF(registryBag);
    } else {
      registryBag.populate(savedModules);
    }

    return registryBag;
  }
}

export const ModuleRegistryKey = 'registry-key';
