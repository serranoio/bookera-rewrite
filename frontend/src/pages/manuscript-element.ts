import FroalaEditor from 'froala-editor';
import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import '../components/studio/manuscript-view/side-panel/side-panel-element';
import '../components/studio/manuscript-view/panel/panel-element';
import { PanelElement } from '../components/studio/manuscript-view/panel/panel-element';
import { genShortID } from '../lib/model/util';
import {
  PANEL_RESIZE_EVENT,
  PanelResizeEventDetail,
} from '../components/studio/manuscript-view/panel/panel-handle/panel-handle-element';
import { CreateBagManager } from '@pb33f/saddlebag';
import { notify } from '../lib/model/lit';
import {
  CLOSE_PANEL_EVENT,
  IsDraggingTabEvent,
  NEW_PANEL_EVENT,
  PanelDrop,
  SPLIT_PANEL_EVENT,
  SplitPanelEventType,
} from '../lib/model/panel';
import { OPEN_OUTLINE_EVENT } from '../lib/model/site';
import {
  ModuleRegistry,
  ModuleRegistryKey,
} from '../components/studio/manuscript-view/modules/registry';
import { Module } from '../components/studio/manuscript-view/modules/module';
import {
  addEventListeners,
  createPanelWithNewTabs,
} from '../components/studio/manuscript-view/panel/panel-manager/panel-manager';
import {
  handleDragTab,
  handleDropTab,
  PanelTab,
  setPanelTabEventListeners,
} from '../components/studio/manuscript-view/panel/panel-tab/panel-tab';
import { SidePanelElement } from '../components/studio/manuscript-view/side-panel/side-panel-element';
import { Panel } from '../components/studio/manuscript-view/panel/panel-state';

@customElement('manuscript-element')
export class ManuscriptElement extends LitElement {
  @query('#editor-div')
  editorDiv!: Element;

  @query('#panels-section')
  panelsSection!: Element;

  @state()
  isSidePanelOpened: boolean = false;

  @state()
  handleDragTab: any = handleDragTab.bind(this);

  @state()
  handleDropTab: any = handleDropTab.bind(this);

  @query('#left')
  leftSidePanel!: SidePanelElement;

  getLeftSidePanel() {
    return this.leftSidePanel;
  }

  // if I can move a panel to the right, AND the panel shrinks as well up until minimumWidth, that would be money

  getAllPanels(this: ManuscriptElement): NodeListOf<PanelElement> {
    return this.panelsSection!.querySelectorAll('panel-element')!;
  }

  updateAllPanels(this: ManuscriptElement) {
    const newPanels = this.getAllPanels();
    newPanels.forEach((panel, i) => {
      if (i === newPanels.length - 1) {
        panel.updateLastElement(true);
      } else {
        panel.updateLastElement(false);
      }

      Panel.UpdatePanel(panel.formPanel());
    });
  }

  draggedTab: IsDraggingTabEvent | null = null;

  constructor() {
    super();

    addEventListeners.bind(this)();
    setPanelTabEventListeners.bind(this)();

    const bagManager = CreateBagManager(true);
    ModuleRegistry.InitializeModulesInBag(bagManager);
    const moduleRegistryBag = bagManager.getBag<Module>(ModuleRegistryKey);

    moduleRegistryBag?.onPopulated(this.onModuleRegistryPopulated.bind(this));
  }

  onModuleRegistryPopulated(bag: Map<string, Module> | undefined) {
    // todo: nothing to do
  }

  @state()
  startTotalWidth = 0;

  endResizeEvent() {
    if (this.startTotalWidth > 0) {
      const panels = this.getAllPanels();
      panels.forEach((panel) => {
        panel.updateWidth(panel.getBoundingClientRect().width);
      });
    }

    this.startTotalWidth = 0;
  }

  @state()
  timeout!: NodeJS.Timeout;

  createRenderRoot() {
    return this;
  }

  initializeEditor() {
    new FroalaEditor(this.editorDiv, {
      events: {
        contentChanged: () => {},
        initialized: () => {},
      },
      placeholderText: '',
      fullPage: true,
      toolbarInline: true,
      toolbarButtons: [
        [
          'alignLeft',
          'alignCenter',
          'formatOLSimple',
          'alignRight',
          'alignJustify',
          'formatOL',
          'formatUL',
          'paragraphFormat',
          'paragraphStyle',
          'lineHeight',
          'outdent',
          'indent',
          'quote',
          'image',
        ],
      ],
    });

    document?.querySelectorAll('.editor-div').forEach((div) => {
      new FroalaEditor(div, {
        events: {
          contentChanged: () => {},
          initialized: () => {},
        },
        placeholderText: '',
        fullPage: true,
        toolbarInline: true,
        toolbarButtons: [
          [
            'alignLeft',
            'alignCenter',
            'formatOLSimple',
            'alignRight',
            'alignJustify',
            'formatOL',
            'formatUL',
            'paragraphFormat',
            'paragraphStyle',
            'lineHeight',
            'outdent',
            'indent',

            'image',
          ],
        ],
      });
    });
  }

  firstUpdated() {
    Panel.InitiatlizePanelsInBag().then((bag) => {
      const values = bag?.export().values();
      Array.from(values ? values : []).forEach((panel: Panel) => {
        console.log(panel);
        this.panelsSection.appendChild(new PanelElement(panel));
      });
    });

    // this.panelsSection?.appendChild(
    //   createPanelWithNewTabs([new PanelTab('Settings', 'Settings')])
    // );
    // this.panelsSection?.appendChild(
    //   createPanelWithNewTabs([
    //     new PanelTab('New Tab', 'New'),
    //     new PanelTab('Settings', 'Settings'),
    //   ])
    // );
  }

  render() {
    return html`
      <side-panel-element
        id="left"
        showSettings
        .panelID=${'left'}
      ></side-panel-element>
      <div id="panels-section"></div>
      <side-panel-element
        .panelBarPosition=${'top'}
        .panelID=${'right'}
      ></side-panel-element>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'manuscript-element': ManuscriptElement;
  }
}
