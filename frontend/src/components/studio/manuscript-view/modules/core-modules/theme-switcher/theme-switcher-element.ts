import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import themeSwitcherElementStyles from "./theme-switcher-element.styles";
import base from "../../../../../../lib/stylesheets/base";

export type RenderMode = "renderInPanel" | "";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/color-picker/color-picker.js";
import {
  BaseColor,
  ColorSet,
  ColorSets,
  PrimaryColor,
  SystemColorSets,
  baseColorNames,
  primaryColorName,
  shadePercents,
} from "./color-sets";

export type ColorMode = "Light" | "Dark";

import {
  SlChangeEvent,
  SlColorPicker,
  SlInput,
  SlMenuItem,
  SlSelect,
} from "@shoelace-style/shoelace";
import { Tab, TabsSingleton } from "../../../../../../lib/model/tab";
import { Bag, BagManager, CreateBagManager } from "@pb33f/saddlebag";
import { notify } from "../../../../../../lib/model/lit";
import {
  ColorPalette,
  ColorPalettesKey,
  ColorPalettesSingleton,
  CustomColorPalette,
  SystemColorPalette,
} from "./stateful";
import { doesClickContainElement } from "../../../../../../lib/model/util";

// you need to rethink how dark theme works.
// when applying dark theme, you are swapping the colors. It breaks switching data-themes.

// I think I can get all of the colors in their palettes as code.
// all I have to do is apply the swap version of the Colors

// the theme switcher should always have the same ID no matter what, across every single app
// the tab will follow
@customElement("theme-switcher-element")
export class ThemeSwitcherElement extends LitElement {
  static styles = [themeSwitcherElementStyles, base];

  @property() title: string = "Theme Switcher";

  renderConfigurationView() {}

  @query("#color-selector") colorSelect!: SlSelect;

  @query("#primary-color-picker") primaryColorPicker!: SlColorPicker;

  @property()
  bagManager: BagManager = CreateBagManager(true);

  @state()
  renderMode: RenderMode;

  @state()
  tab: Tab = new Tab(
    this.title,
    "palette",
    "",
    "theme-switcher-element",
    "left"
  );

  @property()
  primaryColor: string;

  @property()
  colorMode: ColorMode = "Light";

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

  constructor(renderMode: RenderMode) {
    super();

    this.renderMode = renderMode;

    this.primaryColor = getComputedStyle(document.body).getPropertyValue(
      "--primary"
    );

    const bagManager = CreateBagManager(true);
    ColorPalettesSingleton.InitializeColorPalettesInBag(bagManager);

    this.colorPalettesBag = bagManager.getBag<ColorPalette>(ColorPalettesKey)!;
    this.colorPalettesBag?.onPopulated(this.onPopulated.bind(this));
    this.colorPalettesBag?.onAllChanges(this.onChange.bind(this));
  }

  private onChange(e: string) {
    this.colorPalettes.push(this.colorPalettesBag.get(e)!);
    this.requestUpdate();
  }

