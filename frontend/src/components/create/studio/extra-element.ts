import { ContextConsumer } from "@lit/context";
import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  StudioPageChanges,
  retrieveAllBodyInstnacesInEveryPanel,
  studioPageContext,
  updateAllBodyInstancesInEveryPanel,
} from "../../../lib/model/context";
import { BOOKERA_STUDIO } from "../../../lib/model/meta";
import { updateBookStructure, updateTheMotherShip } from "../body-element";
import { Manuscript } from "../../../lib/git/manuscript";
import {
  // BookeraStudioState,
  EXTRA_ELEMENT_HAS_UPDATED,
} from "../../../pages/manuscript-element";
import { URL_PARAMS_CHANGE } from "../../layout/layout-element";
import { MdImage } from "../../../lib/git/file-conversion";
import { assetStore } from "../../../lib/git/fs";
import fs from "@zenfs/core";

export const getURL = (href?: string) => {
  if (!href) {
    href = window.location.href;
  }

  const studioIndex = href.indexOf(BOOKERA_STUDIO.toLocaleLowerCase());

  const restOfURL = href.slice(studioIndex + BOOKERA_STUDIO.length, -1);

  return restOfURL;
};

export const getManuscriptFromURL = (manuscript = "manuscript=") => {
  const search = window.location.search;

  const title =
    search.slice(
      search.indexOf(manuscript) + manuscript.length,
      // this assumes that manuscript is the first argument
      search.indexOf("&")
    ) + ".json";

  return title;
};

const matchAsset = async (asset: MdImage, manuscript: Manuscript) => {
  const data: string | null = await assetStore.getItem(asset.fileName)!;

  const matchFile = asset.str.match(new RegExp(/\(.+\)/, "g"))![0].slice(1, -1);

  console.log(matchFile, data);
  return manuscript.body?.replace(matchFile, data!);
};

const updateManuscriptAssets = async (manuscript: Manuscript) => {
  if (!manuscript.body) return;

  manuscript.assets?.forEach(async (asset: MdImage) => {
    // grab localforage
    manuscript.body = await matchAsset(asset, manuscript);
    console.log(manuscript.body);
  });
};

@customElement("extra-element")
export class ExtraElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property()
  studioPageData: any;

  @property()
  hasChanged: boolean = false;

  async loadManuscript() {
    const url = getURL();

    // no id, then we are at the beginning
    if (url.length === 0) {
      // this.dispatchEvent(
      //   new CustomEvent<BookeraStudioState>(EXTRA_ELEMENT_HAS_UPDATED, {
      //     detail: BookeraStudioState.ALL_MANUSCRIPTS,
      //     composed: true,
      //     bubbles: true,
      //   })
      // );

      return;
    }

    if (this.hasChanged) return;

    const title = getManuscriptFromURL();
    if (title.length <= 5) return;

    let manuscriptData: Manuscript = await Manuscript.ReadManuscriptFromLF(
      title
    );

    const manuscriptDocument = new DOMParser().parseFromString(
      manuscriptData.body!,
      "text/html"
    );

    const studioPageData = updateTheMotherShip(
      manuscriptDocument.querySelector("body")!,
      this.studioPageData
    );

    this.dispatchEvent(
      new CustomEvent(StudioPageChanges, {
        detail: studioPageData,
        bubbles: true,
        composed: true,
      })
    );

    // this.dispatchEvent(
    //   new CustomEvent<BookeraStudioState>(EXTRA_ELEMENT_HAS_UPDATED, {
    //     detail: BookeraStudioState.MANUSCRIPT,
    //     composed: true,
    //     bubbles: true,
    //   })
    // );

    this.hasChanged = true;
  }

  callback(ctx) {
    this.studioPageData = ctx;
    this.loadManuscript();
  }

  private _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback: this.callback.bind(this),
  });

  listenToURLChange() {
    this.loadManuscript();
  }

  constructor() {
    super();

    this.addEventListener(URL_PARAMS_CHANGE, this.listenToURLChange.bind(this));
  }

  render() {
    return html``;
  }
}
