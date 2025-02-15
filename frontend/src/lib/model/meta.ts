export const BOOKERA_STUDIO: string = "Studio";
export const MANUSCRIPT: string =
  "/" + BOOKERA_STUDIO.toLocaleLowerCase() + "/manuscript";

export const BACK_TO_STUDIO: string = "<- Studio";

export const productItems: string[] = ["Catalog", BOOKERA_STUDIO];

export const StudioProductItems: string[] = [BACK_TO_STUDIO];

export const companyItems: string[] = [
  // "Docs",
  // "Company"
];

export const dashedCase = (item: string): string => {
  // @ts-ignore
  return item.replaceAll(" ", "-").toLowerCase();
};

export const titleCase = (item: string | string[]): string => {
  if (typeof item === "string") {
    return item.split(/(?=[A-Z])/).join(" ");
  }
  // @ts-ignore
  return item
    .map((char) => char.charAt(0).toUpperCase() + char.slice(1))
    .join(" ");
};

export const joinedTitleCase = (item: string) => {
  return item.split(" ").join("");
};

export const routes: string[] = [
  ...productItems.map((item) => dashedCase(item)),
  ...companyItems.map((item) => dashedCase(item)),
];

export const navSize: string = 85;
