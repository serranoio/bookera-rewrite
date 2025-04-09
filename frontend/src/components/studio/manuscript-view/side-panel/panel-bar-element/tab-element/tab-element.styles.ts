import { css } from 'lit';

export default css`
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
`;
