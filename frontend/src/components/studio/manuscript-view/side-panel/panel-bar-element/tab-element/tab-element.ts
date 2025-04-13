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
import { sendEvent, sendGlobalEvent } from '../../../../../../lib/model/util';
import {
  TOGGLE_SIDE_PANEL_EVENT,
  ToggleSidePanelEventType,
} from '../../../../../../lib/model/panel';
import {
  Module,
  UPDATE_MODULE_EVENT,
  UPDATE_MODULE_EVENT_TYPE,
} from '../../../modules/module';
import { ModuleRegistry } from '../../../modules/registry';

export const AskModuleForStateEvent = 'ask-module-for-state-event';

@customElement('tab-element')
export class TabElement extends LitElement {
  static styles = [base];

  @property()
  tab!: Tab;

  @property()
  selectedTab: Tab | null = null;

  @property()
  panelBarPosition!: PanelBarPosition;

  @state()
  _module!: Module;

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  constructor() {
    super();
  }
  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.tab = Object.assign(new Tab(), this.tab);

    if (this.tab.tabType === 'Menu') {
      sendEvent(this, AskModuleForStateEvent);
    }
  }

  render() {
    return html`
      <div class=${`${this.panelBarPosition}-div`}>
        <sl-tooltip content="${this.tab.name}">
          <sl-icon-button
            data-value=${this.tab.value}
            class="tab-button ${this.selectedTab?.value === this.tab.value
              ? 'active'
              : ''}"
            @click=${() => {
              this.tab.toggleTabInDrawer();

              const module = ModuleRegistry.GetModuleById(this.tab.id!);

              if (module) {
                module.tab = this.tab;
                sendGlobalEvent<UPDATE_MODULE_EVENT_TYPE>(
                  UPDATE_MODULE_EVENT,
                  module
                );

                sendEvent<ToggleSidePanelEventType>(
                  this,
                  TOGGLE_SIDE_PANEL_EVENT,
                  {
                    position: this.tab.position,
                    module: module,
                  }
                );
              } else {
                console.log('error: module not found');
              }
            }}
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
