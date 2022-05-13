
describe('Test Tester', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
    })


})