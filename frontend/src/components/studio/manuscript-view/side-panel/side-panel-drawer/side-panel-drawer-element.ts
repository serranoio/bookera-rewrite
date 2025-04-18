import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import {
  DEFAULT_DRAWER_WIDTH,
  OpenTabInSidePanel,
} from '../side-panel-element';
import sidePanelDrawerElementStyles from './side-panel-drawer-element.styles';
import base from '../../../../../lib/stylesheets/base';
import { PANEL_RESIZE_EVENT } from '../../panel/panel-handle/panel-handle-element';
import { PanelSide } from '../panel-bar-element/panel-bar-element';
import { sendEvent } from '../../../../../lib/model/util';
import { OUTLINE_TAB, Tab, TabPosition } from '../../../../../lib/model/tab';
import {
  CLOSE_SIDE_PANEL_EVENT,
  OPEN_SIDE_PANEL_EVENT,
  OpenSidePanelEventType,
  SWITCH_TOGGLE_SIDE_PANEL_EVENT,
  TOGGLE_SIDE_PANEL_EVENT,
  ToggleSidePanelEventType,
} from '../../../../../lib/model/panel';
import { render } from 'lit-element';
import { Module, ModuleRegistryClasses } from '../../modules/module';
import {
  ModuleConstructorSchema,
  ModuleRegistry,
} from '../../modules/registry';

@customElement('side-panel-drawer-element')
export class SidePanelDrawerElement extends LitElement {
  static styles = [sidePanelDrawerElementStyles, base];

  @state() _openDrawerWidth: number = 0;

  @state() _previousDrawerWidth: number = DEFAULT_DRAWER_WIDTH;

  @state() _closedDrawerWidth: number = 0;

  @query('.panel-container') panelContainer!: HTMLElement;

  @property() panelID: PanelSide = 'left';

  @state()
  _module!: Module | null;

  // @ts-ignore
  @query('.panel-container') panelContainer: HTMLElement;

  openDrawer() {}

  @property() isClicked: boolean = false;

  constructor() {
    super();
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    document.addEventListener(
      PANEL_RESIZE_EVENT,
      this.handlePanelResizeEvent.bind(this)
    );
    // @ts-ignore
    document.addEventListener(
      TOGGLE_SIDE_PANEL_EVENT,
      this.handleToggleSidePanel.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      SWITCH_TOGGLE_SIDE_PANEL_EVENT,
      this.handleSwitchToggleSidePanelEvent.bind(this)
    );
    // @ts-ignore
    document.addEventListener(
      OpenTabInSidePanel,
      this.handleTabOpenEvent.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      CLOSE_SIDE_PANEL_EVENT,
      this.handleToggleSidePanel.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      OPEN_SIDE_PANEL_EVENT,
      this.handleToggleSidePanel.bind(this)
    );

    this.panelContainer.style.width = `${this._openDrawerWidth}rem`;
    this.requestUpdate();
  }

  private isPanelClosed(): boolean {
    const panelWidth = this.panelContainer.getBoundingClientRect().width;
    // toggling side panel
    if (panelWidth > this._closedDrawerWidth) {
      return false;
    }
    return true;
  }

  private handleSwitchToggleSidePanelEvent(
    e: CustomEvent<ToggleSidePanelEventType>
  ) {
    if (this.eventMatchesThisPanel(e.detail.position)) {
      // if new module is this module
      if (this._module?.id === e.detail.module?.id) {
        if (this.isPanelClosed()) {
          this._module?.tab?.toggleTabInDrawer(true);
          this._openDrawerWidth = this._previousDrawerWidth;
        } else {
          this._module?.tab?.toggleTabInDrawer(false);
          this._openDrawerWidth = this._closedDrawerWidth;
        }
      } else {
        // when we switch to a new module, and there was one opened
        if (this._module) {
          this._module?.tab?.toggleTabInDrawer(false);
          ModuleRegistry.UpdateModule(this._module!);
        }

        this._module = Object.assign(new Module(), e.detail.module);

        if (this.isPanelClosed()) {
          this._openDrawerWidth = this._previousDrawerWidth;
        }

        this._module.tab?.toggleTabInDrawer(true);
      }

      if (this._module) {
        ModuleRegistry.UpdateModule(this._module);
      }

      this.panelContainer.style.width = `${this._openDrawerWidth}rem`;
    }
    this.requestUpdate();
  }

  private eventMatchesThisPanel(position: TabPosition): boolean {
    if (
      (this.panelID === 'left' && position === 'left') ||
      (this.panelID === 'right' && position === 'right')
    ) {
      return true;
    }
    return false;
  }

