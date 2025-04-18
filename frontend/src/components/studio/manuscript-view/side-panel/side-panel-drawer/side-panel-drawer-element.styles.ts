import { css } from 'lit';
export default css`
  :host {
    position: relative;
  }

  .side-panel-drawer-element {
    position: relative;
    height: 100%;
    background-color: var(--slate-300);
    /* transition: wi0.2s; */
  }
  .panel-container {
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

  slot {
    display: block;
  }

  .cool-expand-button {
    position: absolute;
    top: 0%;

    color: var(--slate-500);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cool-expand-button.right {
    left: 0;
    transform: translateX(-100%);
  }
  .cool-expand-button.left {
    transform: translateX(100%);
    right: 0;
  }

  .cool-expand-button::part(base) {
    height: 100%;
    opacity: 0;
    transition: all 0.2s;
  }
  .cool-expand-button::part(base):hover {
    height: 100%;
    opacity: 1;
  }
`;
