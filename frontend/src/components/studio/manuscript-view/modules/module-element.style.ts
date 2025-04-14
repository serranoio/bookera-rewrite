import { css } from 'lit';
export default css`
  .panel-container {
    padding: var(--spacing);
  }

  h4 {
    text-align: start;
    border-bottom: 2px solid var(--slate-200);
    margin-left: 2px;
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

  .title-box {
    display: flex !important;
    align-items: center;
    margin-bottom: var(--spacing);
    position: relative;
  }

  .icon-button {
    position: absolute;
    right: 0;
  }
  .column-layout {
    display: flex;
    gap: var(--spacingMedium);
    margin: var(--spacing) 0 0 0;
  }

  section {
    margin-bottom: var(--spacing);
  }

  sl-icon-button {
    font-size: 20px;
  }
  sl-icon-button::part(base) {
    padding: 0;
    padding-right: var(--spacingSmall);
  }
  h5 {
    /* margin-bottom: var(--spacingSmall); */
  }
  p {
    margin-bottom: var(--spacingXSmall);
  }

  .side-panel h4 {
    margin-left: 2px;
  }

  .side-panel .title-box {
    padding: var(--spacingXXSmall) var(--spacingSmall);
    border-bottom: 1px solid var(--slate-200);
    margin-bottom: var(--spacingSmall);
  }

  .side-panel sl-icon-button {
    font-size: 18px;
  }
`;
