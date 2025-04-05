import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import base from "../lib/stylesheets/base";
import {
  addImage,
  addNewManuscript,
  getDir,
  initializeFS,
} from "../lib/git/fs";
import fs from "@zenfs/core";
import { Manuscript } from "../lib/git/manuscript";
import { Router } from "@lit-labs/router";
import {
  acceptedImageTypes,
  changeArrayOrderBasedOnField,
  changeArrayOrderBasedOnOrder,
  formatDate,
  intersection,
} from "../lib/model/util";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/dialog/dialog.js";
import Dropzone from "dropzone";
import { notify } from "../lib/model/lit";
import "../components/swappy-element";
import { FileConversion, MdImage } from "../lib/git/file-conversion";
import { getUniqueId } from "../components/libs/golden-layout/src/ts/utils/utils";
import "../components/studio/manuscript-list-element";
import localforage from "localforage";

enum Stage {
  SELECT_STORAGE = "Select Storage",
  MANUSCRIPT_SCREEN = "Manuscripts",
}

export const UPLOADED_FILE_ORDER_CHANGE = "uploaded-file-order-change";
export const DELETE_MANUSCRIPT_EVENT = "delete-manuscript-event";

export interface UploadedFile {
  file: File;
  name: string;
  type: string;
  contents: string;
  mdImages: MdImage[];
  exists?: boolean;
}

enum UploadSteps {
  UPLOAD_FILES = "Upload Files",
  CONFIGURE_FILE_UPLOAD = "Configure File Upload",
}

