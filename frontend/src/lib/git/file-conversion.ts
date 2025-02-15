import { parse } from "yaml";
import { UploadedFile } from "../../pages/studio-element";
import { marked } from "marked";

export interface MdImage {
  str: string;
  fileName: string;
  alt: string;
}

export class FileConversion {
  static parseContentsForImages(fileContents: string): MdImage[] {
    const matches = fileContents.matchAll(new RegExp(/!\[.+]\(.+\)/, "g"));
    let images: MdImage[] = [];
    for (const match of matches) {
      const str = match.toString();
      const firstMatch = str.match(new RegExp(/\[.+]/, "g"));
      const secondMatch = str.match(new RegExp(/\(.+\)/, "g"));

      const mdImage: MdImage = {
        str: str,
        fileName: secondMatch?.toString().slice(1, -1)!,
        alt: firstMatch?.toString().slice(1, -1)!,
      };

      mdImage.fileName = mdImage.fileName.slice(
        mdImage.fileName.lastIndexOf("/") + 1,
        mdImage.fileName.length
      );
      images.push(mdImage);
    }

    return images;
  }

  static parseFile(file: UploadedFile) {
    console.log(file.type);

    if (file.type === ".md") {
      // & yaml start
      const matches = file.contents.matchAll(new RegExp("---", "g"));

      // & not every md file has a yaml section
      let indexes: number[] = [];
      let found = 0;
      for (const match of matches) {
        if (found === 2) break;
        indexes.push(match.index);
        found++;
      }

      let yamlObj = null;
      if (found === 2) {
        // now that we have the top of the md file, let's turn it into yaml
        yamlObj = parse(file.contents.slice(indexes[0] + 3, indexes[1]));
      }
      // & yaml end

      // ^ we need to figure out how to convert image urls in

      const fileContents = file.contents.slice(
        indexes[1],
        file.contents.length
      );
      const html = marked.parse(fileContents);

      return html;
    } else if (file.type === ".txt") {
    }
  }
}
