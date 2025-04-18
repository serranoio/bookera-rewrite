import { css } from 'lit';
export default css`
  :host {
    position: relative;
    background-color: var(--slate-100);
  }
  .scrollable-menu {
    max-height: 10rem;
    overflow-y: scroll;
  }
  .side-panel {
    width: 3rem;
    height: 100%;
    background-color: var(--slate-400);
    display: flex;
    justify-content: start;
    flex-direction: column;
    align-items: center;
    gap: var(--spacingXXSmall);
    position: relative;
  }

  .hoverable-bar {
    opacity: 0;
    /* transform: translate(-50%); */
    /* position: fixed; */
    /* width: 100%; */
    background-color: var(--slate-400);
    height: 100%;
    transition: opacity 0.5s;
  }

  .hoverable-bar:hover {
    /* transform: translate(0%); */
    opacity: 1;
  }

  .top {
    width: 100%;
    flex-direction: row;
    height: 30px;
    justify-content: space-around;
  }

  .top-div {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  sl-icon-button {
    font-size: 1.6rem;
  }

  .top .tab-button {
    font-size: 1.2rem !important;
  }

  .tab-button::part(base) {
    color: var(--slate-200);
  }

  .active::part(base) {
    color: var(--slate-800);
    /* box-shadow: -2px 0 0 0 var(--slate-800); */
    /* border-left: 2px solid var(--slate-800); */
    position: relative;
  }
  .active::part(base)::before {
    position: absolute;
    content: '';
    left: -1px;
    transform: translateX(-100%);
    height: 100%;
    width: 2px;
    background-color: var(--slate-800);
    transition: all 0.2s;
    /* box-shadow: -2px 0 0 0 var(--slate-800); */
    /* border-left: 2px solid var(--slate-800); */
  }
  .top .active::part(base)::before {
    position: absolute;
    content: '';
    top: 0;
    transform: translate(0, 100%);
    height: 2px;
    width: 100%;
    background-color: var(--slate-800);
    /* box-shadow: -2px 0 0 0 var(--slate-800); */
    /* border-left: 2px solid var(--slate-800); */
  }

  .tab-button::part(base):hover {
    color: var(--primary);
  }

  .extra-configuration {
    position: absolute;
    bottom: 0;
    /* left: 50%; */
    /* transform: translateX(3%); */
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: var(--spacingXXSmall);
    margin-bottom: var(--spacingSmall);
  }
`;
