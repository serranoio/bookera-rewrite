import { expect, test, vi } from 'vitest';
import { swapBasedOnKey } from '../../src/lib/model/util';

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/split-panel/split-panel.js',
  () => ({
    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tree/tree.js',
  () => ({
    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab/tab.js',
  () => ({
    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab-group/tab-group.js',
  () => ({
    // Mock implementation

    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tab-panel/tab-panel.js',
  () => ({
    // Mock implementation

    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/tree-item/tree-item.js',
  () => ({
    // Mock implementation

    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/components/details/details.js',
  () => ({
    // Mock implementation

    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/icon-button/icon-button.js',
  () => ({
    // Mock implementation

    someFunction: () => '',
  })
);

vi.mock(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/tooltip/tooltip.js',
  () => ({
    // Mock implementation

    someFunction: () => '',
  })
);

// *
test('hovering tab highlights it', () => {});

// !
test('not hovering tab removes event listener', () => {});

// *
test('not hovering tab removes event listener', () => {
  const newArr = swapBasedOnKey(
    [
      { id: '1', name: 'test' },
      { id: '2', name: 'test2' },
    ],
    'id',
    '1',
    '2'
  );

  console.log(newArr);
});
