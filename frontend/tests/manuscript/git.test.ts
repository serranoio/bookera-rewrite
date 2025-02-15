import { expect, test, vi } from "vitest";

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
// *
test("initialize file system", () => {});

// *
test("initialize git repo", () => {});

// !
test("make changes to git (git commit)", () => {});

// !
test("add git versioning to your manuscripts", () => {});

// !
test("sync git repo with git repo on internet!", () => {});

// *
test("the manuscript loads the data via read manuscript", () => {});

// *
test("add a new manuscript", () => {});

// !
test("add a new manuscript with a template", () => {});

// !
test("saves site settings locally for right panel, for each manuscript", () => {});

// !
test("logic in nav element should be changed to logic in manuscript.ts", () => {});

// *
test("Changes are saved when you press save", () => {});

// *
test("change navbar into dynamic island ;)", () => {});
