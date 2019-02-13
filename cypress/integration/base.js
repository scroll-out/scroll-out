/// <reference types="Cypress" />

context("Base", () => {
  beforeEach(() => {
    cy.visit("cypress/index.html");
  });

  it("Loads into the dom", () => {
    let ScrollOut;
    cy.window()
      .then(win => (ScrollOut = win.ScrollOut))
      .then(() => {
        expect(typeof ScrollOut).to.equal("function");
      });
  });
});
