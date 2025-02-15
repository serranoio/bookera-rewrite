const dirName = "bookera";

import { configureSingle, fs } from "@zenfs/core";
import { WebAccess, WebAccessFS } from "@zenfs/dom";
import {
  defaultStudioPageDataReal,
  testStudioPageData,
  testStudioPageData2,
} from "../model/context";
import git from "isomorphic-git";
import localforage from "localforage";
import { Manuscript } from "./manuscript";
import { UploadedFile } from "../../pages/studio-element";

// ! I need to make it so that the ENTIRE book is saved

const LS_MANUSCRIPTS = "manuscripts";
export const LS_DIR_HANDLE = "dir-handle";
export const ASSET_STORE_HANDLE = "assets";

export const store = localforage.createInstance({
  name: "fs",
});

export const assetStore = localforage.createInstance({
  name: ASSET_STORE_HANDLE,
});

// console.log(defaultStudioPageData);
export async function getDir() {
  const dirHandle: FileSystemDirectoryHandle =
    await window.showDirectoryPicker();

  store.setItem(LS_DIR_HANDLE, dirHandle);

  await configureSingle({ backend: WebAccess, handle: dirHandle });

  return dirHandle;
}

export const addImage = (file: UploadedFile) => {
  // const fileReader = new FileReader();

  // fileReader.readAsDataURL(file.file);

  // fileReader.onload = () => {
  // fs.writeFileSync(file.name, fileReader.result);
  // assetStore.setItem(file.name, fileReader.result);
  fs.writeFileSync(file.name, file.file);
  assetStore.setItem(file.name, file.file);
  // };
};

export const addNewManuscript = (
  newManuscript: Manuscript | null = null,
  callback: (manuscript: Manuscript) => void
) => {
  // @ts-ignore
  let manuscript: Manuscript = {};

  if (!newManuscript) {
    manuscript = new Manuscript(
      "Untitled",
      "untitled",
      1,
      new Date(),
      defaultStudioPageDataReal.content.body.querySelector("body")!.innerHTML
    );
  } else {
    manuscript = newManuscript;
  }

  console.log(manuscript);

  // we need to make sure there aren't already manuscripts labeled untitled

  let untitledCount = 0;
  fs.readdir("/", (err, files) => {
    if (err) throw err;

    files?.forEach((file) => {
      if (!file.includes(".json")) return;

      // if we find an untitled file, go up a count
      if (file.includes("untitled")) {
        untitledCount++;
      }
    });

    let num = untitledCount === 0 ? "" : `-${untitledCount}`;

    manuscript.fileName = `untitled${num}.json`;

    num = untitledCount === 0 ? "" : ` ${untitledCount}`;

    manuscript.name = `Untitled${num}`;

    Manuscript.WriteManuscriptToFS(manuscript);
    Manuscript.WriteManuscriptsToLF([manuscript]);
    callback(manuscript);
  });
};

const addDefaultManuscript = () => {
  const manuscript = new Manuscript(
    "The Ballad Of Programata",
    "the-ballad-of-programata.json",
    1,
    new Date(),
    testStudioPageData.content.body.querySelector("body")!.innerHTML
  );

  const manuscript2 = new Manuscript(
    "The Ballad Of Programata 2",
    "the-ballad-of-programata-2.json",
    1,
    new Date(),
    testStudioPageData2.content.body.querySelector("body")!.innerHTML
  );

  try {
    // if manuscript already exists in FS
    Manuscript.ReadManuscript(manuscript.fileName);
  } catch (e) {
    Manuscript.WriteManuscriptToFS(manuscript);
    Manuscript.WriteManuscriptToFS(manuscript2);
  }
};

const readAllManuscripts = async (
  callback: (manuscripts: Manuscript[]) => void
) => {
  let allManuscripts: Manuscript[] = [];

  return fs.readdir("/", (err, files) => {
    if (err) throw err;

    files?.forEach((file) => {
      if (!file.includes(".json")) return;
      allManuscripts.push(Manuscript.ReadManuscript(`/${file}`));
    });

    callback(allManuscripts);
  });
};

export class Git {
  static InitGit = async () => {
    try {
      await git.init({ fs, dir: "" });
    } catch (e) {
      console.log(e);
    }
  };

  static Add = async (filepath: string) => {
    try {
      await git.add({ fs, dir: "", filepath: filepath });
    } catch (e) {
      console.log(e);
    }
  };

  static Commit = async (
    author: { name: string; email: string },
    message: string
  ) => {
    try {
      await git.commit({ fs, dir: "", author: author, message: message });
    } catch (e) {
      console.log(e);
    }
  };
}

export async function initializeFS(
  callback: (allManuscripts: Manuscript[]) => void
) {
  Git.InitGit();

  addDefaultManuscript();

  return readAllManuscripts(callback);
}
