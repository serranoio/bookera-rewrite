import { SlSelectEvent } from '@shoelace-style/shoelace';
import { html } from 'lit';
import { TabElement } from './tab-element';
import { sendEvent, sendGlobalEvent } from '../../../../../../lib/model/util';
import {
  RenderContentInSidePanelDrawerEvent,
  RenderContentInSidePanelDrawerType,
} from '../../side-panel-drawer/side-panel-drawer-element';
import {
  Module,
  RequestUpdateEvent,
  RequestUpdateEventType,
} from '../../../modules/module';
import { BookeraApi } from '../../../../../../lib/model/bookeraApi';
import {
  OpenSidePanelEventType,
  ToggleSidePanelEventType,
} from '../../../../../../lib/model/panel';

export const UpdateTabMenuEvent = 'update-menu-event';
export type HandleSelectType = (id: string) => void;

export interface MenuOption {
  id: string;
  name: string;
}

type DataMenuOption = Partial<MenuOption> & Record<string, any>;

function extractMenuOptionProperties(data: DataMenuOption): MenuOption {
  return {
    id: data.id!,
    name: data.name!,
  };
}

export function extractMenuOptions(data: DataMenuOption[]) {
  return data.map((d: DataMenuOption) => {
    return extractMenuOptionProperties(d);
  });
}

export type Conditional = 'ConditionalIcon' | 'ConditionalText';

export interface BookeraApiAction {
  type: ActionType;
  text: string;
  module: Module;
  bookeraApi: BookeraApi;
  sideEffects: () => void;
} // the name of the wc

export type ActionType = 'BookeraApi' | 'Action';

export interface StateAction<T> {
  eventHandler: (t: T) => void; // if the action needs to update state. ex: dark mode => light mode
  state: T; // current state ex: is dark mode?
  newState: T;
  conditional: Conditional;
  conditionalState: string;
  type: ActionType;
}

export type TabMenuAction<T> = BookeraApiAction | StateAction<T> | undefined; // to handle the empty state case

export interface UpdateTabMenuType<TabMenuActionType> {
  menuOptions: MenuOption[];
  selectedMenuOptions: MenuOption[]; // subset of menuOptions
  handleSelect: HandleSelectType;
  tabId: string;
  tabMenuActions: TabMenuAction<TabMenuActionType>[];
}
function isMenuOptionSelected(
  this: TabElement,
  menuOption: MenuOption
): boolean {
  for (let i = 0; i < this.selectedMenuOptions.length; i++) {
    if (this.selectedMenuOptions[i].id === menuOption.id) {
      return true;
    }
  }

  return false;
}

const renderConditional = (
  conditional: Conditional,
  conditionalState: string
) => {
  if (conditional === 'ConditionalIcon') {
    return html`<sl-icon-button name=${conditionalState}></sl-icon-button>`;
  }

  return html` ${conditionalState} `;
};

const renderAction = <T>(tabMenuAction: StateAction<T>) => {
  return html`
    <sl-menu-item
      @click=${() => {
        tabMenuAction.eventHandler(tabMenuAction.newState);
      }}
    >
      ${renderConditional(
        tabMenuAction.conditional,
        tabMenuAction.conditionalState
      )}
    </sl-menu-item>
  `;
};

function executeSideEffects(wc: BookeraApiAction) {
  if (wc.sideEffects) {
    sendEvent<RequestUpdateEventType>(document, RequestUpdateEvent, {
      moduleId: wc.module.id!,
    });

    wc.sideEffects();
  }
}

function renderWebComponent(this: TabElement, wc: BookeraApiAction) {
  switch (wc.bookeraApi) {
    case 'toggle-side-panel-event':
      return html`
        <sl-menu-item
          @click=${() => {
            executeSideEffects(wc);
            sendEvent<ToggleSidePanelEventType>(this, wc.bookeraApi, {
              position: this.tab.position,
              module: wc.module,
            });
          }}
        >
          ${wc.text}</sl-menu-item
        >
      `;
    case 'Other':
      return 'not yet implemented renderWebComponent()';
  }
}

function renderTabMenuActions(this: TabElement) {
  return html`${this.tabMenuActions.length > 0
    ? html`<sl-divider></sl-divider>`
    : ''}${this.tabMenuActions.map((tabMenuAction: TabMenuAction<any>) => {
    switch (tabMenuAction?.type) {
      case 'Action':
        return renderAction(tabMenuAction as StateAction<any>);
      case 'BookeraApi':
        return renderWebComponent.bind(this)(tabMenuAction as BookeraApiAction);
    }
  })}`;
}

export function renderTabMenu(this: TabElement) {
  return html`
    <div class=${`${this.panelBarPosition}-div`}>
      <sl-tooltip content="${this.tab.name!}">
        <sl-dropdown>
          <sl-icon-button
            @dblclick=${(e) => {
              e.stopPropagation();
            }}
            slot="trigger"
            data-value=${this.tab.value!}
            class="tab-button ${this.selectedTab?.value === this.tab.value
              ? 'active'
              : ''}"
            name=${this.tab.value!}
            >${this.tab.name}</sl-icon-button
          >
          <sl-menu
            @sl-select=${(e: SlSelectEvent) => {
              const id: string = e.detail.item.value;

              if (!id) return;

              this.handleSelect(id);
            }}
          >
            <div class="scrollable-menu">
              ${this.menuOptions.map((menuOption: MenuOption) => {
                return html`<sl-menu-item
                  value=${menuOption.id}
                  type="checkbox"
                  ?checked=${isMenuOptionSelected.bind(this)(menuOption)}
                  >${menuOption.name}</sl-menu-item
                >`;
              })}
            </div>
            ${renderTabMenuActions.bind(this)()}
          </sl-menu>
        </sl-dropdown>
      </sl-tooltip>
    </div>
  `;
}
