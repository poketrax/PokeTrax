
describe('Test Tester', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('Test delete card', () => {
        //search for know card
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
        //add normal card
        cy.get('#add-card-button1').click();
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //delete card
        cy.get('#card-case-delete-button').click();
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })
})