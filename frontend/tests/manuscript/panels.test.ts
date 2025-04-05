import { expect, test, vi } from "vitest";
import {
  changeArrayOrderBasedOnField,
  changeArrayOrderBasedOnOrder,
} from "../../src/lib/model/util";
import { Manuscript } from "../../src/lib/git/manuscript";
import { FileConversion, MdImage } from "../../src/lib/git/file-conversion";
import { UploadedFile } from "../../src/pages/studio-element";
import { readFile } from "fs/promises";
import { join } from "path";
import { e } from "@vite-pwa/assets-generator/shared/assets-generator.5e51fd40";

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

vi.mock("froala-editor", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("https:", () => ({
  https: {
    get: vi.fn(),
    request: vi.fn(),
    // Add other methods as needed
  },
}));
// instead of adding a new file from scratch, we can upload a new file

// * if panel is last, disable right handle
test("", () => {});

// * last panel should always resize to be 100%
test("", () => {});

// * render tabs
test("", () => {});

// * last panel should always resize to be 100%
test("", () => {});

// * last panel should always resize to be 100%
test("", () => {});

// & make the panels a reference to the dom instead

// ! if there is a panel at minimum width, you cannot resize the panels before it further.
test("", () => {});

// * splitting a panel means that the new panel takes up the old panels width
test("", () => {});

// * closing last panel makes the last panel 100% and the right panel is 0
test("", () => {});

// & panel tabs
// * You can drag tabs to move the panels around by tab order
test("", () => {});

// * panel tabs are draggable to other tab bars.
// * & the panels follow suit
// * & the panels are highlighted
test("", () => {});

// * panel tab names don't wrap
test("", () => {});

// * panel tabs can be added by the top bar
test("", () => {});

// * you can drag panel tabs into creating new panels
// * drag to left side, split left, take up left side
// * drag to right side, split right, take up right side
// * drag to middle, take up whole space
// * you cannot drag this into this.
test("", () => {});
