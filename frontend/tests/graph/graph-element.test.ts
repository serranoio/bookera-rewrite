// sum.test.js
import { expect, test, vi } from "vitest";
import "../../src/components/create/create-side-panel-element";
import {
  CreateSidePanelElement,
  OutlineSubtype,
  defaultParentOutline,
  expandOutlineRecursively,
} from "../../src/components/create/create-side-panel-element";
import {
  ExtractContentsConfig,
  ExtractContentsMode,
  Outline,
  defaultStudioPageData,
  extractContentsUnderOutline,
} from "../../src/lib/model/context";
import {
  Direction,
  PositiningStrategy,
  attachPositioning,
  createLayout,
  determineSizeOfNode,
  findDimensions,
} from "../../src/components/libs/graph/graph-utils";
import { BodyElement } from "../../src/components/create/body-element";

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/split-panel/split-panel.js",
  () => ({
    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tree/tree.js",
  () => ({
    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab/tab.js",
  () => ({
    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab-group/tab-group.js",
  () => ({
    // Mock implementation

    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab-panel/tab-panel.js",
  () => ({
    // Mock implementation

    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tree-item/tree-item.js",
  () => ({
    // Mock implementation

    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/details/details.js",
  () => ({
    // Mock implementation

    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/icon-button/icon-button.js",
  () => ({
    // Mock implementation

    someFunction: () => "",
  })
);

vi.mock(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/tooltip/tooltip.js",
  () => ({
    // Mock implementation

    someFunction: () => "",
  })
);

test("applies dagre layout", () => {
  // my brain hurts right now. I have to pivot to something else? .>?<>?
  // const layout = createLayout()
});

test("extracting contents under outline", () => {
  // setup
  const bodyElement = new BodyElement();
  const dom = bodyElement.studioPageData.content.body.querySelector("body")!;
  const { config, dirty } = bodyElement.processDocument(dom);

  // test
  const extractContentsConfig: ExtractContentsConfig = {
    mode: ExtractContentsMode.SUB_HEADING,
  };
  const newBody = new DOMParser().parseFromString(dom.innerHTML, "text/html");
  const outline = config.outline;
  extractContentsUnderOutline(extractContentsConfig, newBody, outline[0]);
});
// test('calculates dimensions: height & width', () => {
// const headersLeft: Outline[] = [
// 		{h: "H1", name: "1", id: "3"},
// 		{h: "H3", name: "1.0.1", id: "9"},
// 		{h: "H4", name: "1.0.1.1", id: "6"},
// 		{h: "H2", name: "1.1", id: "22"},
// 		{h: "H4", name: "1.0.0.2", id: "6"},
// 		{h: "H4", name: "1.0.0.3", id: "6"},
// 		{h: "H1", name: "2", id: "5"},
// 		{h: "H2", name: "2.1", id: "4"},
// 		{h: "H2", name: "2.2", id: "4"},
// 		{h: "H2", name: "2.3", id: "4"},
// 	]

// 		const outlineSubtype: OutlineSubtype = {
// 			parent: null,
// 			self: defaultParentOutline,
// 			children: [],
// 		}

// expandOutlineRecursively(outlineSubtype, headersLeft)

// const dimensions = findDimensions(outlineSubtype)

// // H0 - H1 - H3 - H4
// expect(dimensions.height).toBe(4)
// expect(dimensions.width).toBe(3)

// 	let headersLeft2: Outline[] = [
// 		{h: "H1", name: "1", id: "3"},
// 		{h: "H3", name: "1.0.1", id: "9"},
// 		{h: "H4", name: "1.0.0.1", id: "6"},
// 		{h: "H2", name: "1.1", id: "22"},
// 		{h: "H4", name: "1.0.0.2", id: "6"},
// 		{h: "H4", name: "1.0.0.3", id: "6"},
// 		{h: "H1", name: "2", id: "5"},
// 		{h: "H2", name: "2.1", id: "4"},
// 		{h: "H2", name: "2.2", id: "4"},
// 		{h: "H2", name: "2.3", id: "4"},
// 		{h: "H2", name: "2.4", id: "4"},
// 		{h: "H2", name: "2.5", id: "4"},
// 		{h: "H2", name: "2.6", id: "4"},
// 		{h: "H2", name: "2.7", id: "4"},
// 		{h: "H2", name: "2.8", id: "4"},
// 		{h: "H3", name: "2.8.1", id: "4"},
// 		{h: "H4", name: "2.8.1.1", id: "4"},
// 		{h: "H5", name: "2.8.1.1.1", id: "4"},
// 		{h: "H6", name: "2.8.1.1.1.1", id: "4"},
// 	]

// 		const outlineSubtype2: OutlineSubtype = {
// 			parent: null,
// 			self: defaultParentOutline,
// 			children: [],
// 		}

// expandOutlineRecursively(outlineSubtype2, headersLeft2)

// const dimensions2 = findDimensions(outlineSubtype2)

// // H0 - H1 - H2 - H3 - H4 - H5 - H6
// expect(dimensions2.height).toBe(7)
// expect(dimensions2.width).toBe(8)
// })

// test('determinining size of a node', () => {
// let sizeOfNode = determineSizeOfNode(100, 2, 10, 0);

// expect(sizeOfNode).toBe(45)

// sizeOfNode = determineSizeOfNode(100, 2, 10, 10);

// expect(sizeOfNode).toBe(40)

// sizeOfNode = determineSizeOfNode(800, 5, 20, 5);

// expect(sizeOfNode).toBe(143)

// })

// const printGraph = (data: any, spaces: string) => {
// 	if (!data) return

// 	console.debug(spaces, data.graph)

// 	for (const child of data.children) {
// 		printGraph(child, spaces + " ")
// 	}
// }

// test('attachPositioning', () => {
// 	const headersLeft: Outline[] = [
// 		{h: "H1", name: "1", id: "3"},
// 		{h: "H3", name: "1.0.1", id: "9"},
// 		{h: "H4", name: "1.0.1.1", id: "6"},
// 		{h: "H2", name: "1.1", id: "22"},
// 		{h: "H4", name: "1.0.0.2", id: "6"},
// 		{h: "H4", name: "1.0.0.3", id: "6"},
// 		{h: "H1", name: "2", id: "5"},
// 		{h: "H2", name: "2.1", id: "4"},
// 		{h: "H2", name: "2.2", id: "4"},
// 		{h: "H2", name: "2.3", id: "4"},
// 	]

// 	const outlineSubtype: OutlineSubtype = {
// 		parent: null,
// 		self: defaultParentOutline,
// 		children: [],
// 	}

// expandOutlineRecursively(outlineSubtype, headersLeft)

// attachPositioning({
// 	positioningStrategy: PositiningStrategy.TREE,
// 	direction: Direction.HORIZONTAL,
// 	sizeOfCanvas: {
// 		height: 800,
// 		width: 1260
// 	},
// 	paddingWidthStart: 10,
// 	spacingWidthSize: 10,
// 	paddingHeightStart: 10,
// 	spacingHeightSize: 10,
// }, outlineSubtype)

// printGraph(outlineSubtype, "")

// })
