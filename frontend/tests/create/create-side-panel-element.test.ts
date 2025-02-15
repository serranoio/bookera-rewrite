// sum.test.js
import { expect, test, vi } from "vitest";
import "../../src/components/create/create-side-panel-element";
import {
  CreateSidePanelElement,
  OutlineSubtype,
  defaultParentOutline,
  expandOutlineRecursively,
} from "../../src/components/create/create-side-panel-element";
import { Outline } from "../../src/lib/model/context";

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

test("construct tree with regular case", () => {
  const createSidePanelElement = new CreateSidePanelElement();

  const headersLeft: Outline[] = [
    { h: "H1", name: "hello", id: "3" },
    { h: "H2", name: "hello", id: "4" },
    { h: "H3", name: "hello", id: "5" },
    { h: "H4", name: "hello", id: "6" },
    { h: "H5", name: "hello", id: "7" },
  ];

  // const self = headersLeft?.shift()!;

  const outlineSubtype: OutlineSubtype = {
    parent: null,
    self: defaultParentOutline,
    children: [],
  };

  expandOutlineRecursively(outlineSubtype, headersLeft);

  expect(outlineSubtype.children.length).toBe(1);

  // This is where I can mock all of the use cases.

  // Congrats David, you are no longer fighting the desire to get as much as you can done. THat is out of your control
  // what is in your control is the fact that you are improving. That you can always control. Great!
  // You setup your tests, now you can test for every use case in the functions.
  // this will also make you conscious of the functions that you are writing so that they are testable
});

test("construct tree with H1 having 3 children", () => {
  const headersLeft: Outline[] = [
    { h: "H1", name: "hello", id: "3" },
    // {h: "H5", name: "hello", id: "7"},
    { h: "H4", name: "hello", id: "6" },
    { h: "H3", name: "hello", id: "5" },
    { h: "H2", name: "hello", id: "4" },
  ];

  const outlineSubtype: OutlineSubtype = {
    parent: null,
    self: defaultParentOutline,
    children: [],
  };

  expandOutlineRecursively(outlineSubtype, headersLeft);

  expect(outlineSubtype.children[0].children.length).toBe(3);

  // This is where I can mock all of the use cases.

  // Congrats David, you are no longer fighting the desire to get as much as you can done. THat is out of your control
  // what is in your control is the fact that you are improving. That you can always control. Great!
  // You setup your tests, now you can test for every use case in the functions.
  // this will also make you conscious of the functions that you are writing so that they are testable
});

test("randomness", () => {
  const headersLeft: Outline[] = [
    { h: "H1", name: "1", id: "3" },
    { h: "H4", name: "1.0.0.1", id: "6" },
    { h: "H4", name: "1.0.0.2", id: "6" },
    { h: "H4", name: "1.0.0.3", id: "6" },
    { h: "H1", name: "2", id: "5" },
    { h: "H2", name: "2.1", id: "4" },
    { h: "H2", name: "2.2", id: "4" },
    { h: "H2", name: "2.3", id: "4" },
  ];

  const outlineSubtype: OutlineSubtype = {
    parent: null,
    self: defaultParentOutline,
    children: [],
  };

  expandOutlineRecursively(outlineSubtype, headersLeft);

  expect(outlineSubtype.children.length).toBe(2);
  // 1
  expect(outlineSubtype.children[0].children.length).toBe(3);
  expect(outlineSubtype.children[1].children.length).toBe(3);

  // This is where I can mock all of the use cases.

  // Congrats David, you are no longer fighting the desire to get as much as you can done. THat is out of your control
  // what is in your control is the fact that you are improving. That you can always control. Great!
  // You setup your tests, now you can test for every use case in the functions.
  // this will also make you conscious of the functions that you are writing so that they are testable
});

test("randomness pt 2", () => {
  const headersLeft: Outline[] = [
    { h: "H1", name: "1", id: "3" },
    { h: "H3", name: "1.0.1", id: "9" },
    { h: "H4", name: "1.0.0.1", id: "6" },
    { h: "H2", name: "1.1", id: "22" },
    { h: "H4", name: "1.0.0.2", id: "6" },
    { h: "H4", name: "1.0.0.3", id: "6" },
    { h: "H1", name: "2", id: "5" },
    { h: "H2", name: "2.1", id: "4" },
    { h: "H2", name: "2.2", id: "4" },
    { h: "H2", name: "2.3", id: "4" },
  ];

  const outlineSubtype: OutlineSubtype = {
    parent: null,
    self: defaultParentOutline,
    children: [],
  };

  expandOutlineRecursively(outlineSubtype, headersLeft);

  expect(outlineSubtype.children.length).toBe(2);
  // 1
  expect(outlineSubtype.children[0].children.length).toBe(2);
  expect(outlineSubtype.children[1].children.length).toBe(3);

  // This is where I can mock all of the use cases.

  // Congrats David, you are no longer fighting the desire to get as much as you can done. THat is out of your control
  // what is in your control is the fact that you are improving. That you can always control. Great!
  // You setup your tests, now you can test for every use case in the functions.
  // this will also make you conscious of the functions that you are writing so that they are testable
});

test('construct tree with two H1"s', () => {
  const headersLeft: Outline[] = [
    { h: "H1", name: "h1", id: "3" },
    { h: "H4", name: "h4", id: "6" },
    { h: "H1", name: "h1", id: "5" },
    { h: "H2", name: "h2", id: "4" },
  ];

  const outlineSubtype: OutlineSubtype = {
    parent: null,
    self: defaultParentOutline,
    children: [],
  };

  expandOutlineRecursively(outlineSubtype, headersLeft);

  expect(outlineSubtype.children.length).toBe(2);

  expect(outlineSubtype.children[0].self.name).toBe("h1");
  expect(outlineSubtype.children[1].self.name).toBe("h1");

  expect(outlineSubtype.children[0].children[0].self.name).toBe("h4");

  // This is where I can mock all of the use cases.

  // Congrats David, you are no longer fighting the desire to get as much as you can done. THat is out of your control
  // what is in your control is the fact that you are improving. That you can always control. Great!
  // You setup your tests, now you can test for every use case in the functions.
  // this will also make you conscious of the functions that you are writing so that they are testable
});
