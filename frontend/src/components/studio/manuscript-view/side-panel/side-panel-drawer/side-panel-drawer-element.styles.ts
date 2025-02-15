import { css } from "lit";
export default css`
  .side-panel-drawer-element {
    position: relative;
    height: 100%;
    background-color: var(--slate-300);
    /* transition: wi0.2s; */
  }

  .handle-box {
    position: absolute;
    height: 100%;
    right: 0;
    width: 12.5px;
    /* background-color: var(--slate-500); */
    cursor: col-resize;
    transform: translateX(50%);
    z-index: var(--zIndex-handles);
  }

  .handle {
    position: absolute;
    transform: translateX(50%);
    height: 100%;
    right: 50%;
    width: 5px;
    background-color: var(--slate-500);

    /* cursor: col-resize; */
  }
`;
