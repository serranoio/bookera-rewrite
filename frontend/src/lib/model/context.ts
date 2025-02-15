// create context

import { createContext } from "@lit/context";
import {
  findOutlineById,
  getExtractContentsConfigFromH,
} from "../../components/create/body-element";
import { ExtractContentsConfig, ExtractContentsMode } from "./settings";

export const studioPageCotextKey = "StudioPageCotext";

export enum FrontMatterView {
  Cover = "cover",
  TableOfContents = "table-of-contents",
  Copyright = "copyright", // who is the copyright holder? Author, everyone, etc.
  Dedication = "dedication", // who is this book dedicated to?
  Epigraph = "epigraph",
  Glossary = "glossary", // glossary of terms
  Citations = "citations", // references that the author used
}

export enum TypeSettingView {
  Margins = "margins", // the space around the page
  Paragraphs = "paragraphs", // alignment, indentation, spacing between pararaphs. other stylistic features
  Images = "images", // how are images stylized
}

export enum BookeraPlusView {
  ChooseYourOwnAdventure = "choose-your-own-adventure",
  Diagrams = "diagrams",
  WebFeatures = "web-features",
}

export enum BodyView {
  Main = "main",
}

export enum OtherViews {
  BodyGraphView = "BodyGraphView",
}

export enum StudioPageView {
  Body = "Body",
  Typesetting = TypeSettingView.Paragraphs,
  Frontmatter = FrontMatterView.Epigraph,
  BookeraPlus = BookeraPlusView.ChooseYourOwnAdventure,
}

export type typeStudioPageViewKeys =
  | "Body"
  | "Typesetting"
  | "Frontmatter"
  | "BookeraPlus";

export enum OutlineStatus {
  COMPLETE = "Complete",
  IN_PROGRESS = "In Progress",
  BRAIN_DUMP = "Brain Dump",
  EDITING = "Editing",
  NEW = "New",
}

export interface Note {
  body: string;
  templateID: string;
}

export interface Label {
  name: string;
  color: string;
}

export interface Outline {
  h: string;
  id: string;
  name: string;
  note: Note;
  status: OutlineStatus;
  labels: Label[];
}

export interface Config {
  outline: Outline[];
}

export interface StudioPageData {
  currrentView: StudioPageView;
  content: {
    body: Document;
    config: Config;
  };
  siteConfig: {
    editorDiv: HTMLElement | null;
  };
  bookId: string;
}

export const extractHTML = (body: Document): string => {
  return body.querySelector("body")!.innerHTML;
};
export const findNextMode = (
  el: Element,
  mode: ExtractContentsConfig
): boolean => {
  let found = false;
  switch (mode) {
    case ExtractContentsMode.SUB_HEADING:
      found = el.nodeName === "H4";
      if (found) break;
    case ExtractContentsMode.HEADING:
      found = el.nodeName === "H3";
      if (found) break;
    case ExtractContentsMode.CHAPTER:
      found = el.nodeName === "H2";
      if (found) break;
    case ExtractContentsMode.PART:
      found = el.nodeName === "H1";
      if (found) break;
  }

  return found;
};

export const extractContentsUnderOutline = (
  extractContentsConfig: ExtractContentsConfig,
  body: HTMLBodyElement,
  outline: Outline
): string => {
  let elString = "";

  let extract = false;
  for (const el of body.children) {
    let justFound = false;
    if (el.id === outline.id) {
      // on the next extraction
      extract = true;
      justFound = true;
    } else if (findNextMode(el, extractContentsConfig.mode)) {
      extract = false;
    }

    if (extract && !justFound) {
      elString += el.outerHTML;
    }
  }
  // first, we find the element.
  // next we will extract all elements up until we find the next mode

  return elString;
};

export const getBodyElement = (root: ShadowRoot) => {
  return root.querySelector("iframe").contentDocument.querySelector("body");
};

export enum InstanceType {
  Body = "Body",
  Outline = "Outline",
}

export interface Instance {
  outlineId: string | null;
  outlineH: string | null;
  body: HTMLBodyElement;
}

export const updateAllBodyInstancesInEveryPanel = (
  thisBody: HTMLBodyElement,
  instances: Instance[],
  newHTML: HTMLBodyElement
) => {
  instances.forEach((instance) => {
    if (thisBody === instance.body) {
      return;
    }

    if (instance.outlineId) {
      const content = extractContentsUnderOutline(
        { mode: getExtractContentsConfigFromH(instance.outlineH!) },
        newHTML,
        { id: instance.outlineId }
      );
      instance.body.innerHTML = content;
    } else {
      instance.body.innerHTML = newHTML.innerHTML;
    }
  });
};

export const OUTLINE_ID = "outline-id";
export const OUTLINE_H = "outline-h";

