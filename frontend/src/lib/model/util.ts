import { styleMap } from "lit/directives/style-map.js";

function convertNumberMonthToStringMonth(month: number) {
  switch (month) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
  }
}

export function formatDate(date) {
  date = new Date(date);

  var month = date.getMonth() + 1,
    day = "" + date.getDate(),
    hour = "" + date.getHours(),
    minute = "" + date.getMinutes();

  return `${convertNumberMonthToStringMonth(month)} ${day} ${hour}:${minute}`;
}

export const changeArrayOrderBasedOnField = (
  changeArray: any[],
  newOrderArray: any[],
  fieldToLookFor: any
): any[] => {
  let newArray: any[] = [];

  newOrderArray.forEach((item) => {
    const el = changeArray.find((element) => {
      return element[fieldToLookFor] === item;
    });

    newArray.push(el);
  });

  return newArray;
};

export const changeArrayOrderBasedOnOrder = (
  changeArray: any[],
  orders: any[]
): any[] => {
  changeArray = changeArray.map((item, i) => {
    return {
      ...item,
      index: orders[i],
    };
  });
  console.log(changeArray, orders);

  changeArray.sort(function (a, b) {
    return a.index - b.index;
  });
  console.log(changeArray, orders);

  return changeArray;
};

export const acceptedImageTypes = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
];

export const intersection = (a: any, b: any) => {
  if (a.includes(b) || b.includes(a)) {
    return true;
  }

  return false;
};

export const dashedCase = (item: string): string => {
  // @ts-ignore
  return item.replaceAll(" ", "-").toLowerCase();
};

export const doesClickContainElement = (
  event: any,
  config: {
    nodeName?: string;
    className?: string;
  }
): HTMLElement | null => {
  if (
    event.target.classList.contains(config?.className) ||
    event.target.nodeName === config?.nodeName
  ) {
    return event.target;
  }

  if (event.target.closest(config?.nodeName)) {
    return event.target.closest(config?.nodeName);
  }

  if (event.target.closest(config?.className)) {
    return event.target.closest(config?.className);
  }

  return null;
};

export const sendEvent = (that: any, eventName: string, detail: any) => {
  that.dispatchEvent(
    new CustomEvent(eventName, {
      composed: true,
      bubbles: true,
      detail: detail,
    })
  );
};

export const addStyles = (styles: any) => {
  return styleMap(styles);
};
