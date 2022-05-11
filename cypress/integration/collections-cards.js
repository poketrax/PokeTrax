describe('Collection Meta Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('Test add collection from Card', () => {
        //search for know card
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
        //click add card
        cy.get('#add-card-button').first().click();
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#price-input').click().type('1')
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //look for collection
        cy.get('#tab-TEST1').invoke('attr', 'aria-selected').should('eq', 'true')
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })

    it('Test one card', () => {
        //search for know card
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
        //click add card
        cy.get('#add-card-button').first().click();
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#price-input').click().type('1')
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //look for card
        cy.contains("VSTAR Token")
        cy.contains("1-1 of 1")
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })
})