export const retrieveAllBodyInstnacesInEveryPanel = (): Instance[] => {
  let allBodyInstances: Instance[] = [];

  const rendererLayer = document.querySelector(
    "renderer-layer-element"
  )?.shadowRoot;

  const items = rendererLayer?.querySelectorAll(".lm_content")!;

  items.forEach((element) => {
    let bodyElement = element.children[0].shadowRoot
      ? element.children[0].shadowRoot
      : element.children[0];

    if (bodyElement.nodeName === "GRAPH-VIEW-ELEMENT") {
      bodyElement = bodyElement.querySelector("graph-element")?.shadowRoot!;
    }

    bodyElement?.querySelectorAll("#editor").forEach((editor) => {
      const bodyHTML = editor
        .querySelector("iframe")!
        .contentDocument?.querySelector("body");

      const instance: Instance = {
        outlineId: editor.getAttribute(OUTLINE_ID),
        outlineH: editor.getAttribute(OUTLINE_H),
        body: bodyHTML!,
      };

      allBodyInstances.push(instance);
    });
  });

  return allBodyInstances;
};

// what we have to do is now
// if this body's id == contents
const bigToSmall = (body: HTMLBodyElement, newHtml: string) => {
  const outlineID = body.getAttribute(OUTLINE_ID);

  const content = new DOMParser().parseFromString(newHtml, "text/html");

  console.log(content);
};

// * takes the original html, deletes all the elements.
// * inserts the new HTML in the original html
// * 1.6.2 needs to update 1.6 and body
export const updateOutlineInBody = (
  newHTML: string,
  originalHTML: HTMLBodyElement,
  outlineId: string,
  extractContentsConfig: ExtractContentsConfig
) => {
  let elementsToBeRemoved = [];
  let foundElement;
  let extract = false;
  for (const child of originalHTML.children) {
    let justFound = false;

    if (child.id === outlineId) {
      // on the next extraction
      extract = true;
      justFound = true;
      foundElement = child;
    } else if (findNextMode(child, extractContentsConfig.mode)) {
      extract = false;
    }

    if (extract && !justFound) {
      elementsToBeRemoved.push(child);
    }
  }

  for (const removeMe of elementsToBeRemoved) {
    removeMe.remove();
  }

  foundElement?.insertAdjacentHTML("afterend", newHTML);
};

export const defaultStudioPageData: StudioPageData = {
  currrentView: StudioPageView.Body,
  content: {
    // <!DOCTYPE html><html><head><title></title></head><body><h3 id="isPasted">The Nature of Nonsense</h3><p>Nonsense, often defined as language or ideas that lack meaning or are absurd, plays a fascinating role in literature, art, and culture. It challenges conventional logic and invites readers to embrace the absurdity of life.</p><h4>Historical Context</h4><p>Nonsense has roots in various literary traditions. From the playful works of Lewis Carroll, such as &quot;Jabberwocky,&quot; to the absurdist plays of Samuel Beckett, nonsense has been used to provoke thought and entertain. It often reflects the chaos of human existence and the limitations of language.</p><h4>Characteristics of Nonsense</h4><ol><li><strong>Absurdity</strong>: Nonsense often defies reason, creating a sense of confusion that can be both amusing and thought-provoking.</li><li><strong>Playfulness</strong>: The use of playful language and whimsical imagery invites readers to let go of logical constraints.</li><li><strong>Subversion</strong>: By disregarding established norms, nonsense can challenge societal expectations and provoke critical thinking.</li></ol><h4>Examples of Nonsense</h4><ul><li><strong>Lewis Carroll</strong>: His poem &quot;Jabberwocky&quot; is a prime example, filled with invented words and fantastical creatures that evoke imagination.</li><li><strong>Edward Lear</strong>: Known for his limericks and nonsense poetry, Lear&rsquo;s work often features absurd scenarios and playful rhymes.</li><li><strong>Modern Literature</strong>: Authors like Kurt Vonnegut and Douglas Adams use elements of nonsense to critique societal norms and explore existential themes.</li></ul><h4>The Role of Nonsense in Culture</h4><p>Nonsense has significant cultural implications. It allows for the exploration of themes such as identity, reality, and the absurdity of the human condition. In a world filled with complexity, nonsense can serve as a form of escapism, offering a break from the mundane.</p><h3>Conclusion</h3><p>While a 1000-page essay on nonsense might be a bit excessive, the exploration of its themes, characteristics, and impact can provide profound insights into human creativity and the nature of language. Embracing nonsense can lead to a richer understanding of the world and our place in it.</p><hr><p><br></p></body></html>
    body: new DOMParser().parseFromString(
      ` 
		<h1>1</h1>
		Text under 1
		<span>heloo</span>
		<p>wow</p>
		more text under 1
		asdopfijasdofij
		asdopfijasdofijjasdfopais
		jdpoasidfjasopdfjasdpofjasdop jasdpfiasj dfia sdujfaos8diasopid
		<h4>1.0.0.1	</h4>
		Text under 1.0.0.1
		<h3>1.0.1	</h3>
		Text under 1.0.1
		<h2>1.1	</h2>
		Text under 1.1
		<h2>1.2	</h2>
		Text under 1.2
		<h2>1.3	</h2>
		Text under 1.3
		<h2>1.4	</h2>
		Text under 1.4
		<h2>1.5	</h2>
		Text under 1.5
		<h2>1.6	</h2>
		Text under 1.6
		<h3>1.6.1	</h3>
		Text under 1.6.1
		<h3>1.6.2	</h3>
		Text under 1.6.2
		<h3>1.6.3	</h3>
		Text under 1.6.3
		<h3>1.6.4	</h3>
		Text under 1.6.4
		`,
      "text/html"
    ),
    config: {
      outline: [],
    },
  },
  siteConfig: {
    editorDiv: null,
  },
  bookId: "",
};

