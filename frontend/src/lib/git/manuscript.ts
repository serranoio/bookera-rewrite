import fs, { rm } from "@zenfs/core";
import { getManuscriptFromURL } from "../../components/create/studio/extra-element";
import { Git, addNewManuscript, getDir } from "./fs";
import localforage from "localforage";
import { notify } from "../model/lit";
import { UploadedFile } from "../../pages/studio-element";
import { marked } from "marked";
// or const { marked } = require('marked');
import { parse, stringify } from "yaml";
import { FileConversion, MdImage } from "./file-conversion";

export const ManuscriptStoreName = "manuscripts";
export const ManuscriptStore = localforage.createInstance({
  name: ManuscriptStoreName,
});
export class Manuscript {
  // file path
  name: string;
  fileName: string;
  version: number;
  date: Date;
  body?: string;
  assets?: MdImage[];

  constructor(
    name: string,
    fileName: string,
    version: number,
    date: Date,
    body: string
  ) {
    this.name = name;
    this.fileName = fileName;
    this.version = version;
    this.date = date;
    this.body = body;
  }

  turnManuscriptIntoJSON(): string {
    return `
		{
			${Object.entries(this).map((kv) => {
        const value = kv[1];
        if (typeof kv[1] === "string") {
          kv[1] = kv[1].replaceAll('"', "'");
          console.log(value);
        }

        return `"${kv[0]}": "${kv[1]}"\n`;
      })}
		}
		`;
  }

  static async WriteManuscriptsToLF(
    allManuscripts: Manuscript[],
    onFS = false
  ) {
    // * If a manuscript already exists in lf, we do not need to write them to lf
    if (onFS) {
      const manuscript = await ManuscriptStore.getItem(
        allManuscripts[0].fileName
      );

      if (manuscript && manuscript.length > 0) return;
    }

    for (let i = 0; i < allManuscripts.length; i++) {
      const manuscript = allManuscripts[i];
      const json = JSON.stringify(manuscript);
      await ManuscriptStore.setItem(manuscript.fileName, json);
    }
  }

  static WriteManuscriptToFS(
    manuscript: Manuscript,
    author: { name: string; email: string } = {
      name: "Bookera",
      email: "bookera@bookera",
    },
    commitMessage: string = "new manuscript"
  ) {
    const json = JSON.stringify(manuscript);

    fs.writeFileSync(manuscript.fileName, json);
    Git.Add(manuscript.fileName);
    Git.Commit(author, commitMessage);
  }

  static SaveManuscriptFSLF(manuscript: Manuscript) {
    Manuscript.WriteManuscriptsToLF([manuscript], false);
    Manuscript.WriteManuscriptToFS(
      manuscript,
      { name: "Bookera", email: "bookera@bookera" },
      "manuscript change"
    );
  }

  static ReadManuscript(fileName: string) {
    let contents;
    contents = fs.readFileSync(fileName);
    const obj = JSON.parse(contents.toString());

    return obj;
  }

  static async DeleteManuscript(manuscript: Manuscript) {
    await ManuscriptStore.removeItem(manuscript.fileName);

    await rm(manuscript.fileName, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  static async SaveManuscriptToFS() {
    await getDir();

    const title = getManuscriptFromURL();
    let manuscript = await this.ReadManuscriptFromLF(title);
    manuscript = new Manuscript(
      manuscript.name,
      manuscript.fileName,
      manuscript.version,
      manuscript.date,
      manuscript.body
    );
    Manuscript.WriteManuscriptToFS(manuscript);

    notify("Manuscript saved", "success", "check2-all");

    return manuscript;
  }

  static async ReadManuscriptFromLF(fileName: string): Promise<Manuscript> {
    const contents = await ManuscriptStore.getItem(fileName);

    const obj = JSON.parse(contents.toString());

    return obj;
  }

  static ImportFiles(files: UploadedFile[]) {
    let content = "";

    let assets: MdImage[] = [];

    files.forEach((file) => {
      assets.push(...FileConversion.parseContentsForImages(file.contents));

      content += FileConversion.parseFile(file);
    });

    const manuscript = new Manuscript(
      "new manuscript",
      "new-manuscript.json",
      0,
      new Date(),
      content
    );

    manuscript.assets = assets;

    console.log(manuscript.assets);

    addNewManuscript(manuscript, (manuscript: Manuscript) => {
      console.log("finished uploading new  manuscript");
      Manuscript.MakeManuscriptURL(manuscript);
    });
  }

  static MakeManuscriptURL(manuscript: Manuscript) {
    window.location.href = `/studio/manuscript?manuscript=${manuscript.fileName.slice(
      0,
      -5
    )}&version=${manuscript.version}`;
  }

  static GetManuscriptURL(manuscript: Manuscript): string {
    return `/studio/manuscript?manuscript=${manuscript.fileName.slice(
      0,
      -5
    )}&version=${manuscript.version}`;
  }
}
