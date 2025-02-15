import { LitElement } from "lit-element";
import config from "../twind.config";
import { customElement, state } from "lit/decorators.js";
import install from "@twind/with-web-components";
import { html, css } from "lit";
import { navSize } from "../lib/model/meta";
import { msg } from "@lit/localize";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/card/card.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/badge/badge.js";

enum StudioFeature {
  GRAPH_VIEW = "Graph View",
  AI = "AI",
  NEXT_GEN_BOOKS = "Next Gen Books",
  BOOK_CONVERTER = "ebooks -> physical books",
}

enum CatalogFeature {
  BOOK_CLUBS = "Book Clubs",
  THREADS = "Threads",
  Share = "Share",
}

@customElement("hero-element")
@install(config)
export class HeroElement extends LitElement {
  static _styles = [
    css`
      :host {
        z-index: 1;
      }
    `,
  ];

  @state()
  selectedStudioFeature: StudioFeature = StudioFeature.GRAPH_VIEW;

  @state()
  selectedCatalogFeature: CatalogFeature = CatalogFeature.BOOK_CLUBS;

  getCatalogFeature() {
    let featureBox = {
      title: "",
      desc: "",
      img: "",
    };

    switch (this.selectedCatalogFeature) {
      case CatalogFeature.BOOK_CLUBS:
        featureBox.title = "Book Clubs";
        featureBox.desc = "fill out description";
        featureBox.img = "get image";
        break;
      case CatalogFeature.THREADS:
        featureBox.title = "Threads";
        featureBox.desc = "fill out description";
        featureBox.img = "get image";
        break;
      case CatalogFeature.Share:
        featureBox.title = "Share";
        featureBox.desc = "fill out description";
        featureBox.img = "get image";
        break;
    }

    return html`
      <div>
        <h3 class="h3 text-center">${featureBox.title}</h3>
        <img alt=${featureBox.title} src=${featureBox.img} />
        <p class="p">${featureBox.desc}</p>
      </div>
    `;
  }

  getStudioFeature() {
    let featureBox = {
      title: "",
      desc: "",
      img: "",
    };

    switch (this.selectedStudioFeature) {
      case StudioFeature.GRAPH_VIEW:
        featureBox.title = "Graph View";
        featureBox.desc = "fill out description";
        featureBox.img = "get image";
        break;
      case StudioFeature.AI:
        featureBox.title = "AI";
        featureBox.desc = "fill out description";
        featureBox.img = "get image";
        break;
      case StudioFeature.NEXT_GEN_BOOKS:
        featureBox.title = "Next Gen Books";
        featureBox.desc = "fill out description";
        featureBox.img = "get image";
        break;
      case StudioFeature.BOOK_CONVERTER:
        featureBox.title = "Book Converter";
        featureBox.desc = "fill out desc";
        featureBox.img = "get image";
    }

    return html`
      <div>
        <h3 class="h3 text-center">${featureBox.title}</h3>
        <img alt=${featureBox.title} src=${featureBox.img} />
        <p class="p">${featureBox.desc}</p>
      </div>
    `;
  }

