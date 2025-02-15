/// <reference types="cypress" />

describe("Body / Data Sync", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/studio");
    cy.viewport(1440, 900);

    // clear panels
  });

  // *
  it("Every time you move an Outline panel, it keeps the data of the panel", () => {});

  // *
  it("Every instance of Body is synced together", () => {});

  // *
  it("Every instance of outline is synced together", () => {});

  // *
  it("Updating the body portion of an outline should properly update the outline", () => {});

  // *
  it("updating 1.6.1 updates 1.6 & body", () => {});
  it("updating 1.6 updates 1.6.1 & body", () => {});
  it("updating body updates 1.6 & 1.6.1", () => {});
  // we are not

  // 1.0.0.1 updates 1
  // 1 does not 1.0.0.1

  // * I am in the flow state.
  it("Updating titles in the body should update the tab titles", () => {});

  // *
  it("You can add titles to the panels. that are lesser than it. Ex: Chapter 1 (1.1) can have Headings addedd to it", () => {});

  // *
  it("Adding titles in the body rightfully updates the rest of the panels", () => {});

  // ! no
  it("Graph View does not have any instances of Book. You can only open up the content of a node in a new panel", () => {});
});

// ^ TO:DO
describe("Body / Panels", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/studio");
    cy.viewport(1440, 900);

    // clear panels
  });

  // *
  it("everything from the outline should open as a new panel", () => {});

  // *
  it("opening outline should respect hierarchy filter that is set", () => {});

  // !
  it("everything from outline should open as a new panel", () => {});

  // &
  it("everything from the side bar should open as a panel.", () => {});

  // !
  it("I should be able to create an empty panel from a button at the top.", () => {});

  // !
  it("I can delete 1.1 and then re openup another 1.1", () => {});

  it("should allow you to add a panel", () => {});

  it("should allow you to compress the outside panels.", () => {});

  it("should open up multiple instances of the body in the main panel", () => {});

  it("should allow you to split panels by having a button on the tab bar that allows you to split panel. Also, the action is available via the outline to open as new tab", () => {});

  it("should open body, parts of the outline, notes, into the frame as a panel. should allow you to open the typesetting and other stuff as panels", () => {});

  it("should allow you to tab between new panels", () => {});

  it("should allow you to create a panel by hitting the panel + icon. Upon selection, new content will go here.", () => {});

  it("should properly render the graph view in a panel", () => {});

  it("There can be only one graph", () => {});
  it('There can only be one instance of everything that"s not book view', () => {});
});

// ^ TO:DO
// I think we can do this: We say fuck it, no need to render the editors directly in the graph. This is simply to get a view of the outline
// Each box should contain statistics of the outline. Clicking upon it should open up a legend containing the information
// or, we can
describe("Body / Graph", () => {
  beforeEach(() => {});

  // ! NEEDS WORK
  it("should be able to open the body as a graph view by subheadings, headings, parts, and chapters", () => {});

  // ! NEEDS WORK
  it("should layout the elements like a graph, CENTERED", () => {});

  // ! NEEDS WORK
  it("should be able to click the elements", () => {});

  // * WORKs
  it("should label each portion of the graph with the header", () => {});

  // ! NEEDS WORK
  it("should layout the elements like a graph would, allowing you to move between TOP/DOWN, LEFT/RIGHT", () => {});

  // ! NEEDS WORK
  it("should allow you to move elements by clicking and dragging", () => {});

  // ^ NO NEED FOR OPENING OUTLINE IN GRAPH VIEW. We only want artifacts
  it("Open all artifacts for each outline.", () => {});

  it("Include AI generate button that generates a summary of each point.", () => {});

  it("Include AI generate button that generates Insight regarding a point", () => {});
});

// this is good!
describe("Body / Froala Editor", () => {
  beforeEach(() => {});

  // * WORKS!
  it("should be able to connect multiple editors to use the same toolbar.", () => {});

  // ! NEEDS WORKS
  it("should make a sexy looking toolbar over the panels part.", () => {});
});
