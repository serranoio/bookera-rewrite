/// <reference types="cypress" />

export const enterElement = () => {
  return cy.enterCreateElement().find("create-right-panel-element").shadow();
};

export const enterSettingsPanel = () => {
  return cy.enterCreateElement().find("settings-panel-element").shadow();
};

describe("Create Right Panel / Settings", () => {
  before(() => {
    cy.visit("http://localhost:3000/studio");
    cy.viewport(1440, 900);

    enterElement().within(() => {
      cy.get('[data-test="settings-button"]').click();
    });
  });

  it("should allow you to add labels with name and color", () => {
    cy.addLabel("dystopian", "#f00", true);
    cy.addLabel("nature", "#0f0");
    cy.addLabel("cool", "#00f");

    enterSettingsPanel().within(() => {
      cy.get(".label-form-div").within(() => {
        cy.get("badge-element").should("have.length", 3);
      });
    });
  });

  it("should allow you to delete labels", () => {});

  it("should allow you to create templates for each part. ex: when adding a new chapter, create a template for it", () => {});
});
