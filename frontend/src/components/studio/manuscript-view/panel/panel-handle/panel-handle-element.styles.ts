import { css } from "lit";
export default css`
  :host {
    position: absolute;
    height: 100%;
    top: 0;
    transform: translateX(50%);
    z-index: var(--zIndex-handles);
  }

  .handle-box {
    height: 100%;
    width: 12.5px;
    cursor: col-resize;
  }

  .handle {
    position: absolute;
    height: 100%;
    width: 5px;
    background-color: var(--slate-500);
  }
`;
