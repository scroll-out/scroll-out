/// <reference types="Cypress" />

context('Offset', () => {
  beforeEach(() => {
    cy.visit('cypress/index.html');
  });

  it('evaluates correctly when a provided as a number', () => {
    let win;
    cy.window()
      .then((innerWindow) => {
        win = innerWindow;
        win.ScrollOut({
          offset: 1000,
          targets: '.one,.two,.three',
        });
        return cy.wait(34);
      })
      .then(() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('out');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('out');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('out');
      })
      .then(() => cy.get('.two').scrollIntoView().wait(100))
      .then(() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('in');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('in');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('in');
      });
  });

  it('evaluates correctly when a provided as a function', () => {
    let win;
    cy.window()
      .then((innerWindow) => {
        win = innerWindow;
        win.ScrollOut({
          offset: () => 1000,
          targets: '.one,.two,.three',
        });
        return cy.wait(34);
      })
      .then(() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('out');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('out');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('out');
      })
      .then(() => cy.get('.two').scrollIntoView().wait(100))
      .then(() => {
        const one = win.document.querySelector('.one');
        expect(one.getAttribute('data-scroll')).to.equal('in');
        const two = win.document.querySelector('.two');
        expect(two.getAttribute('data-scroll')).to.equal('in');
        const three = win.document.querySelector('.three');
        expect(three.getAttribute('data-scroll')).to.equal('in');
      });
  });
});