  render() {
    return html`
      <section
        class="h-[calc(100vh-${navSize}px)] flex justify-center items-center"
      >
        <div>
          <h1 class="text-center h1 relative">
            Bookera
            <span
              class="text-yellow-500 opacity-[.2] absolute top-0 translate-y-[-120%] left-0 text-7xl"
              >Work In Progress</span
            >
          </h1>
          <p class="text-center p mb-2">
            Digital media reimagined in the next-gen library.
          </p>
          <div class="flex justify-center gap-2 mb-4">
            <sl-badge variant="neutral">${msg("verified")}</sl-badge>
            <sl-badge variant="neutral">next-gen</sl-badge>
            <sl-badge variant="neutral">hip</sl-badge>
            <sl-badge variant="neutral">books</sl-badge>
          </div>
          <div class="flex justify-center">
            <sl-button variant="primary" size="large">View Catalog</sl-button>
          </div>
        </div>
      </section>
      <section class="bg-[#ffbf8b] py-16">
        <div class="max-w-[80rem] mx-auto">
          <h2 class="text-center text-slate-50 h2">Bookera Studio</h2>
          <p class="text-center mb-2 italic p">
            Becoming an author has never been easier.
          </p>
          <div class="flex justify-center gap-2 mb-8">
            <sl-badge variant="neutral">book editor</sl-badge>
            <sl-badge variant="neutral">ez</sl-badge>
            <sl-badge variant="neutral">author</sl-badge>
            <sl-badge variant="neutral">create</sl-badge>
          </div>
          <div class="demo-box flex justify-center mb-4">
            ${this.getStudioFeature()}
          </div>
          <div
            class="flex justify-center gap-2 mb-4"
            @click=${(e: any) => {
              const card = e.target.closest("sl-card");
              if (!card) {
                return;
              }

              this.selectedStudioFeature = card.dataset.card;
            }}
          >
            ${Object.values(StudioFeature).map(
              (studioFeature: StudioFeature) => {
                return html`<sl-card
                  class="card-header cursor-pointer ${studioFeature ===
                  this.selectedStudioFeature
                    ? "[box-shadow:0px_0px_3px_#000000AF]"
                    : ""}"
                  data-card=${studioFeature}
                >
                  <div slot="header" class="flex justify-center">
                    <img
                      src="/ios/180.png"
                      class="h-[${navSize + 10}px] w-[${navSize + 10}px]"
                    />
                  </div>
                  ${studioFeature}
                </sl-card>`;
              }
            )}
          </div>
        </div>
      </section>
      <section class=" py-16">
        <div class="max-w-[80rem] mx-auto">
          <h2 class="text-center text-slate-600 h2">Bookera Catalog</h2>
          <p class="text-center mb-2 italic p">The social media for books.</p>
          <div class="flex justify-center gap-2 mb-8">
            <sl-badge variant="neutral">books</sl-badge>
            <sl-badge variant="neutral">social media</sl-badge>
            <sl-badge variant="neutral">knowledge</sl-badge>
            <sl-badge variant="neutral">read</sl-badge>
          </div>
          <div class="demo-box flex justify-center mb-4">
            ${this.getCatalogFeature()}
          </div>
          <div
            class="flex justify-center gap-2 mb-4"
            @click=${(e: any) => {
              const card = e.target.closest("sl-card");
              if (!card) {
                return;
              }

              this.selectedCatalogFeature = card.dataset.card;
            }}
          >
            ${Object.values(CatalogFeature).map(
              (catalogFeature: CatalogFeature) => {
                return html`<sl-card
                  class="card-header cursor-pointer ${catalogFeature ===
                  this.selectedCatalogFeature
                    ? "[box-shadow:0px_0px_3px_#000000AF]"
                    : ""}"
                  data-card=${catalogFeature}
                >
                  <div slot="header" class="flex justify-center">
                    <img
                      src="/ios/180.png"
                      class="h-[${navSize + 10}px] w-[${navSize + 10}px]"
                    />
                  </div>
                  ${catalogFeature}
                </sl-card>`;
              }
            )}
          </div>
        </div>
      </section>
      <section class="bg-[#ffbf8b] py-8">
        <div class="max-w-[80rem] mx-auto">
          <sl-card class="card-header">
            <div slot="header" class="flex justify-center">
              <img
                src="/ios/180.png"
                class="h-[${navSize + 10}px] w-[${navSize + 10}px]"
              />
            </div>
            Hey y'all 👋, I'm David, the creator of Bookera. Bookera came about
            because I wanted to publish a book, more specifically a collection
            of poems about programming. I felt that a poetic book about
            programming should include tech in it, should be made from tech, but
            at the same time should embrace the phsysical world, so I dreamt of
            this 💭. I hope you enjoy 🥂
          </sl-card>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hero-element": HeroElement;
  }
}
