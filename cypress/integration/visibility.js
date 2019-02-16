/// <reference types="Cypress" />

context("visibility", () => {
  beforeEach(() => {
    cy.visit("cypress/index.html");
    cy.viewport(2000, 680);
  });

  it("Items go visible when scrolled into view.", () => {
    let win;
    cy.window()
      .then(innerWindow => {
        win = innerWindow;
        win.ScrollOut({
          targets: ".one,.two,.three"
        }); 
        return cy.wait(34);
      })
      .then(() => cy.get('.two').scrollIntoView().wait(100))
      .then((() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('out');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('in');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('out');
      }));
  });

  it("Items using once, only change once.", () => {
    let win;
    cy.window()
      .then(innerWindow => {
        win = innerWindow;
        win.ScrollOut({
          targets: ".one,.two,.three",
          once: true
        });
        return cy.wait(34);
      })
      .then(() => cy.get('.one').scrollIntoView().wait(100))
      .then(() => cy.get('.two').scrollIntoView().wait(100))
      .then(() => cy.get('.three').scrollIntoView().wait(100))
      .then((() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('in');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('in');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('in');
      }));
  });

  it("Display: inline are detected properly.", () => {
    let win;
    cy.window()
      .then(innerWindow => {
        win = innerWindow;
        win.ScrollOut({
          targets: ".inline"
        });
        return cy.wait(34);
      })
      .then(() => cy.get('.inline').scrollIntoView().wait(100))
      .then((() => {
        const one = win.document.querySelector('.inline');
        expect(one.getAttribute('data-scroll')).to.equal('in');
      }));
  });
});
