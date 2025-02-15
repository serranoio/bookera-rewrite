import { css } from "lit";

export default css`
  :host {
    padding: 0;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  .h2 {
    scroll-margin: 5rem;
    border-bottom-width: 1px;
    padding-bottom: 0.5rem;
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 600;
    letter-spacing: -0.025em;
    text-align: center;
  }

  .p {
    line-height: 1.75rem;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;
