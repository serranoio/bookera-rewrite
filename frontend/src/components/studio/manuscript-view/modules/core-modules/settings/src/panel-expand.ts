import { html } from 'lit';

const manuscriptElement = document.querySelector('manuscript-element');

export const EXPANDED_PANELS_CLASS = 'expand-panels';
// state saved in your class bro
export class PanelExpand {
  static ExpandPanels = () => {
    manuscriptElement?.classList.toggle(EXPANDED_PANELS_CLASS);
    manuscriptElement?.getAllPanels().forEach((panel) => {
      console.log(panel);
      panel.toggleHoverableTabs();
    });
    manuscriptElement?.getLeftSidePanel().toggleHoverableBar();
  };

  static RenderExpandPanelsButton(state: boolean = false) {
    return html`
      <sl-tooltip content="${state ? 'Show' : 'Hide'} panel tabs & bars">
        <sl-icon-button
          name="${state ? 'arrows-angle-expand' : 'arrows-angle-contract'}"
          @click=${this.ExpandPanels}
        ></sl-icon-button>
      </sl-tooltip>
    `;
  }
}
