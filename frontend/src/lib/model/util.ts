import { SlMenuItem } from '@shoelace-style/shoelace';
import { styleMap } from 'lit/directives/style-map.js';

function convertNumberMonthToStringMonth(month: number) {
  switch (month) {
    case 1:
      return 'Jan';
    case 2:
      return 'Feb';
    case 3:
      return 'Mar';
    case 4:
      return 'Apr';
    case 5:
      return 'May';
    case 6:
      return 'Jun';
    case 7:
      return 'Jul';
    case 8:
      return 'Aug';
    case 9:
      return 'Sep';
    case 10:
      return 'Oct';
    case 11:
      return 'Nov';
    case 12:
      return 'Dec';
  }
}

export function formatDate(date) {
  date = new Date(date);

  var month = date.getMonth() + 1,
    day = '' + date.getDate(),
    hour = '' + date.getHours(),
    minute = '' + date.getMinutes();

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
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
];

export const intersection = (a: any, b: any) => {
  if (a.includes(b) || b.includes(a)) {
    return true;
  }

  return false;
};

export const dashedCase = (item: string): string => {
  // @ts-ignore
  return item.replaceAll(' ', '-').toLowerCase();
};

export const doesClickContainElement = <T = HTMLElement>(
  event: any,
  config: {
    nodeName?: string;
    className?: string;
  }
): T | null => {
  if (config.className) {
    config.className =
      config.className[0] === '.' ? config.className : `.${config.className}`;
  }

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

export function sendGlobalEvent<Type>(eventName: string, detail?: Type) {
  sendEvent(document, eventName, detail);
}

export function sendEvent<Type>(that: any, eventName: string, detail?: Type) {
  that.dispatchEvent(
    new CustomEvent<Type>(eventName, {
      composed: true,
      bubbles: true,
      detail: detail,
    })
  );
}

export const addStyles = (styles: any) => {
  return styleMap(styles);
};

export function genUUID(): string {
  let uuid: string = '',
    i: number,
    random: number;
  for (i = 0; i < 32; i++) {
    random = (Math.random() * 16) | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
  }
  return uuid;
}

export function genShortID(length: number): string {
  function randomString(length: number, chars: string) {
    var result = '';
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
  return randomString(
    length,
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  );
}

export const BOOKERA_STUDIO: string = 'Studio';
export const MANUSCRIPT: string =
  '/' + BOOKERA_STUDIO.toLocaleLowerCase() + '/manuscript';

export const BACK_TO_STUDIO: string = '<- Studio';

export const productItems: string[] = ['Catalog', BOOKERA_STUDIO];

export const StudioProductItems: string[] = [BACK_TO_STUDIO];

export const companyItems: string[] = [
  // "Docs",
  // "Company"
];

export const titleCase = (item: string | string[]): string => {
  if (typeof item === 'string') {
    return item.split(/(?=[A-Z])/).join(' ');
  }
  // @ts-ignore
  return item
    .map((char) => char.charAt(0).toUpperCase() + char.slice(1))
    .join(' ');
};

export const joinedTitleCase = (item: string) => {
  return item.split(' ').join('');
};

export const routes: string[] = [
  ...productItems.map((item) => dashedCase(item)),
  ...companyItems.map((item) => dashedCase(item)),
];

export const navSize: string = 85;

export function transformVariableIntoKey(variable: any): string {
  return dashedCase(Object.keys({ variable })[0]);
}

export function swapBasedOnKey<T extends Record<string, any>, V>(
  array: T[],
  property: string,
  value: V,
  value2: V
) {
  let pos1 = -1;
  let pos2 = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i][property] === value) {
      pos1 = i;
    }

    if (array[i][property] === value2) {
      pos2 = i;
    }
  }

  let temp;

  temp = array[pos1];
  array[pos1] = array[pos2];
  array[pos2] = temp;

  return array;
}
