import { LitElement, html, css, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PanelBarPosition } from '../../side-panel-element';
import base from '../../../../../../lib/stylesheets/base';
import tabElementStyles from './tab-element.styles';
import { Tab, UPDATE_TAB_EVENT } from '../../../../../../lib/model/tab';
import { BagManager } from '@pb33f/saddlebag';
import { SlSelect, SlSelectEvent } from '@shoelace-style/shoelace';
import {
  HandleSelectType,
  MenuOption,
  renderTabMenu,
  TabMenuAction,
  UpdateTabMenuEvent,
  UpdateTabMenuType,
} from './tabMenu';
import { sendEvent } from '../../../../../../lib/model/util';

export const AskModuleForStateEvent = 'ask-module-for-state-event';

@customElement('tab-element')
export class TabElement extends LitElement {
  static styles = [base];

  @property()
  tab!: Tab;

  @property()
  selectedTab: Tab | null = null;

  @state()
  menuOptions: MenuOption[] = [];

  @state()
  selectedMenuOptions: MenuOption[] = [];

  @state()
  handleSelect!: HandleSelectType;

  @state()
  tabMenuActions: TabMenuAction<any>[] = [];

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
  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.tab = Object.assign(new Tab(), this.tab);

    if (this.tab.tabType === 'Menu') {
      sendEvent(this, AskModuleForStateEvent);
    }
  }

  updateMenuEvent(e: CustomEvent<UpdateTabMenuType<TabMenuAction<any>>>) {
    if (e.detail.tabId !== this.tab.id) {
      return;
    }

    this.selectedMenuOptions = e.detail.selectedMenuOptions;
    this.menuOptions = e.detail.menuOptions;
    this.handleSelect = e.detail.handleSelect;
    this.tabMenuActions = e.detail.tabMenuActions;
    this.requestUpdate();
  }

  render() {
    if (this.menuOptions) {
      return renderTabMenu.bind(this)();
    }

    return html`
      <div class=${`${this.panelBarPosition}-div`}>
        <sl-tooltip content="${this.tab.name}">
          <sl-icon-button
            data-value=${this.tab.value}
            class="tab-button ${this.selectedTab?.value === this.tab.value
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
