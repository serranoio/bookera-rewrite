import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ColorMode } from './theme-switcher-element';
import { ColorSet } from './color-sets';
import base from '../../../../../../../lib/stylesheets/base';
import { Bag, BagManager, CreateBagManager } from '@pb33f/saddlebag';
import { DarkModeKey, DarkModeSingleton } from './dark-mode-state';
import {
  ColorPalette,
  ColorPalettesSingleton,
  SystemColorPalette,
} from './stateful';

@customElement('dark-mode')
export class DarkMode extends LitElement {
  static styles = [
    css`
      sl-icon-button {
        font-size: 28px;
      }
      sl-icon-button::part(base) {
        padding: 0;
        padding-right: var(--spacingSmall);
      }
    `,
    base,
  ];

  @state()
  bagManager!: BagManager;

  @state()
  bag!: Bag<ColorMode>;

  @property()
  colorMode!: ColorMode;

  @state()
  appliedMode: boolean = true;

  constructor() {
    super();

    this.bagManager = CreateBagManager(true);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.onchange = this.onMediaChange.bind(this);
    this.bag = DarkModeSingleton.InitializeModeInBag(this.bagManager, media);

    this.colorMode = this.bag.get(DarkModeKey)!;
    this.bag.onAllChanges(this.onChange.bind(this));

    // this is so gay
    setTimeout(() => {
      if (!this.appliedMode) return;

      this.applySelectedPallete();
      this.appliedMode = false;
    }, 100);
  }

  applySelectedPallete() {
    const selectedPalette = ColorPalettesSingleton.GetSelectedColorPalette(
      this.bagManager
    );

    ColorPalette.ApplyMode(selectedPalette, this.colorMode, true);
    ColorPalette.SelectColorPalette(selectedPalette, this.colorMode);
  }

  private onMediaChange(e: MediaQueryListEvent) {
    const matches = e.matches;
    if (matches) {
      this.colorMode = 'Dark';
    } else {
      this.colorMode = 'Light';
    }

    DarkModeSingleton.SetAppliedMode(this.colorMode);
  }

  private _switchColorMode() {
    this.colorMode = this.colorMode === 'Light' ? 'Dark' : 'Light';
    document.documentElement.setAttribute(
      'prefers-scheme',
      this.colorMode.toLowerCase()
    );
    this.requestUpdate();
    DarkModeSingleton.SetAppliedMode(this.colorMode);
  }

  static GetColorMode(): ColorMode {
    const bagManager = CreateBagManager(true);
    const bag = bagManager.getBag<ColorMode>(DarkModeKey)!;

    return bag.get(DarkModeKey)! as ColorMode;
  }

  onChange(key: string, value: ColorMode | undefined) {
    if (key === DarkModeKey) {
      this.colorMode = value as ColorMode;
      DarkMode.SetIconFromColorMode(this.colorMode);
    }
  }

  static SetIconFromColorMode(colorMode: ColorMode): 'moon' | 'sun' {
    return colorMode === 'Light' ? 'moon' : 'sun';
  }

  render() {
    return html`
      <sl-icon-button
        name=${DarkMode.SetIconFromColorMode(this.colorMode)}
        @click=${this._switchColorMode}
      >
      </sl-icon-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dark-mode': DarkMode;
  }
}