@customElement("studio-element")
export class StudioElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      .container {
        max-width: 80rem;
        margin: 0 auto;
      }

      .all-manuscripts {
        min-height: 80vh;
      }

      .manuscripts {
        display: flex;
        flex-wrap: wrap;

        gap: var(--spacingSmall);
      }

      .manuscript-card {
        width: 14rem;
        height: 18rem;
        border: 1px solid var(--slate-300);
        border-radius: 3px;
        padding: var(--spacingSmall);
        transition: all 0.2s;
        cursor: pointer;
        position: relative;
      }

      .add:hover {
        color: var(--primary);
      }

      .add {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 6rem;
        color: var(--slate-600);
      }

      .manuscript-card:hover {
        box-shadow: 0 0 1px 1px var(--primary);
      }

      .h2 {
        color: var(--slate-600);
        margin-bottom: var(--spacingSmall);
      }

      .p {
        text-align: center;
        margin-bottom: var(--spacingLarge);
      }

      .stage span {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: var(--slate-300);
        margin-bottom: var(--spacingSmall);
        color: var(--slate-600);
      }

      .stages {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacingLarge);

        margin: var(--spacing) 0;
      }

      .stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .bold {
        font-weight: 600;
      }

      .selected-stage span {
        /* color: var(--primary); */
        background-color: var(--primary);
      }

      .file-content {
        width: 100%;
        height: 100%;
        /* display: grid;
        grid-template-columns: 1fr 3fr; */
      }

      .left-panel {
        display: flex;
        flex-direction: column;
        gap: var(--spacingSmall);
      }

      .file-input {
        display: none;
      }

      .file-list {
        width: 100%;
        height: 5rem;
        background-color: transparent;
        border: 1px solid var(--slate-300);
        border-radius: var(--spacingSmall);
        cursor: pointer;
      }

      .file-list:hover {
        cursor: pointer;
      }

      .uploaded-files {
        display: flex;
        flex-direction: column;
        gap: var(--spacingSmall);
        margin-bottom: var(--spacingSmall);
      }

      .file {
        /* display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column; */
      }
      .file .images {
        margin-left: var(--spacingSmall);
        display: flex;
        flex-direction: column;
        gap: var(--spacingSmall);
        margin-bottom: var(--spacingSmall);
      }

      .image-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .broken-images-text {
        margin-top: var(--spacingSmall);
        text-align: start;
      }
    `,
    base,
  ];

  @state()
  stage: Stage = Stage.SELECT_STORAGE;

  @state()
  allManuscripts: Manuscript[] = [];

  @state()
  dirHandle: FileSystemDirectoryHandle | null = null;

  @state()
  openAddFileMenu: boolean = false;

  @state()
  addedFiles: UploadedFile[] = [];

  @query("#file-input")
  fileInput: HTMLInputElement;

  @state()
  uploadingFiles: boolean = false;

  @query(".dialog")
  importDialog: HTMLElement;

  @query(".close-dialog-warning")
  closeDialogWarning: HTMLElement;

  @state()
  loadingFiles: boolean = false;

  @state()
  selectedFileSize = 0;

  @state()
  selectedFileSizeCounter = 0;

  @state()
  readyForNextStep: boolean = false;

  @state()
  imageList: UploadedFile[] = [];

  async handleFileReading(file: File) {
    const fileType = file.name.slice(
      file.name.lastIndexOf("."),
      file.name.length
    );

    let uploadedFile: UploadedFile;
    if (acceptedImageTypes.includes(fileType)) {
      const url = URL.createObjectURL(file);
      uploadedFile = {
        file: file,
        name: file.name,
        contents: url,
        type: fileType,
        mdImages: [],
        exists: false,
      };

      this.imageList.push(uploadedFile);
      addImage(uploadedFile);

      console.log(this.imageList);
    } else {
      const contents = await file.text();
      uploadedFile = {
        file: file,
        name: file.name,
        contents: contents,
        type: fileType,
        mdImages: FileConversion.parseContentsForImages(contents),
      };
      this.addedFiles.push(uploadedFile);
    }

    this.selectedFileSizeCounter++;

    if (this.selectedFileSizeCounter === this.selectedFileSize) {
      notify("Files uploaded successfully!", "success", "check2-all");
      this.readyForNextStep = true;
    }

    this.requestUpdate();
  }

  @state()
  orderStatus: { fail: boolean; order: number[] } = { fail: false, order: [] };

  uploadedFileOrderChange(e: CustomEvent<{ fail: boolean; order: number[] }>) {
    this.orderStatus = e.detail;
  }

  deleteManuscriptHandler(e: CustomEvent<Manuscript[]>) {
    this.allManuscripts = e.detail;
  }

  constructor() {
    super();

    document.addEventListener(
      DELETE_MANUSCRIPT_EVENT,
      this.deleteManuscriptHandler.bind(this)
    );

    document.addEventListener(
      UPLOADED_FILE_ORDER_CHANGE,
      this.uploadedFileOrderChange.bind(this)
    );
  }

  handleFileSelect(e: any) {
    const files = Object.values(e.target.files);
    this.selectedFileSize = files.length;

    files.forEach((file: File) => {
      this.handleFileReading(file);
    });

    localforage.config({
      name: "serranolabs-bookera",
      version: 1.0,
      storeName: "bookera",
    });
  }

  renderSelectStorage() {
    return html`
      <h2 class="h2">Select A Storage For Your Manuscripts</h2>
      <p class="p">
        Your files will be saved on your local computer! No need for the cloud.
      </p>
      <div class="center">
        <sl-button
          @click=${async () => {
            this.dirHandle = await getDir();

            initializeFS((allManuscripts) => {
              this.allManuscripts = allManuscripts;
              Manuscript.WriteManuscriptsToLF(this.allManuscripts, true);
            });

            if (this.dirHandle) {
              this.stage = Stage.MANUSCRIPT_SCREEN;
            }
          }}
          >Select folder</sl-button
        >
      </div>
    `;
  }

  renderAddManuscriptCard() {
    return html`
      <div
        class="manuscript-card add"
        slot="add-manuscript"
        @click=${() => {
          this.openAddFileMenu = !this.openAddFileMenu;
        }}
      >
        <sl-dropdown ?open=${this.openAddFileMenu}>
          <sl-menu
            @sl-select=${(e) => {
              const value = e.detail.item.value;

              if (value === "new") {
                addNewManuscript(null, (createdManuscript: Manuscript) => {
                  Manuscript.MakeManuscriptURL(createdManuscript);
                });
              } else if (value === "import") {
                this.importDialog!.show();
              } else if (value === "from template") {
              }
            }}
          >
            <sl-menu-item value="new">New</sl-menu-item>
            <sl-menu-item value="import">Import</sl-menu-item>
            <sl-menu-item value="from template">From Template</sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        +
      </div>
    `;
  }

  renderManuscriptsScreen() {
    return html`
      <h2 class="h2">Manuscripts</h2>
      <p class="p">
        This is your collection of manuscripts in
        <span class="bold">${this.dirHandle?.name}</span>! Select one to start
        where you left off, or create a new one!
      </p>
      <div class="manuscripts">
        <manuscript-list-element .manuscripts=${this.allManuscripts}>
          ${this.renderAddManuscriptCard()}
        </manuscript-list-element>
      </div>
    `;
  }

  renderStages() {
    switch (this.stage) {
      case Stage.SELECT_STORAGE:
        return this.renderSelectStorage();
      case Stage.MANUSCRIPT_SCREEN:
        return this.renderManuscriptsScreen();
    }
  }

  @state()
  currentUploadStep: UploadSteps = UploadSteps.UPLOAD_FILES;

  @state()
  malformedFiles: string[] = [];

  imageListContainsFile(fileName: string) {
    if (
      this.imageList
        .map((image) => {
          if (image.name === fileName) {
            image.exists = true;
            this.malformedFiles = this.malformedFiles.filter(
              (file) => file !== fileName
            );
            return true;
          }

          return false;
        })
        .includes(true)
    ) {
      this.requestUpdate();

      return html`
        <sl-tooltip content="Image found!">
          <sl-icon name="check"></sl-icon>
        </sl-tooltip>
      `;
    }

    if (!this.malformedFiles.includes(fileName)) {
      this.malformedFiles.push(fileName);
    }

    return html`
      <sl-tooltip content="Could not locate image">
        <sl-icon style="color: #ef4444" name="x-lg"></sl-icon>
      </sl-tooltip>
    `;
  }

  renderUploadFileDialog() {
    return html`
      <div class="uploaded-files">
        ${this.addedFiles.map((file: UploadedFile) => {
          return html`<div class="file">
            ${file.name}
            <div class="images">
              ${file.mdImages.map((image) => {
                return html`<div class="image-line">
                  <p>${image.fileName}</p>
                  <span>${this.imageListContainsFile(image.fileName)}</span>
                </div>`;
              })}
            </div>
          </div>`;
        })}
        ${this.imageList
          .filter((file) => !file.exists)
          .map((file: UploadedFile) => {
            return html`<div class="file">${file.name}</div>`;
          })}
      </div>
      <div class="file-content">
        <input
          class="file-input"
          @change=${this.handleFileSelect}
          type="file"
          id="file-input"
          multiple
        />
        <button
          class="file-list"
          @click=${() => {
            this.fileInput.click();
          }}
        >
          <sl-icon name="cloud-upload"></sl-icon>
        </button>
      </div>
      <p class="broken-images-text">
        ${this.malformedFiles.length > 0
          ? html`<sl-badge pill variant="warning"
                >${this.malformedFiles.length}</sl-badge
              >
              images are broken. Please provide the images if you can!`
          : ""}
      </p>
    `;
  }

  renderConfigureFileUpload() {
    return html`
      <swappy-element .addedFiles=${this.addedFiles}> </swappy-element>
    `;
  }

  uploadFiles() {
    if (this.orderStatus.fail) {
      notify("You must order all of the files to finish", "warning", "warning");
    } else {
      // order now

      const newOrder = changeArrayOrderBasedOnOrder(
        this.addedFiles,
        Array.from(this.orderStatus.order.values())
      );

      Manuscript.ImportFiles(newOrder);
    }
  }

  handleNext() {
    switch (this.currentUploadStep) {
      case UploadSteps.UPLOAD_FILES:
        this.currentUploadStep = UploadSteps.CONFIGURE_FILE_UPLOAD;
        break;
      case UploadSteps.CONFIGURE_FILE_UPLOAD:
        this.uploadFiles();
      // now, we can create a new file based on the contents
    }
  }

  renderUploadSteps() {
    switch (this.currentUploadStep) {
      case UploadSteps.UPLOAD_FILES:
        return this.renderUploadFileDialog();
      case UploadSteps.CONFIGURE_FILE_UPLOAD:
        return this.renderConfigureFileUpload();
    }
  }

  renderUploadFilesTitle() {
    switch (this.currentUploadStep) {
      case UploadSteps.UPLOAD_FILES:
        return "Upload Files";
      case UploadSteps.CONFIGURE_FILE_UPLOAD:
        return "Configure File Upload Order";
    }
  }

  renderNextStepButton() {
    switch (this.currentUploadStep) {
      case UploadSteps.UPLOAD_FILES:
        return "Next Step";
      case UploadSteps.CONFIGURE_FILE_UPLOAD:
        return "Finish";
    }
  }

  resetDialogState() {
    this.addedFiles = [];
    this.currentUploadStep = UploadSteps.UPLOAD_FILES;
    this.malformedFiles = [];
  }

  renderCloseDialogWarning() {
    return html`
      <sl-dialog class="close-dialog-warning">
        <h3>
          Are you sure you want to stop importing files? All progress will be
          lost :(
        </h3>
        <div class="center">
          <sl-button
            variant="danger"
            @click=${() => {
              this.closeDialogWarning.hide();
              this.resetDialogState();
              this.importDialog!.hide();
            }}
          >
            Close
          </sl-button>
          <sl-button
            variant="success"
            @click=${() => {
              this.closeDialogWarning.hide();
            }}
          >
            Continue
          </sl-button>
        </div>
      </sl-dialog>
    `;
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://unpkg.com/dropzone@5/dist/min/dropzone.min.css"
        type="text/css"
      />
      <section class="all-manuscripts">
        <div class="container">
          <div class="stages">
            ${Object.values(Stage).map((stage: Stage, num: number) => {
              return html`
                <div
                  class="stage ${stage === this.stage ? "selected-stage" : ""}"
                >
                  <span>${num + 1}</span>
                  <p>${stage}</p>
                </div>
              `;
            })}
          </div>
          ${this.renderStages()}
        </div>
        <sl-dialog label=${this.renderUploadFilesTitle()} class="dialog">
          ${this.renderUploadSteps()}
          <div class="file" slot="footer">
            <sl-button
              @click=${() => {
                if (this.addedFiles.length > 0) {
                  this.closeDialogWarning.show();
                } else {
                  this.importDialog!.hide();
                }
              }}
              variant="outline"
              >Close</sl-button
            >
            <sl-button
              ?disabled=${!this.readyForNextStep}
              @click=${this.handleNext}
              variant="primary"
              >${this.renderNextStepButton()}</sl-button
            >
          </div>
        </sl-dialog>
        ${this.renderCloseDialogWarning()}
      </section>
    `;
  }
}
