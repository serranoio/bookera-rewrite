import { Bag, BagManager } from "@pb33f/saddlebag";
import localforage from "localforage";
import { genShortID } from "../../../../../../lib/model/util";
import {
  BaseColor,
  ColorSet,
  ColorSets,
  PrimaryColor,
  SystemColorSets,
  shadePercents,
} from "./color-sets";
import { html } from "lit";
import { ColorMode } from "./theme-switcher-element";

export class ColorPalette {
  id?: string;
  name?: string;
  constructor(name?: string, id?: string) {
    this.name = name;

    if (id) {
      this.id = id;
    } else {
      this.id = genShortID(6);
    }
  }

  static WhichColorPalette(
    colorPalette: ColorPalette
  ): SystemColorPalette | CustomColorPalette {
    if (SystemColorPalette.IsSystemColorPalette(colorPalette)) {
      const cp: SystemColorPalette = colorPalette as SystemColorPalette;
      return new SystemColorPalette(
        cp.background,
        cp.primaryColor,
        cp.name,
        cp.id
      );
    }

    const cp: CustomColorPalette = colorPalette as CustomColorPalette;
    return new CustomColorPalette(
      cp.primaryColors,
      cp.baseColors,
      cp.name,
      cp.id
    );
  }

  static SelectColorPalette(colorPalette: ColorPalette, colorMode: ColorMode) {
    if (
      ColorPalette.WhichColorPalette(colorPalette) instanceof SystemColorPalette
    ) {
      SystemColorPalette.SelectColorPalette(colorPalette, colorMode);
    } else {
      CustomColorPalette.SelectColorPalette(colorPalette, colorMode);
    }
  }
}

export class SystemColorPalette extends ColorPalette {
  background?: SystemColorSets;
  primaryColor?: string;
  constructor(
    background?: SystemColorSets,
    primaryColor?: string,
    name?: string,
    id?: string
  ) {
    super(name, id);
    this.background = background;
    this.primaryColor = primaryColor;
  }

  static IsSystemColorPalette(colorPalette: ColorPalette): boolean {
    if ((colorPalette as SystemColorPalette).background) return true;

    return false;
  }

  static SelectColorPalette(colorPalette: ColorPalette, colorMode: ColorMode) {
    const sp = colorPalette as SystemColorPalette;
    ColorSets.get(sp.background!)?.applyColorWithMode(colorMode);
    ColorSet.SetPrimaryColor(sp.primaryColor!);
  }

  renderSystemColorPaletteInList() {
    return html` ${this.name} `;
  }
}

export class CustomColorPalette extends ColorPalette {
  primaryColors?: string[];
  baseColors?: string[];
  constructor(
    primaryColors?: string[],
    baseColors?: string[],
    name?: string,
    id?: string
  ) {
    super(name, id);
    this.primaryColors = primaryColors;
    this.baseColors = baseColors;
  }
  static SelectColorPalette(colorPalette: ColorPalette, colorMode: ColorMode) {
    const cp = colorPalette as CustomColorPalette;

    cp.primaryColors?.forEach((pc: string, num: number) => {
      ColorSet.SetStyle(PrimaryColor, shadePercents[num], pc);
    });

    cp.baseColors?.forEach((pc: string, num: number) => {
      ColorSet.SetStyle(BaseColor, shadePercents[num], pc);
    });
  }

  renderSystemColorPaletteInList() {
    return html` ${this.name} `;
  }
}

// the point of this is to have one universal API
export class ColorPalettesSingleton {
  constructor() {}

  static NewColorPalette(
    bagManager: BagManager,
    newColorPalette: ColorPalette
  ) {
    const bag = bagManager.getBag<ColorPalette>(ColorPalettesKey);

    bag?.set(newColorPalette.id!, newColorPalette);

    localforage.setItem(
      ColorPalettesKey,
      bagManager.getBag<ColorPalette>(ColorPalettesKey)?.export()
    );
  }

  static async InitializeColorPalettesInBag(
    bagManager: BagManager
  ): Promise<Bag | undefined> {
    const colorPalettesBag =
      bagManager.createBag<ColorPalette>(ColorPalettesKey)!;

    let savedTabsContent = await localforage.getItem<Map<string, ColorPalette>>(
      ColorPalettesKey
    );

    if (!savedTabsContent) {
    } else {
      colorPalettesBag.populate(savedTabsContent);
    }

    return colorPalettesBag;
  }
}

export const ColorPalettesKey = "color-palettes-key";
