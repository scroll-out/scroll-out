/// <reference types="Cypress" />

context("visibility", () => {
  beforeEach(() => {
    cy.visit("cypress/index.html");
  });

  it("Items go visible when scrolled into view.", () => {
    let win;
    cy.window()
      .then(innerWindow => {
        win = innerWindow;
        win.ScrollOut({
          targets: ".one,.two,.three"
        }); 
        win.document.documentElement.scrollTop = win.outerHeight
        return cy.wait(34);
      })
      .then((() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('out');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('in');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('in');
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
      .then(() => {
        win.document.documentElement.scrollTop = win.outerHeight;
        return cy.wait(34);
      })
      .then(() => {
        win.document.documentElement.scrollTop = win.outerHeight * 2
        return cy.wait(34);
      })
      .then((() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('in');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('in');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('in');
      }));
  });
});
