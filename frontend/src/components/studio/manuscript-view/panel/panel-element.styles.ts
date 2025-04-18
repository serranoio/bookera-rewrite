import { css } from 'lit';
export default css`
  :host {
    display: inline;
    position: relative;
  }

  #panel-container {
    background-color: var(--slate-50);
    height: 100%;
    position: relative;
    /* padding: 0 2px; */
  }

  .content-container {
    overflow-y: scroll;
  }

  .tab-list-container {
    display: flex;
    background-color: var(--slate-200);
  }

  .tab-list-container p,
  .panel-tab {
    user-select: none;
  }

  .panel-options {
    display: flex;
    flex-wrap: nowrap;
    gap: var(--spacingXXSmall);
    padding: 0 var(--spacingXSmall);
  }

  .top-container {
    background-color: var(--slate-200);
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    justify-content: space-between;
    align-items: center;
    transition: opacity 0.5s;
  }

  .top-container:hover {
    overflow-x: scroll;
  }

  .hoverable-tabs {
    width: 100%;
    opacity: 0;
    position: absolute;
    display: flex;
    justify-content: space-between;
  }

  .hoverable-tabs:hover {
    opacity: 1;
  }

  /* Horizontal scrollbar */
  ::-webkit-scrollbar,
  ::-webkit-scrollbar-track {
    height: 2px;
    background: transparent;
    /* opacity: 0; */
    cursor: grab;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--slate-600);
  }

  .border-highlighting::before {
    content: '';
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: var(--slate-600);
    -webkit-transform: translateX(-100%);
    -ms-transform: translateX(-100%);
    transform: translateX(-100%);
    left: 0px;
  }

  .border-highlighting:first-child::before {
    width: 4px;
    left: 3px;
  }

  .panel-tab {
    position: relative;
    flex: 1;
    background-color: var(--slate-200);
    padding: var(--spacingXXSmall) var(--spacingXSmall);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-sm);
    cursor: pointer;
    word-wrap: normal;
    white-space: nowrap;
  }

  .panel-tab.active {
    background-color: var(--slate-300);
  }

  .panel-tab sl-icon-button {
    opacity: 0;
  }

  .panel-tab {
    border-right: 1px solid var(--slate-100);
  }

  .panel-tab:hover sl-icon-button {
    opacity: 1;
  }

  .panel-tab p {
    font-size: var(--text-base);
  }

  .add-more-box {
    width: 100%;
    background-color: var(--slate-200);
    align-self: stretch;
  }

  sl-icon-button::part(base) {
    padding: var(--spacingXXSmall);
  }

  .tab-content-container {
    height: calc(100vh - 36px);
    overflow-y: scroll;
  }

  .stretch::part(base) {
    height: 100%;
  }

  .top-container:hover .stretch {
    opacity: 1;
  }

  .stretch {
    opacity: 0;
    transition: all 0.2s;
    box-shadow: 0 0 2px 2px var(--slate-300);
    margin-right: 5px;
  }
`;
