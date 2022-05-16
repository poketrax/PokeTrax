
describe('Collection Card Tests display', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
    })

    it('Test add collection from Card', () => {
        //click add card
        cy.get('#add-card-button0').click();
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

    it('Test one regular card', () => {
        //click add card
        cy.get('#add-card-button0').click();
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#price-input').click().type('1')
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //look for card
        cy.contains("VSTAR Token")
        cy.contains("1–1 of 1")
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })

    it('Test add failure conditions', () => {
        //click add card
        cy.get('#add-card-button0').click();
        // test no collection
        cy.get('#confirm-add-button').click();
        cy.get("#add-card-error")
        cy.contains("Collection must be set")
        //test count invalid
        cy.get('#collection-input').click().type('TEST1')
        cy.get('#count-input').click().type('{backspace}').type('0')
        cy.get('#confirm-add-button').click();
        cy.get("#add-card-error")
        cy.contains("Count must be greater than 0")
        
    })

    it('Test variants card', () => {
        //add rev holo card
        cy.get('#add-card-button1').click();
        cy.get('#collection-input').click().type('TEST1')
        cy.get('.pr-4').click()
        cy.get('#variant-select').click();
        cy.get('#variant-select-option-1').click();
        cy.get('.pr-4').click()
        cy.get('#confirm-add-button').click();
        //add regular card
        cy.get('#add-card-button1').click();
        cy.get('#collection-input').click().type('TEST1')
        cy.get('.pr-4').click()
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //look for card
        cy.contains("Exeggcute")
        cy.contains("1–2 of 2")
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })

    it('Test count logic', () => {
        //click add card
        cy.get('#add-card-button1').click();
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#price-input').click().type('1')
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //increment count
        cy.get('#card-case-add-count').click({force: true})
        cy.contains("Count: 2")
        //leave page and come back
        cy.get("#cards-page").click()
        cy.get('#collection-page').click();
        //check it is still 2
        cy.contains("Count: 2")
        //test wishlist and decrement
        cy.get('#card-case-sub-count').click({force: true})
        cy.get('#card-case-sub-count').click({force: true})
        cy.contains("Wishlist")
        //make sure minus is disabled
        cy.get('#card-case-sub-count').should('be.disabled')
        cy.get("#cards-page").click()
        cy.get('#collection-page').click();
        //verify changes 
        cy.contains("Wishlist")
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })

    it('Test delete card', () => {
        //add normal card
        cy.get('#add-card-button1').click({force: true});
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //delete card
        cy.get('#card-case-delete-button').click();
        //clean up
        cy.get("card-grid").should('not.exist');
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })

    it('Test pagination', () => {
        //click add card
        for (let i = 0; i < 25; i++) {
            cy.get(`#add-card-button${i}`).click();
            cy.get('#collection-input').click().type('TEST1');
            cy.get('#price-input').click().type('1')
            cy.get('#confirm-add-button').click();
        }
        cy.get('[data-testid=KeyboardArrowRightIcon]').first().click();
        cy.get(`#add-card-button0`).click();
        cy.get('#collection-input').click().type('TEST1');
        cy.get('#price-input').click().type('1')
        cy.get('#confirm-add-button').click();
        //goto collections
        cy.get('#collection-page').click();
        //look for card
        cy.contains("VSTAR Token")
        cy.contains("1–25 of 26")
        cy.get('[data-testid=KeyboardArrowRightIcon]').first().click();
        cy.contains("Monferno")
        //clean up
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })
})