  handleToggleSidePanel(e: CustomEvent<ToggleSidePanelEventType>) {
    // get module
    if (this.eventMatchesThisPanel(e.detail.position)) {
      if (e.detail.module) {
        this._module = Object.assign(new Module(), e.detail.module);
      }

      // I can choose when the tab is selected...
      const panelWidth = this.panelContainer.getBoundingClientRect().width;

      // toggling side panel
      if (panelWidth === this._closedDrawerWidth) {
        this._openDrawerWidth = this._previousDrawerWidth;
      } else {
        this._openDrawerWidth = this._closedDrawerWidth;
        this._module?.tab?.toggleTabInDrawer(false);
        ModuleRegistry.UpdateModule(this._module!);
      }

      this.panelContainer.style.width = `${this._openDrawerWidth}rem`;
    }
  }

  handlePanelResizeEvent(e: any) {
    console.log('panel resize', 'empty');
    // this._previousDrawerWidth = e.detail.width;
  }

  handleCloseSidePanel(e: CustomEvent<any>) {
    console.log('close');
    if (this.eventMatchesThisPanel(e.detail.position)) {
      this._openDrawerWidth = this._closedDrawerWidth;

      this.panelContainer.style.width = `${this._openDrawerWidth}rem`;

      if (this._module && this._module.tab?.isToggledInDrawer) {
        this._module?.tab?.toggleTabInDrawer(false);
        console.log(
          this._module,
          'toggling...',
          this._module.tab?.isToggledInDrawer
        );
        ModuleRegistry.UpdateModule(this._module!);
        this.requestUpdate();
      }
    }
  }
  handleTabOpenEvent(e) {
    if (
      (this.panelID === 'left' && e.detail.panelID === 'left') ||
      (this.panelID === 'right' && e.detail.panelID === 'right')
    ) {
      this._openDrawerWidth =
        this._openDrawerWidth === this._closedDrawerWidth
          ? this._previousDrawerWidth
          : this._closedDrawerWidth;

      this.panelContainer.style.width = `${this._openDrawerWidth}rem`;

      this.requestUpdate();
    }
  }

  renderContent() {
    if (!this._module) {
      return html``;
    }

    // todo: fix this type, you will once you abstract the functionality you need!
    const el: ModuleConstructorSchema = new ModuleRegistryClasses[
      this._module.getConstructorType()
    ]('renderInSidePanel', this._module);

    return html`${el}`;
  }

  private displayContent() {
    if (!this.panelContainer) return;

    const width = getComputedStyle(this.panelContainer).width;

    if (width.includes('0')) {
      this.panelContainer.style.display = 'none';
    } else {
      this.panelContainer.style.display = 'block';
    }
  }

  private renderPanelBasedOnPanelId() {
    if (this.panelID === 'left') return html` ${this.renderContent()} `;
    return html`
      <slot name="top-spot"></slot>
      ${this.renderContent()}
    `;
  }

  renderExpandSideBarButton() {
    let iconName = 'chevron-double-right';
    if (
      this.panelContainer &&
      getComputedStyle(this.panelContainer).width.includes('0px')
    ) {
      iconName = 'chevron-double-left';
    }

    return html`
      <sl-icon-button
        name=${iconName}
        class="cool-expand-button ${this.panelID}"
        @click=${() => {
          sendEvent<ToggleSidePanelEventType>(
            this,
            SWITCH_TOGGLE_SIDE_PANEL_EVENT,
            {
              position: this.panelID,
              module: this._module,
            }
          );
        }}
      >
      </sl-icon-button>
    `;
  }

  render() {
    this.displayContent();

    return html`
      ${this.panelID === 'right' ? this.renderExpandSideBarButton() : ''}
      <div class="side-panel-drawer-element panel-container">
        ${this.renderPanelBasedOnPanelId()}

        <panel-handle-element
          .minimumWidth=${DEFAULT_DRAWER_WIDTH * 16}
          .parentElement=${this.panelContainer}
          .resetWidthOverride=${(DEFAULT_DRAWER_WIDTH - 4) * 16}
          .openDrawerWidth=${this._openDrawerWidth}
          .closedDrawerWidth=${this._closedDrawerWidth}
          ?left=${this.panelID === 'right' ? true : false}
          .panelID=${this.panelID}
          ?right=${this.panelID === 'left' ? true : false}
        ></panel-handle-element>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'side-panel-drawer-element': SidePanelDrawerElement;
  }
}