export const testStudioPageData: StudioPageData = {
  currrentView: StudioPageView.Body,
  content: {
    // <!DOCTYPE html><html><head><title></title></head><body><h3 id="isPasted">The Nature of Nonsense</h3><p>Nonsense, often defined as language or ideas that lack meaning or are absurd, plays a fascinating role in literature, art, and culture. It challenges conventional logic and invites readers to embrace the absurdity of life.</p><h4>Historical Context</h4><p>Nonsense has roots in various literary traditions. From the playful works of Lewis Carroll, such as &quot;Jabberwocky,&quot; to the absurdist plays of Samuel Beckett, nonsense has been used to provoke thought and entertain. It often reflects the chaos of human existence and the limitations of language.</p><h4>Characteristics of Nonsense</h4><ol><li><strong>Absurdity</strong>: Nonsense often defies reason, creating a sense of confusion that can be both amusing and thought-provoking.</li><li><strong>Playfulness</strong>: The use of playful language and whimsical imagery invites readers to let go of logical constraints.</li><li><strong>Subversion</strong>: By disregarding established norms, nonsense can challenge societal expectations and provoke critical thinking.</li></ol><h4>Examples of Nonsense</h4><ul><li><strong>Lewis Carroll</strong>: His poem &quot;Jabberwocky&quot; is a prime example, filled with invented words and fantastical creatures that evoke imagination.</li><li><strong>Edward Lear</strong>: Known for his limericks and nonsense poetry, Lear&rsquo;s work often features absurd scenarios and playful rhymes.</li><li><strong>Modern Literature</strong>: Authors like Kurt Vonnegut and Douglas Adams use elements of nonsense to critique societal norms and explore existential themes.</li></ul><h4>The Role of Nonsense in Culture</h4><p>Nonsense has significant cultural implications. It allows for the exploration of themes such as identity, reality, and the absurdity of the human condition. In a world filled with complexity, nonsense can serve as a form of escapism, offering a break from the mundane.</p><h3>Conclusion</h3><p>While a 1000-page essay on nonsense might be a bit excessive, the exploration of its themes, characteristics, and impact can provide profound insights into human creativity and the nature of language. Embracing nonsense can lead to a richer understanding of the world and our place in it.</p><hr><p><br></p></body></html>
    body: new DOMParser().parseFromString(
      ` 
		<h1>1</h1>
		Text under 1
    <h3>New Changes!</h3>
		`,
      "text/html"
    ),
    config: {
      outline: [],
    },
  },
  siteConfig: {
    editorDiv: null,
  },
  bookId: "",
};

