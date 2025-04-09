import {
  LitElement,
  html,
  css,
  PropertyValueMap,
  PropertyValues,
  TemplateResult,
} from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import themeSwitcherElementStyles from './theme-switcher-element.styles';
import base from '../../../../../../lib/stylesheets/base';

export type RenderMode = 'renderInPanel' | '';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/color-picker/color-picker.js';
import {
  BaseColor,
  ColorSet,
  ColorSets,
  PrimaryColor,
  SystemColorSets,
  baseColorNames,
  primaryColorName,
  shadePercents,
} from './color-sets';

export type ColorMode = 'Light' | 'Dark';

import { SlColorPicker, SlMenuItem, SlSelect } from '@shoelace-style/shoelace';
import {
  Tab,
  TabsSingleton,
  UPDATE_TAB_EVENT,
} from '../../../../../../lib/model/tab';
import { Bag, BagManager, CreateBagManager } from '@pb33f/saddlebag';
import { notify } from '../../../../../../lib/model/lit';
import {
  ColorPalette,
  ColorPalettesKey,
  ColorPalettesSingleton,
  CustomColorPalette,
  Mode,
  SelectedColorPaletteKey,
  SystemColorPalette,
} from './stateful';
import {
  doesClickContainElement,
  sendEvent,
} from '../../../../../../lib/model/util';
import {
  _handleSelectInternals,
  enableCreateColorPaletteMode,
  handleCustomPaletteForm,
  handleSelectColorPalette,
  handleSelectColorPaletteFromId,
  handleSubmitSystemColorPalette,
  selectPrimaryColor,
  selectSystemColor,
  switchCustomPaletteStep,
} from './logic-layer';
import './dark-mode';
import { DarkMode } from './dark-mode';
import { DarkModeKey, DarkModeSingleton } from './dark-mode-state';
import {
  UpdateTabMenuEvent,
  UpdateTabMenuType,
} from '../../../side-panel/panel-bar-element/tab-element/tab-element';
import {
  Module,
  UPDATE_MODULE_EVENT,
  UPDATE_MODULE_EVENT_TYPE,
} from '../../module';
import { DEFAULT_VERSION } from '../../core-modules';
import { ModuleRegistry } from '../../registry';

// you need to rethink how dark theme works.
// when applying dark theme, you are swapping the colors. It breaks switching data-themes.

// I think I can get all of the colors in their palettes as code.
// all I have to do is apply the swap version of the Colors

const CustomColorStepMode = {
  LightMode: 'Light mode',
  DarkMode: 'Dark mode',
} as const;

type CustomColorStep = keyof typeof CustomColorStepMode;
// the theme switcher should always have the same ID no matter what, across every single app
// the tab will follow
@customElement('theme-switcher-element')
export class ThemeSwitcherElement extends LitElement {
  static styles = [themeSwitcherElementStyles, base];

  @property() title: string = 'Theme Switcher';

  @property()
  module: Module;

  renderConfigurationView() {}

  @query('#color-selector') colorSelect!: SlSelect;

  @query('#primary-color-picker') primaryColorPicker!: SlColorPicker;

  @property()
  bagManager: BagManager = CreateBagManager(true);

  @state()
  renderMode: RenderMode;

  @property()
  primaryColor: string;

  @state()
  createColorPaletteMode: boolean = false;

  // only consume what I want from the singleton
  @state()
  colorPalettes: ColorPalette[] = [];

  @state()
  systemColorPaletteMode: boolean = false;

  @state()
  colorPalettesBag: Bag<ColorPalette>;

  @state()
  selectedColorPalette: ColorPalette | null = null;

  @state()
  customPaletteStep: CustomColorStep = 'LightMode';

  @state()
  lightMode!: Mode;

  @state()
  darkMode!: Mode;

  @state()
  darkModeElement!: DarkMode;

  @state()
  modeBag!: Bag<ColorMode>;

  constructor(renderMode: RenderMode, module: Module) {
    super();

    this.renderMode = renderMode;
    this.module = module;
    this.module.tab = Object.assign(new Tab(), this.module.tab);
    this.primaryColor = getComputedStyle(document.body).getPropertyValue(
      '--primary'
    );

    const bagManager = CreateBagManager(true);
    ColorPalettesSingleton.InitializeColorPalettesInBag(bagManager);

    this.colorPalettesBag = bagManager.getBag<ColorPalette>(ColorPalettesKey)!;
    this.colorPalettesBag?.onPopulated(this.onPopulated.bind(this));
    this.colorPalettesBag?.onAllChanges(this.onChange.bind(this));

    this.modeBag = bagManager.getBag<ColorMode>(DarkModeKey)!;
    this.changeCustomSteps();
  }

  private changeCustomSteps() {
    const mode = this.modeBag.get(DarkModeKey);
    this.customPaletteStep = mode === 'Light' ? 'LightMode' : 'DarkMode';
  }

