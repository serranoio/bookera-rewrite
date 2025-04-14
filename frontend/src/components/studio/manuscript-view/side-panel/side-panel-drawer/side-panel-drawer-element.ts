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
      OpenTabInSidePanel,
      this.handleTabOpenEvent.bind(this)
    );

    // @ts-ignore
    document.addEventListener(
      CLOSE_SIDE_PANEL_EVENT,
      this.handleCloseSidePanel.bind(this)
    );

    this.panelContainer.style.width = `${this._openDrawerWidth}rem`;
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
      this._module = Object.assign(new Module(), e.detail.module);

      // I can choose when the tab is selected...

      const panelWidth = this.panelContainer.getBoundingClientRect().width;

      // toggling side panel
      if (panelWidth === this._closedDrawerWidth / 16) {
        this._openDrawerWidth = this._previousDrawerWidth;
      } else {
        this._openDrawerWidth = this._closedDrawerWidth;
      }

      this.panelContainer.style.width = `${this._openDrawerWidth}rem`;
    }
  }
  handlePanelResizeEvent(e: any) {
    console.log('panel resize');
    // this._previousDrawerWidth = e.detail.width;
  }

  handleCloseSidePanel(e: CustomEvent<any>) {
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

  render() {
    return html`
      <div class="side-panel-drawer-element panel-container">
        ${this.renderContent()}
        <slot name="top-spot"></slot>
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
        <!-- <div
          class="handle-box"
          @pointerdown=${() => {
          this.isClicked = true;
          console.log('hello');
        }}
          @pointerup=${() => {
          this.isClicked = false;
        }}
        >
          <div class="handle"></div>
        </div> -->
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'side-panel-drawer-element': SidePanelDrawerElement;
  }
}
