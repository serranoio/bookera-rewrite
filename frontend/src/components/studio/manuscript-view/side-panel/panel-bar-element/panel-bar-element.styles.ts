import { css } from "lit";
export default css`
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

  .top {
    width: 100%;
    flex-direction: row;
    height: 30px;
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
    box-shadow: -2px 0 0 0 var(--slate-800);
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
