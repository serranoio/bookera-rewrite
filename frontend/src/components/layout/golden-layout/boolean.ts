import { render } from "lit-element";
import { GraphViewElement } from "../../create/graph-view-element";
import {
  ComponentContainer,
  JsonValue,
} from "../../libs/golden-layout/dist/types";
import { ComponentBase } from "./golden-layout-base";
import {
  BookeraPlusView,
  FrontMatterView,
  OtherViews,
  StudioPageView,
} from "../../../lib/model/context";
import { Component } from "./app";
import { BodyElement } from "../../create/body-element";

export class BooleanComponent extends ComponentBase {
  static typeName = "Body";

  private id: string;

  private _containerClickListener = () => this.handleClickFocusEvent();
  private _containerFocusinListener = () => this.handleClickFocusEvent();

  constructor(container: ComponentContainer, component: Component) {
    super(container, false);

    this.id = component.componentID;

    let views = [];

    switch (component.type) {
      case FrontMatterView.TableOfContents:
        break;
      case FrontMatterView.Citations:
        break;
      case FrontMatterView.Copyright:
        break;
      case FrontMatterView.Dedication:
        break;
      case FrontMatterView.Cover:
        break;
      case FrontMatterView.Epigraph:
        break;
      case FrontMatterView.Glossary:
        break;
      case BookeraPlusView.WebFeatures:
        break;
      case BookeraPlusView.Diagrams:
        break;
      case BookeraPlusView.ChooseYourOwnAdventure:
        break;
      case OtherViews.BodyGraphView:
        views.push(new GraphViewElement());
        break;
      case StudioPageView.Body:
        views.push(
          new BodyElement({
            id: component.id,
            name: component.name,
            h: component.extraData?.h,
          })
        );
        break;
      case StudioPageView.Frontmatter:
        break;
      case StudioPageView.Typesetting:
        break;
      case StudioPageView.BookeraPlus:
    }

    views.forEach((view: any) => {
      render(view, this.rootHtmlElement);
    });

    this.rootHtmlElement.addEventListener(
      "click",
      this._containerClickListener
    );
    this.rootHtmlElement.addEventListener(
      "focusin",
      this._containerFocusinListener
    );
  }

  handleClickFocusEvent() {
    console.log(this.id);
  }
}