  private onChange(key: string) {
    const newCP = this.colorPalettesBag.get(key)!;

    if (
      !this.colorPalettes.map((cp: ColorPalette) => cp.id).includes(newCP.id)
    ) {
      this.colorPalettes.push(this.colorPalettesBag.get(key)!);
    }
    if (key === SelectedColorPaletteKey) {
      this.selectedColorPalette = newCP;
    }

    this._updateTab();
    this.requestUpdate();
  }

  private onPopulated(colorPalettesBag: Map<string, ColorPalette> | undefined) {
    this.selectedColorPalette = colorPalettesBag?.get(SelectedColorPaletteKey)!;

    // remove selectedColorPalette key from all entries
    this.colorPalettes = Array.from(colorPalettesBag?.entries()!)
      .filter(([id, _]) => {
        return id !== SelectedColorPaletteKey;
      })
      .map(([_, colorPalette]) => {
        return colorPalette;
      });

    // ! tab has to render before we update it! maybe we should ask for it
    setTimeout(() => {
      this._updateTab();
    }, 100);

    this.requestUpdate();
  }

  private _updateTab() {
    sendEvent<UpdateTabMenuType<ColorPalette>>(this, UpdateTabMenuEvent, {
      menuOptions: this.colorPalettes,
      selectedMenuOptions: [this.selectedColorPalette],
      handleSelect: handleSelectColorPaletteFromId,
      tabId: this.module?.tab?.id!,
    });
  }

  renderThemeButton(trigger?: string) {
    if (trigger) {
      return html`
        <sl-icon-button name="palette" slot="trigger"> </sl-icon-button>
      `;
    }

    return html` <sl-icon-button name="palette"> </sl-icon-button> `;
  }

  private createSection(title: string, body: string) {
    return html`
      <h5 class="section-title">${title}</h5>
      <p class="body">${body}</p>
    `;
  }

  quickSettings() {
    return html`
      ${this.renderSelectedColorPalettes()}
      <sl-divider></sl-divider>
      <sl-menu-item>Open In Side Panel</sl-menu-item>
    `;
  }

  renderSideBar() {
    return html`
      <sl-dropdown>
        ${this.renderThemeButton('trigger')}
        <sl-menu> ${this.quickSettings()} </sl-menu>
      </sl-dropdown>
    `;
  }

  renderInSidePanel() {
    return this.renderInPanel();
  }

  private renderShades(
    name: string,
    shade: number,
    index: number,
    style: string,
    colorMode: ColorMode
  ) {
    // create name
    let newName = '';
    if (ColorSet.FixProperty(name) === 'slate') {
      newName =
        baseColorNames[index] !== ''
          ? baseColorNames[index]
          : `Shade ${name}-${shade}`;
    } else {
      newName =
        primaryColorName[index] !== ''
          ? primaryColorName[index]
          : `Shade ${name}-${shade}`;
    }

    return html`
      <div class="shade-group space-between">
        <label>${newName}</label>
        <sl-color-picker
          class="${name}-picker"
          data-theme=${colorMode}
          label="Select a color"
          value=${style}
          @sl-change=${(e: any) => {
            const value = e.target!.value;

            ColorSet.SetStyle(name, shade, value);
          }}
        ></sl-color-picker>
      </div>
    `;
  }

  private _configureModeForCustomPalette(color: ColorMode) {
    if (color === 'Light') {
      return this.customPaletteStep === 'LightMode' ? 'show' : '';
    }

    return this.customPaletteStep === 'DarkMode' ? 'show' : '';
  }

  private _renderFormButton() {
    let button;
    if (this.customPaletteStep === 'LightMode') {
      button = `Show Dark mode`;
    } else {
      button = `Show Light mode`;
    }

    return html`
      <div class="button-container space-between vertical">
        <sl-button @click=${switchCustomPaletteStep.bind(this)}
          >${button}</sl-button
        >
        <sl-button class="button-hundred" type="submit">Save</sl-button>
      </div>
    `;
  }

  // private _renderCustomPaletteStep(option1: string, option2: string) {
  //   const colorMode: ColorMode = DarkMode.GetColorMode()
  //   if (colorMode === "Light") {
  //     return option1
  //   }
  //   return option2
  // }

