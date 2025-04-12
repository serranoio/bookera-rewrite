import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import panelHandleElementStyles from './panel-handle-element.styles';
import base from '../../../../../lib/stylesheets/base';
import { addStyles, sendEvent } from '../../../../../lib/model/util';
import { PanelSide } from '../../side-panel/panel-bar-element/panel-bar-element';
import {
  CLOSE_SIDE_PANEL_EVENT,
  CloseSidePanelEventType,
  OPEN_SIDE_PANEL_EVENT,
} from '../../../../../lib/model/panel';

export const PANEL_RESIZE_EVENT = 'panel-resize-event';

export const MINIMUM_WIDTH_HIT = 'MINIMUM_WIDTH_HIT';

export interface PanelResizeEventDetail {
  panelID: string;
  atMinimumWidth: boolean;
  width: number;
}

@customElement('panel-handle-element')
export class PanelHandleElement extends LitElement {
  static styles = [panelHandleElementStyles, base];

  @property({ type: Boolean })
  right: boolean = false;

  @property({ type: Boolean })
  left: boolean = false;

  @state()
  isClicked: boolean = false;

  @property()
  parentElement: HTMLElement | null = null;

  @property()
  minimumWidth: number = 0;

  @property()
  resetWidthOverride: number = -1;

  @property()
  openDrawerWidth: number = -1;

  @property()
  previousWidth: number = -1;

  @property()
  panelID: PanelSide = 'left';

  @state()
  atMinimumWidth = false;

  @property()
  closedDrawerWidth: number = 0;

  @property()
  isClosed = false;

  // @ts-ignore
  @state() handleElementStyles = {};

  constructor() {
    super();

    // @ts-ignore

    document.addEventListener('pointerup', () => {
      this.isClicked = false;
      document.body.style.cursor = 'default';
    });
    document.addEventListener('pointermove', (e) => {
      if (!this.isClicked) return;

      document.body.style.cursor = 'col-resize';

      const haveResetWidthOverride =
        this.resetWidthOverride === -1 ? false : true;
      const rect = this.parentElement!.getBoundingClientRect();

      // & for side panel drawer
      // if the mouse is farther than the minimumWidth
      if (
        (e.clientX < rect.left + this.minimumWidth && this.right) ||
        (e.clientX > rect.right - this.minimumWidth && this.left)
      ) {
        if (
          (haveResetWidthOverride &&
            e.clientX < rect.left + this.resetWidthOverride &&
            this.right) ||
          (haveResetWidthOverride &&
            e.clientX > rect.right - this.resetWidthOverride &&
            this.left)
        ) {
          if (
            this.parentElement?.getBoundingClientRect().width ===
              this.closedDrawerWidth &&
            !this.isClosed
          ) {
            this.isClosed = true;
          }

          sendEvent<CloseSidePanelEventType>(this, CLOSE_SIDE_PANEL_EVENT, {
            position: this.panelID,
            closedDrawerWidth: this.closedDrawerWidth,
          });
          this.parentElement!.style.width = `${this.closedDrawerWidth}`;
          this.requestUpdate();
        }
        return;
      }

      // we're at minimum width of the panel, cannot resize more
      // or if the last panel is at minimum width
      if (e.pageX > window.innerWidth - this.minimumWidth && this.right) {
        this.atMinimumWidth = true;
        sendEvent(this, PANEL_RESIZE_EVENT, {
          panelID: this.panelID,
          atMinimumWidth: this.atMinimumWidth,
          width: this.openDrawerWidth,
        });
        this.previousWidth = newWidth / 16;
        return;
      } else {
        this.atMinimumWidth = false;
      }

      if (this.isClosed) {
        sendEvent(this, OPEN_SIDE_PANEL_EVENT, {
          panelID: this.panelID,
        });
      }
      this.isClosed = false;
      // calculate new width
      const newSide = e.x - 2.5;
      const side = this.right ? rect.left : rect.right;
      let newWidth = newSide - side;
      if (newWidth < 0) {
        newWidth = 0 - newWidth;
      }
      this.parentElement!.style.width = `${newWidth / 16}rem`;
      this.previousWidth = newWidth / 16;

      sendEvent(this, PANEL_RESIZE_EVENT, {
        panelID: this.panelID,
        atMinimumWidth: this.atMinimumWidth,
        width: newWidth / 16,
      });

      e.preventDefault();
    });
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (this.left) {
      this.style.right = '100%';
      this.style.translateX = '-50%';
      this.handleElementStyles = {
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else if (this.right) {
      this.style.right = '0';
      this.style.translateX = '50%';
      this.handleElementStyles = {
        right: '50%',
        transform: 'translateX(50%)',
      };
    } else {
    }
  }

  render() {
    return html`
      <div
        class="handle-box"
        @pointerdown=${() => {
          this.isClicked = true;
        }}
        @pointerup=${() => {
          this.isClicked = false;
        }}
      >
        <div class="handle" style=${addStyles(this.handleElementStyles)}></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'panel-handle-element': PanelHandleElement;
  }
}
