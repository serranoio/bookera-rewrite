/// <reference types="cypress" />

import { create } from "cypress/types/lodash";
import "@testing-library/cypress/add-commands";
import {
  enterElement,
  enterSettingsPanel,
} from "../e2e/create/right-panel/settings.cy";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add("enterCreateElement", () => {
  return cy.get("manuscript").shadow();
});

Cypress.Commands.add("getIconButton", (dataTest: string) => {
  return cy.get(`sl-icon-button[data-test="${dataTest}"]`);
});

Cypress.Commands.add(
  "typeInDocument",
  (typeString: string, clearAll?: boolean) => {
    const getIframeDocument = () => {
      return (
        cy
          .get("iframe")
          // Cypress yields jQuery element, which has the real
          // DOM element under property "0".
          // From the real DOM iframe element we can get
          // the "document" element, it is stored in "contentDocument" property
          // Cypress "its" command can access deep properties using dot notation
          // https://on.cypress.io/its
          .its("0.contentDocument")
          .should("exist")
      );
    };

    const getIframeBody = () => {
      // get the document
      return (
        getIframeDocument()
          // automatically retries until body is loaded
          .its("body")
          .should("not.be.undefined")
          // wraps "body" DOM element to allow
          // chaining more Cypress commands, like ".find(...)"
          .then(cy.wrap)
      );
    };

    cy.get("body-element")
      .shadow()
      .within(() => {
        cy.get("#editor").within(() => {
          if (clearAll) {
            getIframeBody().clear();
          }
          getIframeBody().type(typeString);
        });
      });
  }
);

Cypress.Commands.add("appendElement", (elementString: string) => {
  const getIframeDocument = () => {
    return (
      cy
        .get("iframe")
        // Cypress yields jQuery element, which has the real
        // DOM element under property "0".
        // From the real DOM iframe element we can get
        // the "document" element, it is stored in "contentDocument" property
        // Cypress "its" command can access deep properties using dot notation
        // https://on.cypress.io/its
        .its("0.contentDocument")
        .should("exist")
    );
  };

  const getIframeBody = () => {
    // get the document
    return (
      getIframeDocument()
        // automatically retries until body is loaded
        .its("body")
        .should("not.be.undefined")
        // wraps "body" DOM element to allow
        // chaining more Cypress commands, like ".find(...)"
        .then(cy.wrap)
    );
  };

  cy.get("body-element")
    .shadow()
    .within(() => {
      cy.get("#editor").within(() => {
        const body = getIframeBody();
        body.then((el) => {
          console.log("appending", elementString);
          el.append(elementString);
        });
      });
    });
});

Cypress.Commands.add(
  "addLabel",
  (name: string, color: string, isFirstCall: boolean = false) => {
    enterElement().within(() => {
      cy.get('[data-test="settings-button"]').click();
    });

    enterSettingsPanel().within(() => {
      cy.get(".label-form-div").within(() => {
        if (isFirstCall) {
          cy.get("sl-icon-button").click();
        }

        cy.get("sl-input").shadow().find("input").clear();
        cy.get("sl-input").shadow().find("input").type(name);

        cy.get("sl-color-picker").click();

        cy.get("sl-color-picker")
          .shadow()
          .find("sl-dropdown")
          .within(() => {
            cy.get("sl-input").shadow().find("input").clear();
            cy.get("sl-input").shadow().find("input").type(`${color}{enter}`);
          });
      });
      cy.get(".label-form-div").find("form").submit();
    });
  }
);

Cypress.Commands.add("clearAllPanels", () => {});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  namespace Cypress {
    interface Chainable {
      enterCreateElement(): Chainable<JQuery<HTMLElement>>;
      getIconButton(dataTest: string);
      typeInDocument(typeString: string, clearAll: boolean);
      appendElement(elementString: string);
      addLabel(name: string, color: string, isFirstCall?: boolean);
      clearAllPanels();
    }
  }
}
