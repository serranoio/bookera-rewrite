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
  }

  .tab-button {
    font-size: 1.6rem;
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
`;
