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

// *
test("batch upload .md", () => {});

// *
test("when uploading .md, you can rearrange the content", () => {
  let array = [
    {
      index: "o",
      val: "o",
      ok: "o",
    },
    {
      index: "p",
      val: "p",
      ok: "p",
    },
    {
      index: "j",
      val: "j",
      ok: "j",
    },
  ];

  let newOrder = ["p", "j", "o"];

  const newArray = changeArrayOrderBasedOnField(array, newOrder, "index");

  expect(newArray[0].index).toEqual("p");
  expect(newArray[1].index).toEqual("j");
  expect(newArray[2].index).toEqual("o");

  newOrder = [2, 0, 1];

  const newArray2 = changeArrayOrderBasedOnOrder(array, newOrder);

  expect(newArray2[0].val).toEqual("p");
  expect(newArray2[1].val).toEqual("j");
  expect(newArray2[2].val).toEqual("o");
});

async function readFileContent(filePath: string): Promise<string> {
  try {
    const fullPath = join(process.cwd(), filePath);
    const content = await readFile(fullPath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

// !
test("when uploading .md, parse through files to see if there are any linked images so that we can display them, indicate files that contain broken images", async () => {
  // 1. upload file,
  // 2. parse image for md files
  // 3. match 2. to the uploaded images by file name

  const file: UploadedFile = {
    name: "tests/manuscript/flow.md",
    type: ".md",
    contents: "",
  };

  const contents = await readFileContent(file.name);
  file.contents = contents;

  const images = FileConversion.parseContentsForImages(file.contents);

  expect(images.map((mdImage: MdImage) => mdImage.str)).toEqual([
    "![Wrong Flow State Model](/img/wrong-model.png)",
    "![The Right Flow State model](/img/left-v-right.png)",
    "![The 3 Flow Stages](/img/flow-stages.png)",
    "![The Mind As A Lightning Storm](/img/lightning-storm.png)",
    "![The Stages](/img/stages.png)",
  ]);
});

// !
test("if an image is uploaded & it is one of the linked images, mark the image as green. & do not add the image to the list", async () => {});

// !
test("if an image is uploaded & it is not one of the linked images, add it to the bottom of the list", async () => {});

// !
test("if an image is at the bottom of the list & a file is uploaded containing that image, remove the image & link it to the file", async () => {});

// !
test("if the same image is being used by two different files, it will still be added", async () => {});

// !
test("convert linked articles into /a links", async () => {});

// & saved for later, I don't need this functionality right now.

// !
test("batch upload .txt", () => {});

// !
test("batch upload .docx", () => {});
