import { LitElement, html, css, PropertyValueMap } from "lit";

export default css`
  .lm_header {
    background-color: var(--slate-50);
    border-bottom: 2px solid var(--slate-200) !important;
  }

  .lm_tab {
    background-color: var(--slate-200) !important;
    color: var(--slate-800) !important;
    border-top-left-radius: var(--spacingXSmall) !important;
    border-top-right-radius: var(--spacingXSmall) !important;

    box-shadow: none !important;
  }

  .lm_close_tab {
    background-color: transparent !important;
    background-image: none !important;
    color: var(--slate-600);
  }

  .lm_close_tab:hover {
    color: var(--slate-800);
  }

  .lm_item {
  }

  .lm_goldenlayout {
    background-color: var(--slate-50) !important;
  }

  .lm_content {
    /* background-color: var(--slate-50) !important; */
    background-color: transparent !important;
  }

  .lm_drag_handle,
  .lm_splitter {
    background-color: var(--slate-200) !important;
    opacity: 1 !important;
  }

  .lm_drag_handle:hover,
  .lm_splitter:hover {
    background-color: var(--slate-300) !important;
    opacity: 1 !important;
  }
`;
