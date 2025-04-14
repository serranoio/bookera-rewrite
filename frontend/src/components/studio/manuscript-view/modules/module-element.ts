import { LitElement, html, css, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  Module,
  RequestUpdateEvent,
  RequestUpdateEventType,
  UPDATE_MODULE_EVENT,
  UPDATE_MODULE_EVENT_TYPE,
} from './module';
import { RenderMode } from './core-modules/theme-switcher/src/theme-switcher-element';
import { Tab } from '../../../../lib/model/tab';
import {
  UpdateTabMenuEvent,
  UpdateTabMenuType,
} from '../side-panel/panel-bar-element/tab-element/tabMenu';
import { sendEvent } from '../../../../lib/model/util';
import { AskModuleForStateEvent } from '../side-panel/panel-bar-element/tab-element/tab-element';
import { notify } from '../../../../lib/model/lit';
import { ModuleRegistry } from './registry';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/components/details/details.js';

customElement('module-element');
/**
 * The `ModuleElement` class serves as an abstract base class for creating custom module elements
 * in the application. It extends the `LitElement` class and provides a structure for managing
 * module state, rendering, and event handling.
 *
 * @abstract
 * @extends {LitElement}
 *
 * @property {CSSResult[]} static styles - Defines the default styles for the module element.
 * @property {Module} module - Represents the module associated with this element.
 * @property {string} title - The title of the module element. Defaults to 'Theme Switcher'.
 * @property {RenderMode} renderMode - Specifies the rendering mode for the module element.
 *
 * @constructor
 * @param {RenderMode} renderMode - The rendering mode to initialize the module element with.
 * @param {Module} module - The module to associate with this element.
 *
 * @event sendEvent<UpdateMenuType<T>> - Dispatched to update the menu state with the current module's data.
 *
 * @method newMethod - Abstract method to be implemented by subclasses for additional functionality.
 * @method intializeModule - Abstract method to initialize and return a new module instance.
 * @method _sendTabState - Abstract method to handle the dispatching of the module's tab state.
 * @method renderInSidePanel - Abstract method to define rendering logic for the side panel.
 * @method renderInSettings - Abstract method to define rendering logic for the main panel.
 * @method render - Abstract method to define the overall rendering logic for the module element.
 */
export abstract class ModuleElement extends LitElement {
  @state()
  module!: Module;

  @state() title!: string;

  @state()
  renderMode: RenderMode;

  @state()
  u: boolean = false;

  constructor(renderMode: RenderMode, module: Module) {
    super();
    this.renderMode = renderMode;
    this.module = module;
    this.module.tab = Object.assign(new Tab(), this.module.tab);
    this.title = this.module.title!;

    // @ts-ignore
    document.addEventListener(
      RequestUpdateEvent,
      this.listenToUpdates.bind(this)
    );
  }

  private listenToUpdates(e: CustomEvent<RequestUpdateEventType>) {
    if (e.detail.moduleId === this.module.id) {
      console.log('update');
      this.requestUpdate();
    }
  }

  protected handleTab() {
    if (this.module.tab?.isAppended) {
      return html`
        <sl-tooltip content="Remove tab from side-bar">
          <sl-icon-button
            name="layout-sidebar"
            class="icon-button"
            @click=${() => {
              this.module.tab?.removeTab();
              sendEvent<UPDATE_MODULE_EVENT_TYPE>(
                this,
                UPDATE_MODULE_EVENT,
                this.module
              );
              notify('removed tab!', 'success', null, 3000);
              this.requestUpdate();
            }}
          ></sl-icon-button>
        </sl-tooltip>
      `;
    }

    return html`
      <sl-tooltip content=${`Add ${this.title} settings as a tab`}>
        <sl-icon-button
          name="layout-sidebar"
          class="icon-button"
          @click=${() => {
            if (!this.module.tab?.isAppended) {
              this.module.tab?.appendTab();
              ModuleRegistry.UpdateModule(this.module);
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
    `;
  }

  protected renderThemeButton(trigger?: string) {
    if (trigger) {
      return html`
        <sl-icon-button name=${this.module.tab?.value} slot="trigger">
        </sl-icon-button>
      `;
    }

    return html`
      <sl-icon-button name=${this.module.tab?.value}></sl-icon-button>
    `;
  }

  protected createSection(
    title: string,
    description: string,
    section: () => TemplateResult
  ) {
    return html`
      <section>
        <div>
          <h5>${title}</h5>
          <p>${description}</p>
        </div>
        ${section()}
      </section>
    `;
  }

  protected createSidePanelSection(
    title: string,
    description: string,
    section: () => TemplateResult
  ) {
    return html`
      <sl-details open>
        <h5 slot="summary">${title}</h5>
        <p>${description}</p>
        ${section()}
      </sl-details>
    `;
  }

  protected renderTitleSection() {
    return html` <div class="title-box">
      ${this.renderThemeButton()}
      <h4>${this.title}</h4>
      ${this.handleTab()}
    </div>`;
  }

  protected renderSidePanelTitleSection() {
    return html` <div class="title-box">
      <h5>${this.title}</h5>
    </div>`;
  }

  protected abstract renderInSidePanel(): TemplateResult;

  protected abstract renderInSettings(): TemplateResult;

  abstract render(): TemplateResult;
}

declare global {
  interface HTMLElementTagNameMap {
    'module-element': ModuleElement;
  }
}
