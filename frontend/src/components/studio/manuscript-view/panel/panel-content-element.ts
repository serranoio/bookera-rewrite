import { LitElement, html, css, render, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import base from '../../../../lib/stylesheets/base';
import { QuoteList } from '../../../../lib/model/hard-coded';
import { Module, ModuleRegistryClasses } from '../modules/module';
import { ModuleConstructorSchema, ModuleRegistry } from '../modules/registry';
import { Bag } from '@pb33f/saddlebag';
import panelContentElementStyles from './panel-content-element.styles';
import { PanelTab, PanelTabs, PanelTabType } from './panel-tab/panel-tab';

@customElement('panel-content-element')
export class PanelContentElement extends LitElement {
  static styles = [base, panelContentElementStyles];

  @state()
  _panelContent: PanelTabType = PanelTabs.New;

  @state()
  _settings!: TemplateResult;

  @state()
  _new!: TemplateResult;

  constructor(panelContent: PanelTabType) {
    super();
    this._panelContent = panelContent;

    if (panelContent === PanelTabs.Settings) {
      this.handleSettingsPage();
    }
  }

  protected handleSettingsPage() {
    const moduleBag = ModuleRegistry.GetModuleBag();
    this.updateSettingsOnRerender(moduleBag);

    moduleBag.onPopulated(this.onModuleBagPopulated.bind(this));
  }

  private updateSettingsOnRerender(bag: Bag<Module>) {
    const modules = ModuleRegistry.GetModulesInSettings(bag.export());
    if (modules.length === 0) {
      return; // onpopulated, there are no modules
    }

    this._settings = this.populateSettings(modules);
  }

  protected populateSettings(modules: Module[]): TemplateResult {
    return html`
      ${modules.flatMap((module: Module) => {
        const moduleObject = Object.assign(new Module(), module);
        const type = moduleObject.getConstructorType();

        const obj: ModuleConstructorSchema = new ModuleRegistryClasses[type](
          'renderInSettings',
          moduleObject
        );

        return html` ${obj}`;
      })}
    `;
  }

  protected onModuleBagPopulated(bag: Map<string, Module> | undefined) {
    const modules = ModuleRegistry.GetModulesInSettings(bag!);
    this._settings = this.populateSettings(modules);

    this.requestUpdate();
  }

  private generateQuirkyQuote() {
    return QuoteList[Math.trunc(Math.random() * QuoteList.length)];
  }

  protected renderNewTab() {
    return html`
      <div class="fill-panel center empty panel">
        <p class="blockquote">${this.generateQuirkyQuote()}</p>
      </div>
    `;
  }

  protected renderSettings() {
    return html`
      <div class="fill-panel settings-padding">
        <!-- make the color switcher with the intention that you are creating an api for it -->
        ${this._settings}
      </div>
    `;
  }

  protected renderModule() {}

  render() {
    switch (this._panelContent) {
      case PanelTabs.Settings:
        return this.renderSettings();
      case PanelTabs.New:
        return this.renderNewTab();
      case PanelTabs.Module:
        return this.renderModule();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'panel-content-element': PanelContentElement;
  }
}
