/// <reference types="cypress" />


const getIframeDocument = () => {
  return cy
  .get('iframe')
  // Cypress yields jQuery element, which has the real
  // DOM element under property "0".
  // From the real DOM iframe element we can get
  // the "document" element, it is stored in "contentDocument" property
  // Cypress "its" command can access deep properties using dot notation
  // https://on.cypress.io/its
  .its('0.contentDocument').should('exist')
}

const getIframeBody = () => {
  // get the document
  return getIframeDocument()
  // automatically retries until body is loaded
  .its('body').should('not.be.undefined')
  // wraps "body" DOM element to allow
  // chaining more Cypress commands, like ".find(...)"
  .then(cy.wrap)
}

describe('clicking on the side', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:3000/studio')
    cy.viewport(1440, 900)
  })

  it('displays two todo items by default', () => {

    cy.enterCreateElement().within((el) => {
      console.log("create", el);
      
      cy.get("create-side-panel-element").shadow().within(() => {
        cy.contains('sl-tree-item', "Typesetting").shadow().within(() => {
          cy.get('.tree-item__expand-button').click()
        })
        
        cy.contains('sl-tree-item', "Margins").click()
        cy.contains('sl-tree-item', "Body").click()
      })

      cy.typeInDocument("Hello, World!")

    })

  })

})
