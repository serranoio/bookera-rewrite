import {
  DRAG_DROP_EVENT,
  DragDropEventType,
  GET_COMPONENT_ID,
  REMOVE_PANEL_EVENT,
  SET_COMPONENT_ID,
} from "../../../lib/model/site";
import { ComponentContainer, GoldenLayout } from "../../libs/golden-layout/src";
import { BooleanComponent } from "./boolean";
import { ComponentBase } from "./golden-layout-base";
import { miniRowConfig } from "./layout";
import { BodyElement } from "../../create/body-element";
import { notify } from "../../../lib/model/lit";
import {
  CHANGE_TITLE_EVENT,
  OUTLINE_ID,
  Outline,
  SEND_OUTLINE_EVENT,
  StudioPageChanges,
  StudioPageData,
  defaultStudioPageData,
} from "../../../lib/model/context";

export interface Component {
  componentID: string;
  id?: string;
  type: string;
  name: string;
  extraData?: any;
  internalIDs: string[];
}
export class App {
  private readonly _layoutElement: HTMLElement;
  private readonly _goldenLayout: GoldenLayout;

  private readonly _boundComponentMap = new Map<
    ComponentContainer,
    ComponentBase
  >();

  private readonly _globalBubbleClickListener = () =>
    this.handleGlobalBubbleClickEvent();
  private readonly _globalCaptureClickListener = () =>
    this.handleGlobalCaptureClickEvent();
  private readonly _bindComponentEventListener = (
    container: ComponentContainer
  ) => this.handleBindComponentEvent(container);
  private readonly _unbindComponentEventListener = (
    container: ComponentContainer
  ) => this.handleUnbindComponentEvent(container);

  private _currentOutline: Outline[] = [];
  private _studioPageData: StudioPageData = defaultStudioPageData;

  components: Component[] = [];

  _dropEventHandler(event: CustomEvent<DragDropEventType>) {
    const element = event.detail;
    element.dispatchEvent(new CustomEvent(DRAG_DROP_EVENT));

    if (element.children[0].nodeName === "BODY-ELEMENT") {
      const editorDivInBody =
        element.children[0].shadowRoot?.querySelector("#editor");
      const outlineID = editorDivInBody?.getAttribute(OUTLINE_ID);

      const outline = this._studioPageData.content.config.outline.find(
        (outline: Outline) => {
          return outline.id === outlineID;
        }
      );

      element.innerHTML = "";
      element.appendChild(
        new BodyElement({ id: outline?.id, name: outline?.name, h: outline?.h })
      );
    }
  }

  constructor(layoutElement: HTMLElement) {
    // document.addEventListener(
    //   SEND_OUTLINE_EVENT,
    //   this._updateCurrentOutline.bind(this)
    // );

    if (layoutElement === null) {
      throw new Error("layoutContainerElement not found");
    }
    this._layoutElement = layoutElement;
    this._goldenLayout = new GoldenLayout(
      this._layoutElement,
      this._bindComponentEventListener,
      this._unbindComponentEventListener
    );

    this._goldenLayout.resizeWithContainerAutomatically = true;

    globalThis.addEventListener("click", this._globalBubbleClickListener, {
      passive: true,
    });
    globalThis.addEventListener("click", this._globalCaptureClickListener, {
      capture: true,
      passive: true,
    });

    // when you create a new panel.
    document.addEventListener(
      DRAG_DROP_EVENT,
      this._dropEventHandler.bind(this)
    );

    document.addEventListener(
      StudioPageChanges,
      this._listenToStudioPAageChanges.bind(this)
    );

    document.addEventListener(
      REMOVE_PANEL_EVENT,
      this._listenToDelete.bind(this)
    );

    document.addEventListener(
      SET_COMPONENT_ID,
      this._listenToComponentID.bind(this)
    );
  }

  _listenToComponentID(e: any) {
    this.components[this.components.length - 1].internalIDs.push(e.detail);
  }

  _listenToDelete(e: any) {
    this.components = this.components.filter(
      (component: Component) => !component.internalIDs.includes(e.detail)
    );
  }

  _updatePanels() {
    this.components.forEach((component: Component) => {
      this._studioPageData.content.config.outline.forEach(
        (outline: Outline) => {
          if (component.id === outline.id) {
            component.name = outline.name;
            component.extraData.h = outline.h;
            document.dispatchEvent(
              new CustomEvent<Component>(CHANGE_TITLE_EVENT, {
                detail: component,
                bubbles: true,
                composed: true,
              })
            );
          }
        }
      );
    });
  }

  _listenToStudioPAageChanges(e: any) {
    const studioPageData: StudioPageData = e.detail;

    this._studioPageData = studioPageData;

    this._updatePanels();
  }

  addComponent(component: Component) {
    if (
      this.components
        .map((commponent1: Component) => commponent1.name)
        .includes(component.name) &&
      component.name !== "Body"
    ) {
      notify(`Only 1 panel for ${component.name} can exist`, "danger", "fail");
    } else {
      this.components.push(component);
      this._goldenLayout.addComponent(
        BooleanComponent.typeName,
        undefined,
        component.name,
        component.componentID
      );
    }
  }

  private createComponent(container: ComponentContainer) {
    document.dispatchEvent(
      new CustomEvent(SET_COMPONENT_ID, {
        detail: this.components[this.components.length - 1].componentID,
        composed: true,
        bubbles: true,
      })
    );
    return new BooleanComponent(
      container,
      this.components[this.components.length - 1]
    );
  }

  private handleBindComponentEvent(
    container: ComponentContainer
  ): ComponentContainer.BindableComponent {
    const component = this.createComponent(container);
    this._boundComponentMap.set(container, component);

    return {
      component,
      virtual: false,
    };
  }

  private handleUnbindComponentEvent(container: ComponentContainer) {
    const component = this._boundComponentMap.get(container);
    if (component === undefined) {
      throw new Error("handleUnbindComponentEvent: Component not found");
    }

    const componentRootElement = component.rootHtmlElement;
    if (componentRootElement === undefined) {
      throw new Error(
        "handleUnbindComponentEvent: Component does not have a root HTML element"
      );
    }

    if (container.virtual) {
      this._layoutElement.removeChild(componentRootElement);
    } else {
      // If embedded, then component handles unbinding of component elements from content.element
    }
    this._boundComponentMap.delete(container);
  }

  private handleGlobalBubbleClickEvent() {
    // console.log("bubble")
  }

  private handleGlobalCaptureClickEvent() {
    // console.log("capture")
  }
  public loadLayout() {
    this._goldenLayout.loadLayout(miniRowConfig);
  }
}
