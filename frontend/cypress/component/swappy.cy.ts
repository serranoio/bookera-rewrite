import { html } from "lit";
import "../../src/components/swappy-element";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/icon-button/icon-button.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/tooltip/tooltip.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/icon/icon.js";
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/cdn/components/badge/badge.js";

describe("swappy.cy.ts", () => {
  it("playground", () => {
    cy.mount(html` <swappy-element
      .addedFiles=${[
        { name: "test.txt", type: "text/plain" },
        { name: "test1.txt", type: "text/plain" },
        { name: "test2.txt", type: "text/plain" },
        { name: "test3.txt", type: "text/plain" },
        { name: "test4.txt", type: "text/plain" },
        { name: "test5.txt", type: "text/plain" },
        { name: "test6.txt", type: "text/plain" },
      ]}
    ></swappy-element>`);

    cy.wait(10000);
  });
});
