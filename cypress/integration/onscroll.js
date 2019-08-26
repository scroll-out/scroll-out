/// <reference types="Cypress" />

context("Base", () => {
    beforeEach(() => {
      cy.visit("cypress/index.html");
    });
  
    it("Calls onScroll as the document scrolls.", () => {
      let win;
      let timesUpdated = 0;
      cy.window()
        .then(innerWindow => {
          win = innerWindow;
          win.ScrollOut({
            targets: ".one,.two,.three",
            onScroll() {
              timesUpdated++;
            }
          }); 
          return cy.wait(34);
        })
        .then(() => cy.get('.two').scrollIntoView().wait(100))
        .then((() => {
          expect(timesUpdated).to.be.greaterThan(1);
        }));
    });
  });
  