  private onPopulated(colorPalettesBag: Map<string, ColorPalette> | undefined) {
    this.colorPalettes = Array.from(colorPalettesBag?.values()!);

    this.requestUpdate();
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
        ${this.renderThemeButton("trigger")}
        <sl-menu> ${this.quickSettings()} </sl-menu>
      </sl-dropdown>
    `;
  }

  renderInSidePanel() {
    return this.renderInPanel();
  }

  private renderColorMode() {
    return html`
      <sl-icon-button
        name=${this.colorMode === "Light" ? "moon" : "sun"}
        @click=${() => {
          this.colorMode = this.colorMode === "Light" ? "Dark" : "Light";

          ColorSet.SwapModes();
        }}
      >
      </sl-icon-button>
    `;
  }

  private renderShades(name: string, shade: number, index: number) {
    // compute style
    const style = getComputedStyle(document.body).getPropertyValue(
      `--${ColorSet.FixProperty(name)}-${shade}`
    );

    // create name
    let newName = "";
    if (ColorSet.FixProperty(name) === "slate") {
      newName =
        baseColorNames[index] !== ""
          ? baseColorNames[index]
          : `Shade ${name}-${shade}`;
    } else {
      newName =
        primaryColorName[index] !== ""
          ? primaryColorName[index]
          : `Shade ${name}-${shade}`;
    }

    return html`
      <div class="shade-group space-between">
        <label>${newName}</label>
        <sl-color-picker
          class="${name}-picker"
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
  private renderCustomPaletteSection() {
    if (!this.createColorPaletteMode) {
      return html`
        <sl-button
          @click=${() => {
            this.createColorPaletteMode = true;
          }}
          >Create Color Palette</sl-button
        >
      `;
    }
    return html`
      <form
        @submit=${(e: Event) => {
          e.preventDefault();
          const canSave = (allValues: string[]): boolean => {
            if (allValues.includes("")) {
              notify("Please fill in all colors!", "warning", null);
              return false;
            }

            return true;
          };

          const primaryValues: string[] = [];
          for (const node of this.shadowRoot?.querySelectorAll(
            `.${PrimaryColor}-picker`
          )!) {
            // if one value is not shown, don't save it
            primaryValues.push((node as HTMLInputElement).value);
          }
          const baseColors: string[] = [];
          for (const node of this.shadowRoot?.querySelectorAll(
            `.${BaseColor}-picker`
          )!) {
            // if one value is not shown, don't save it
            baseColors.push((node as HTMLInputElement).value);
          }

          // verification
          if (!canSave(primaryValues) || !canSave(baseColors)) {
            return;
          }
          const name = (this.shadowRoot?.querySelector(
            "#color-palette-name"
          ) as HTMLInputElement)!.value;
          if (name.length === 0) {
            notify(`Please select a name!`, "warning", "");
            return;
          }

          const newPalette = new CustomColorPalette(
            primaryValues,
            baseColors,
            name
          );

          notify(`new color palette ${name} added 💅`, "success", "");
          this.createColorPaletteMode = false;
          ColorPalettesSingleton.NewColorPalette(this.bagManager, newPalette);
        }}
      >
        <div class="color-palette-name">
          <label>Color Palette Name</label>
          <sl-input id="color-palette-name"></sl-input>
        </div>
        <div class="colors space-between">
          <div class="color-column">
            <h6>Primary</h6>
            ${shadePercents.map((shade: number, i: number) => {
              return this.renderShades(PrimaryColor, shade, i);
            })}
          </div>
          <div class="color-column">
            <h6>${BaseColor}</h6>
            ${shadePercents.map((shade: number, i: number) => {
              return this.renderShades(BaseColor, shade, i);
            })}
          </div>
        </div>
        <sl-button class="button-hundred" type="submit">Save</sl-button>
      </form>
    `;
  }

  private renderSelectedColorPalettes() {
    return html`
      ${this.colorPalettes.map((colorPalette: ColorPalette) => {
        return html`<sl-menu-item
          class="${this.selectedColorPalette?.id === colorPalette.id
            ? "selected-color-palette"
            : ""}"
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
                const status = TabsSingleton.AddToLeftTabs(
                  this.bagManager,
                  this.tab
                );
                if (status) {
                  notify(
                    "Successfully inserted tab on left panel",
                    "success",
                    null,
                    3000
                  );
                } else {
                  notify(
                    `${this.title} already exists as a tab`,
                    "warning",
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
          "System Color Palettes",
          "Create from a system color palette"
        )}
        <form
          @submit=${(e: SubmitEvent) => {
            e.preventDefault();
            const form = new FormData(e.target);

            const systemColors = form.get("system-colors")!;
            const name = form.get("name")!;
            const primaryColor = form.get("primary-color")!;

            const newPalette = new SystemColorPalette(
              systemColors as SystemColorSets,
              primaryColor as string,
              name as string
            );
            ColorPalettesSingleton.NewColorPalette(this.bagManager, newPalette);
            this.systemColorPaletteMode = false;
          }}
        >
          <div class="column-layout">
            <div>
              <label>background</label>
              <sl-select
                id="color-selector"
                name="system-colors"
                @sl-change=${() => {
                  const val = this.colorSelect.value as string;
                  ColorSets.get(val)?.applyColorWithMode(this.colorMode);
                  this.systemColorPaletteMode = true;
                }}
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
                @sl-change=${() => {
                  this.systemColorPaletteMode = true;
                  ColorSet.SetPrimaryColor(this.primaryColorPicker.value);
                }}
              ></sl-color-picker>
            </div>
            <div>
              <label>Mode</label>
              ${this.renderColorMode()}
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
            : ""}
        </form>
        <section class="custom-palette-section">
          ${this.createSection(
            "Custom Palettes",
            "Create your own color palette & share with others!"
          )}
          ${this.renderCustomPaletteSection()}
        </section>
        <section class="select-palette-section">
          ${this.createSection(
            "Select Color Palettes!",
            "These color palettes will be in your quick selection list"
          )}
          <div
            class="color-palettes"
            @click=${(e: Event) => {
              const el = doesClickContainElement<SlMenuItem>(e, {
                nodeName: "SL-MENU-ITEM",
              });
              if (!el) {
                return;
              }

              const id = el.value;
              if (this.selectedColorPalette?.id === id) {
                notify("Resetting color palette to default", "neutral", "");
                this.selectedColorPalette = null;
              } else {
                this.selectedColorPalette = this.colorPalettes.find(
                  (colorPalette: ColorPalette) => colorPalette.id === id
                )!;
                console.log(
                  this.selectedColorPalette,
                  typeof this.selectedColorPalette
                );

                ColorPalette.SelectColorPalette(
                  this.selectedColorPalette,
                  this.colorMode
                );
              }

              this.requestUpdate();
            }}
          >
            ${this.renderSelectedColorPalettes()}
          </div>
        </section>
      </div>
    `;
  }

  firstUpdated() {
    this.tab.menuItems = this.quickSettings();
  }

  render() {
    switch (this.renderMode) {
      case "renderInPanel":
        return this.renderInPanel();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "theme-switcher-element": ThemeSwitcherElement;
  }
}
