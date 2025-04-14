import { ModuleElement } from '../../../module-element';
import { customElement, query, state } from 'lit/decorators.js';
import { html, PropertyValues } from 'lit';
import base from '../../../../../../../lib/stylesheets/base';
import moduleElementStyle from '../../../module-element.style';

import { sendEvent } from '../../../../../../../lib/model/util';
import {
  Module,
  RenderMode,
  RequestUpdateEvent,
  RequestUpdateEventType,
} from '../../../module';
import stylesCss from './styles.css';

@customElement('excalidraw-element')
export class ExcalidrawElement extends ModuleElement {
  static styles = [base, moduleElementStyle, stylesCss];

  @query('#root')
  rootElement!: HTMLElement;

  @state()
  isRendered: boolean = false;

  constructor(renderMode: RenderMode, module: Module) {
    super(renderMode, module);
  }

  private renderExcalidrawSettingsContent() {
    return html`<div>Excalidraw settings content</div>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (this.isRendered) {
    }
  }

  private renderExcalidrawSidePanelContent() {
    if (!this.isRendered) {
      sendEvent<RequestUpdateEventType>(this, RequestUpdateEvent, {
        moduleId: this.module.id!,
      });
      this.isRendered = true;
    }

    return html`hell`;
  }

  protected renderInSettings() {
    return html`
      <div class="panel-container">
        ${this.renderTitleSection()}
        ${this.createSection(
          'Excalidraw Settings',
          'Manage your Excalidraw settings here.',
          this.renderExcalidrawSettingsContent.bind(this)
        )}
      </div>
    `;
  }

  protected renderInSidePanel() {
    return html`
      <div class="side-panel">
        ${this.renderSidePanelTitleSection()}
        ${this.createSidePanelSection(
          'Excalidraw Overview',
          'Quick access to your Excalidraw tools.',
          this.renderExcalidrawSidePanelContent.bind(this)
        )}
      </div>
    `;
  }

  render() {
    return this.renderMode === 'renderInSettings'
      ? this.renderInSettings()
      : this.renderInSidePanel();
  }

  protected sendTabState() {
    console.log('Sending tab state for Excalidraw module');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'excalidraw-element': ExcalidrawElement;
  }
}
