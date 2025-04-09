import { css } from 'lit';
export default css`
  h4 {
    text-align: start;
    border-bottom: 2px solid var(--slate-200);
    margin-left: 2px;
  }
  .title-box {
    display: flex !important;
    align-items: center;
    margin-bottom: var(--spacingMedium);
  }
  sl-icon-button {
    font-size: 20px;
  }
  sl-icon-button::part(base) {
    padding: 0;
    padding-right: var(--spacingSmall);
  }
  h5 {
    margin-bottom: var(--spacingSmall);
  }
  p {
    margin-bottom: var(--spacingXSmall);
  }
  .column-layout div {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: stretch;
    gap: var(--spacingSmall);
  }
  .column-layout sl-icon-button {
    font-size: 24px;
  }

  .icon-button {
    position: absolute;
    right: 0;
  }

  .column-layout {
    display: flex;
    gap: var(--spacingMedium);
    margin: var(--spacing) 0 var(--spacingMedium) 0;
  }

  .colors-box {
    overflow: hidden;
    height: 40rem;
    width: 100%;
    position: relative;
  }

  .button-container {
    gap: var(--spacingXSmall);
  }

  .colors {
    gap: var(--spacingLarge);
    margin-bottom: var(--spacingSmall);

    display: none !important;
  }

  .show {
    display: flex !important;
  }

  .shade-group {
    gap: var(--spacingLarge);
  }

  .color-palette-name {
    margin: var(--spacingMedium) 0 var(--spacingSmall) 0;
  }
  .color-palette-name p {
    margin-top: var(--spacingSmall);
  }

  .custom-color-palettes {
    margin-bottom: var(--spacingSmall);
  }
  .select-palette-section {
  }

  .color-palettes {
    flex-direction: column;
    justify-content: stretch;
    gap: var(--spacingXSmall);
    max-height: 10rem;
    overflow-y: scroll;
  }

  .color-palette-item {
    background-color: var(--slate-100);
  }

  .selected-color-palette::part(base) {
    background-color: var(--primary);
  }

  .name-color-palette {
    margin-top: var(--spacingSmall);
    margin-bottom: var(--spacingSmall);
  }
`;