export const testStudioPageData2: StudioPageData = {
  currrentView: StudioPageView.Body,
  content: {
    // <!DOCTYPE html><html><head><title></title></head><body><h3 id="isPasted">The Nature of Nonsense</h3><p>Nonsense, often defined as language or ideas that lack meaning or are absurd, plays a fascinating role in literature, art, and culture. It challenges conventional logic and invites readers to embrace the absurdity of life.</p><h4>Historical Context</h4><p>Nonsense has roots in various literary traditions. From the playful works of Lewis Carroll, such as &quot;Jabberwocky,&quot; to the absurdist plays of Samuel Beckett, nonsense has been used to provoke thought and entertain. It often reflects the chaos of human existence and the limitations of language.</p><h4>Characteristics of Nonsense</h4><ol><li><strong>Absurdity</strong>: Nonsense often defies reason, creating a sense of confusion that can be both amusing and thought-provoking.</li><li><strong>Playfulness</strong>: The use of playful language and whimsical imagery invites readers to let go of logical constraints.</li><li><strong>Subversion</strong>: By disregarding established norms, nonsense can challenge societal expectations and provoke critical thinking.</li></ol><h4>Examples of Nonsense</h4><ul><li><strong>Lewis Carroll</strong>: His poem &quot;Jabberwocky&quot; is a prime example, filled with invented words and fantastical creatures that evoke imagination.</li><li><strong>Edward Lear</strong>: Known for his limericks and nonsense poetry, Lear&rsquo;s work often features absurd scenarios and playful rhymes.</li><li><strong>Modern Literature</strong>: Authors like Kurt Vonnegut and Douglas Adams use elements of nonsense to critique societal norms and explore existential themes.</li></ul><h4>The Role of Nonsense in Culture</h4><p>Nonsense has significant cultural implications. It allows for the exploration of themes such as identity, reality, and the absurdity of the human condition. In a world filled with complexity, nonsense can serve as a form of escapism, offering a break from the mundane.</p><h3>Conclusion</h3><p>While a 1000-page essay on nonsense might be a bit excessive, the exploration of its themes, characteristics, and impact can provide profound insights into human creativity and the nature of language. Embracing nonsense can lead to a richer understanding of the world and our place in it.</p><hr><p><br></p></body></html>
    body: new DOMParser().parseFromString(
      ` 
      <h3>Secondary test framework</h3>

		`,
      "text/html"
    ),
    config: {
      outline: [],
    },
  },
  siteConfig: {
    editorDiv: null,
  },
  bookId: "",
};

export const defaultStudioPageDataReal: StudioPageData = {
  currrentView: StudioPageView.Body,
  content: {
    // <!DOCTYPE html><html><head><title></title></head><body><h3 id="isPasted">The Nature of Nonsense</h3><p>Nonsense, often defined as language or ideas that lack meaning or are absurd, plays a fascinating role in literature, art, and culture. It challenges conventional logic and invites readers to embrace the absurdity of life.</p><h4>Historical Context</h4><p>Nonsense has roots in various literary traditions. From the playful works of Lewis Carroll, such as &quot;Jabberwocky,&quot; to the absurdist plays of Samuel Beckett, nonsense has been used to provoke thought and entertain. It often reflects the chaos of human existence and the limitations of language.</p><h4>Characteristics of Nonsense</h4><ol><li><strong>Absurdity</strong>: Nonsense often defies reason, creating a sense of confusion that can be both amusing and thought-provoking.</li><li><strong>Playfulness</strong>: The use of playful language and whimsical imagery invites readers to let go of logical constraints.</li><li><strong>Subversion</strong>: By disregarding established norms, nonsense can challenge societal expectations and provoke critical thinking.</li></ol><h4>Examples of Nonsense</h4><ul><li><strong>Lewis Carroll</strong>: His poem &quot;Jabberwocky&quot; is a prime example, filled with invented words and fantastical creatures that evoke imagination.</li><li><strong>Edward Lear</strong>: Known for his limericks and nonsense poetry, Lear&rsquo;s work often features absurd scenarios and playful rhymes.</li><li><strong>Modern Literature</strong>: Authors like Kurt Vonnegut and Douglas Adams use elements of nonsense to critique societal norms and explore existential themes.</li></ul><h4>The Role of Nonsense in Culture</h4><p>Nonsense has significant cultural implications. It allows for the exploration of themes such as identity, reality, and the absurdity of the human condition. In a world filled with complexity, nonsense can serve as a form of escapism, offering a break from the mundane.</p><h3>Conclusion</h3><p>While a 1000-page essay on nonsense might be a bit excessive, the exploration of its themes, characteristics, and impact can provide profound insights into human creativity and the nature of language. Embracing nonsense can lead to a richer understanding of the world and our place in it.</p><hr><p><br></p></body></html>
    body: new DOMParser().parseFromString(``, "text/html"),
    config: {
      outline: [],
    },
  },
  siteConfig: {
    editorDiv: null,
  },
  bookId: "",
};

export const studioPageContext = createContext<StudioPageData>(
  Symbol(studioPageCotextKey)
);
// now that I have another data source, I have to update it with the body
// upon pressing the change back to other screen, I can then update the studioPageConfig

export const SlTreeChangeEvent = "sl-tree-change";
export const EditorAttachedEvent = "editor-attached";
export const BodyContentEvent = "body-content";
export const ConfigUpdateEvent = "config-update";
export const FireViewerEvent = "fire-viewer-event";

export const StudioPageChanges = "studio-page-changes";

export const getWordCount = (studioPage: StudioPageData): number => {
  let text = studioPage.siteConfig.editorDiv
    ?.querySelector("iframe")
    ?.contentDocument?.querySelector("body")?.innerText!;
  text = text.replaceAll("\n", " ");
  return text?.split(" ").length as number;
};

export const SEND_OUTLINE_EVENT = "send-outline-event";
export const CHANGE_TITLE_EVENT = "change-title-event";
