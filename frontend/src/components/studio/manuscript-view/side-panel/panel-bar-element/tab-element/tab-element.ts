import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PanelBarPosition } from '../../side-panel-element';
import base from '../../../../../../lib/stylesheets/base';
import tabElementStyles from './tab-element.styles';
import { Tab, UPDATE_TAB_EVENT } from '../../../../../../lib/model/tab';
import { BagManager } from '@pb33f/saddlebag';
import { SlSelect, SlSelectEvent } from '@shoelace-style/shoelace';

export const UpdateTabMenuEvent = 'update-menu-event';
export interface UpdateTabMenuType<MenuOptionType = any> {
  menuOptions: MenuOptionType[];
  selectedMenuOptions: any[];
  handleSelect: any;
  tabId: string;
}

@customElement('tab-element')
export class TabElement extends LitElement {
  static styles = [base];

  @property()
  tab: Tab;

  @state()
  _selectedTab: Tab | null = null;

  @state()
  menuOptions: any[] = [];

  @state()
  selectedMenuOptions: any = [];

  @state()
  handleSelect: (id: string) => void;

  set selectedTab(value: Tab) {
    this._selectedTab = value;
  }

  @property()
  panelBarPosition!: PanelBarPosition;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  constructor() {
    super();

    // @ts-ignore
    document.addEventListener(
      UpdateTabMenuEvent,
      this.updateMenuEvent.bind(this)
    );
  }

  updateMenuEvent(e: CustomEvent<UpdateTabMenuType>) {
    if (e.detail.tabId !== this.tab.id) {
      return;
    }

    this.selectedMenuOptions = e.detail.selectedMenuOptions;
    this.menuOptions = e.detail.menuOptions;
    this.handleSelect = e.detail.handleSelect;
    console.log(this.menuOptions);
    this.requestUpdate();
  }

  render() {
    console.log(this.menuOptions);
    if (this.menuOptions) {
      return html`
        <div class=${`${this.panelBarPosition}-div`}>
          <sl-tooltip content="${this.tab.name!}">
            <sl-dropdown>
              <sl-icon-button
                slot="trigger"
                data-value=${this.tab.value!}
                class="tab-button ${this._selectedTab?.value === this.tab.value
                  ? 'active'
                  : ''}"
                name=${this.tab.value!}
                >${this.tab.name}</sl-icon-button
              >
              <sl-menu
                @sl-select=${(e: SlSelectEvent) => {
                  const id: string = e.detail.item.value;

                  this.handleSelect(id);
                }}
              >
                ${this.menuOptions.map((menuOption) => {
                  return html`<sl-menu-item value=${menuOption.id}
                    >${menuOption.name}</sl-menu-item
                  >`;
                })}
              </sl-menu>
            </sl-dropdown>
          </sl-tooltip>
        </div>
      `;
    }

    return html`
      <div class=${`${this.panelBarPosition}-div`}>
        <sl-tooltip content="${this.tab.name}">
          <sl-icon-button
            data-value=${this.tab.value}
            class="tab-button ${this._selectedTab?.value === this.tab.value
              ? 'active'
              : ''}"
            name=${this.tab.value}
            >${this.tab.name}</sl-icon-button
          >
        </sl-tooltip>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tab-element': TabElement;
  }
}
