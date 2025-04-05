import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import Epub from "../../lib/viewer/src/epub.js";
import { ContextConsumer } from "@lit/context";
import { FireViewerEvent, studioPageContext } from "../../lib/model/context.js";
@customElement("viewer-element")
export class ViewerElement extends LitElement {
  @query("#container")
  containerDiv: any;

  createRenderRoot() {
    return this;
  }

  _studioPageData = new ContextConsumer(this, {
    context: studioPageContext,
    subscribe: true,
    callback(ctx) {
      // @ts-ignore
      this._studioPageData = ctx;
    },
  });

  async getBook() {
    const response = await fetch(
      `http://localhost:8080/v1/serve/${this._studioPageData.value?.bookID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/epub+zip",
        },
      }
    );
    const buffer = await response.arrayBuffer();
    const book = Epub(buffer);
    // remove old book, render new book
    const container = document.querySelector("#container")!;
    container.id = "";
    container?.insertAdjacentHTML("afterend", `<div id="container"></div>`);
    container.remove();
    // render new book
    var rendition = await book.renderTo("container", {
      fullsize: true,
    });
    rendition.display();
  }

  constructor() {
    super();

    document.addEventListener(FireViewerEvent, this.getBook.bind(this));
  }

  render() {
    return html`
			<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
			<script src="../dist/epub.min.js"></script>
		<div id="container" style="height: 60vh;"  class="">
  </div>

		</div>
		
		`;
  }
}
