import { LitElement, html, css, render, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import base from '../../../../lib/stylesheets/base';
import { QuoteList } from '../../../../lib/model/hard-coded';
import { Module, ModuleRegistryClasses } from '../modules/module';
import { ModuleConstructorSchema, ModuleRegistry } from '../modules/registry';
import { Bag } from '@pb33f/saddlebag';
import panelContentElementStyles from './panel-content-element.styles';

export const PanelContent = {
  Settings: 'Settings',
  New: 'New',
  Module: 'Module',
} as const;

export type PanelContentType = keyof typeof PanelContent;

@customElement('panel-content-element')
export class PanelContentElement extends LitElement {
  static styles = [base, panelContentElementStyles];

  @state()
  _panelContent: PanelContentType = PanelContent.New;

  @state()
  _settings: TemplateResult;

  constructor(panelContent: PanelContentType) {
    super();
    this._panelContent = panelContent;

    if (this._panelContent === 'Settings') {
      const moduleBag = ModuleRegistry.GetModuleBag();
      this._updateSettingsOnRerender(moduleBag);

      moduleBag.onPopulated(this.onModuleBagPopulated.bind(this));
    }
  }

  protected createSection(title: string, body: string) {
    return html`
      <h5 class="section-title">${title}</h5>
      <p class="body">${body}</p>
    `;
  }

  private _updateSettingsOnRerender(bag: Bag<Module>) {
    const modules = ModuleRegistry.GetModulesInSettings(bag.export());
    if (modules.length === 0) {
      return; // onpopulated, there are no modules
    }

    this._settings = this._populateSettings(modules);
  }

  _populateSettings(modules: Module[]): TemplateResult {
    return html`
      ${modules.flatMap((module: Module) => {
        const moduleObject = Object.assign(new Module(), module);
        const type = moduleObject.getConstructorType();

        const obj: ModuleConstructorSchema = new ModuleRegistryClasses[type](
          'renderInPanel',
          moduleObject
        );

        return html` ${obj}`;
      })}
    `;
  }

  onModuleBagPopulated(bag: Map<string, Module> | undefined) {
    const modules = ModuleRegistry.GetModulesInSettings(bag!);
    this._settings = this._populateSettings(modules);

    this.requestUpdate();
  }

  private generateQuirkyQuote() {
    return QuoteList[Math.trunc(Math.random() * QuoteList.length)];
  }

  renderNewTab() {
    return html`
      <div class="fill-panel center empty panel">
        <p class="blockquote">${this.generateQuirkyQuote()}</p>
      </div>
    `;
  }

  renderSettings() {
    return html`
      <div class="fill-panel settings-padding">
        <!-- make the color switcher with the intention that you are creating an api for it -->
        ${this._settings}
      </div>
    `;
  }

  renderModule() {}

  render() {
    switch (this._panelContent) {
      case PanelContent.Settings:
        return this.renderSettings();
      case PanelContent.New:
        return this.renderNewTab();
      case PanelContent.Module:
        return this.renderModule();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'panel-content-element': PanelContentElement;
  }
}