  private renderCustomPaletteSection() {
    if (!this.createColorPaletteMode) {
      return html`
        <sl-button @click=${enableCreateColorPaletteMode.bind(this)}
          >Create Color Palette</sl-button
        >
      `;
    }

    return html`
      <form @submit=${handleCustomPaletteForm.bind(this)}>
        <div class="color-palette-name">
          <label>Color Palette Name</label>
          <sl-input id="color-palette-name"></sl-input>
          <p>
            ${this.customPaletteStep === 'LightMode'
              ? 'Light Mode'
              : 'Dark Mode'}
            colors
          </p>
        </div>
        <div class="colors-box">
          <div
            class="colors space-between light ${this._configureModeForCustomPalette(
              'Light'
            )}"
          >
            <div class="color-column">
              <h6>Primary</h6>
              ${this.lightMode.primaryColors?.map(
                (style: string, i: number) => {
                  return this.renderShades(
                    PrimaryColor,
                    shadePercents[i],
                    i,
                    style,
                    'Light'
                  );
                }
              )}
            </div>

            <div class="color-column">
              <h6>${BaseColor}</h6>
              ${this.lightMode.baseColors?.map((style: string, i: number) => {
                return this.renderShades(
                  BaseColor,
                  shadePercents[i],
                  i,
                  style,
                  'Light'
                );
              })}
            </div>
          </div>
          <div
            class="colors space-between dark ${this._configureModeForCustomPalette(
              'Dark'
            )}"
          >
            <div class="color-column">
              <h6>Primary</h6>
              ${this.lightMode.primaryColors?.map(
                (style: string, i: number) => {
                  return this.renderShades(
                    PrimaryColor,
                    shadePercents[i],
                    i,
                    style,
                    'Dark'
                  );
                }
              )}
            </div>

            <div class="color-column">
              <h6>${BaseColor}</h6>
              ${this.lightMode.baseColors?.map((style: string, i: number) => {
                return this.renderShades(
                  BaseColor,
                  shadePercents[i],
                  i,
                  style,
                  'Dark'
                );
              })}
            </div>
          </div>
        </div>
        ${this._renderFormButton()}
      </form>
    `;
  }

  private renderSelectedColorPalettes() {
    return html`
      ${this.colorPalettes.map((colorPalette: ColorPalette) => {
        return html`<sl-menu-item
          class="${this.selectedColorPalette?.id === colorPalette.id
            ? 'selected-color-palette'
            : 'color-palette-item'}"
          value=${colorPalette.id}
        >
          ${colorPalette.name}
        </sl-menu-item> `;
      })}
    `;
  }
  // style colors inside

  renderInPanel() {
    return html`
      <div>
        <div class="title-box">
          ${this.renderThemeButton()}

          <h4>${this.title}</h4>
          <sl-tooltip content="Put quick theme switcher settings on sidebar">
            <sl-icon-button
              name="layout-sidebar"
              class="icon-button"
              @click=${() => {
                // ModuleRegistry.UpdateModule(this.module);
                const status = TabsSingleton.AddToLeftTabs(
                  this.bagManager,
                  this.module.tab!
                );
                if (status) {
                  this.module.tab?.appendTab();
                  sendEvent<UPDATE_MODULE_EVENT_TYPE>(
                    this,
                    UPDATE_MODULE_EVENT,
                    this.module
                  );
                  notify(
                    'Successfully inserted tab on left panel',
                    'success',
                    null,
                    3000
                  );
                } else {
                  notify(
                    `${this.title} already exists as a tab`,
                    'warning',
                    null,
                    3000
                  );
                }

                this.requestUpdate();
              }}
            ></sl-icon-button>
          </sl-tooltip>
        </div>
        ${this.createSection(
          'System Color Palettes',
          'Create from a system color palette'
        )}
        <form @submit=${handleSubmitSystemColorPalette.bind(this)}>
          <div class="column-layout">
            <div>
              <label>background</label>
              <sl-select
                id="color-selector"
                name="system-colors"
                @sl-change=${selectSystemColor.bind(this)}
              >
                ${Array.from(ColorSets.values()).map((colorSet: ColorSet) => {
                  return html`<sl-option value="${colorSet.name}"
                    >${colorSet.name}</sl-option
                  >`;
                })}
              </sl-select>
            </div>
            <div>
              <label>Primary</label>
              <sl-color-picker
                name="primary-color"
                value=${this.primaryColor}
                id="primary-color-picker"
                label="Select a color"
                @sl-change=${selectPrimaryColor.bind(this)}
              ></sl-color-picker>
            </div>
            <div>
              <label>Mode</label>
              <dark-mode></dark-mode>
            </div>
          </div>
          ${this.systemColorPaletteMode
            ? html`
                <div class="name-color-palette">
                  <label>Name your palette</label>
                  <sl-input name="name"></sl-input>
                </div>
                <sl-button type="submit" class="button-hundred">Save</sl-button>
              `
            : ''}
        </form>
        <section class="custom-palette-section">
          ${this.createSection(
            'Custom Palettes',
            'Create your own color palette & share with others!'
          )}
          ${this.renderCustomPaletteSection()}
        </section>
        <section class="select-palette-section">
          ${this.createSection(
            'Select Color Palettes!',
            'These color palettes will be in your quick selection list'
          )}
          <div
            class="color-palettes flex"
            @click=${handleSelectColorPalette.bind(this)}
          >
            ${this.renderSelectedColorPalettes()}
          </div>
        </section>
      </div>
    `;
  }

  render() {
    switch (this.renderMode) {
      case 'renderInPanel':
        return this.renderInPanel();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-switcher-element': ThemeSwitcherElement;
  }
}
