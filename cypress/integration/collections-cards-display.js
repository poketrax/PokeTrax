import { 
    addCardToCollection,
    sortSet,
    deleteCurrentCollection,
    gotoCollections,
    addCollection,
    gotoCollection
} from './common'

describe('Collection Card Tests display', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
        sortSet("Brilliant-Stars")
    })

    it('Test add collection from Card', () => {
        //click add card
        addCardToCollection(0, 'TEST1')
        //goto collections
        gotoCollections()
        //look for collection
        cy.get('#tab-TEST1').invoke('attr', 'aria-selected').should('eq', 'true')
        //clean up
        deleteCurrentCollection()
    })

    it('Test one regular card', () => {
        //click add card
        addCardToCollection(0, 'TEST1')
        //goto collections
        cy.get('#collection-page').click();
        //look for card
        cy.contains("VSTAR Token")
        cy.contains("1–1 of 1")
        //clean up
        deleteCurrentCollection()
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
        addCardToCollection(1, 'TEST1')
        //goto collections
        gotoCollections()
        //look for card
        cy.contains("Exeggcute")
        cy.contains("1–2 of 2")
        //clean up
        deleteCurrentCollection()
    })

    it('Test count logic', () => {
        //click add card
        addCardToCollection(1, "TEST1")
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
        deleteCurrentCollection()
    })

    it('Test delete card', () => {
        //add normal card
        addCardToCollection(1, "TEST1")
        //goto collections
        cy.get('#collection-page').click();
        //delete card
        cy.get('#card-case-delete-button').click();
        //clean up
        cy.get("card-grid").should('not.exist');
        cy.get('#delete-collection-button').click();
        cy.get('#delete-confirm-button').click();
    })

    it('Test move card error', () => {
        //Add Card
        addCardToCollection(1, "TEST1")
        gotoCollections()
        gotoCollection("TEST1")

        //Test empty 
        cy.get('#card-case-move-button').click({force: true})
        cy.get('#move-confirm-button').click()
        cy.get("#collection-input").invoke('attr', 'aria-invalid').should('eq', 'true')
        cy.get('#close-move-card-dialog').click({force: true})

        deleteCurrentCollection()
    })

    it('Test move card', () => {
        //Add Card
        addCardToCollection(1, "TEST1")
        gotoCollections()
        addCollection("TEST2")
        gotoCollection("TEST1")

        //Test Add
        cy.get('#card-case-move-button').click({force: true})
        cy.get("#collection-input").click().type("TEST2")
        cy.get('#move-dialog-title-pad').click({force: true})
        cy.get('#move-confirm-button').click()

        gotoCollection("TEST2")
        cy.contains("Exeggcute")

        deleteCurrentCollection()
        deleteCurrentCollection()
    })

    it('Test pagination', () => {
        //click add card
        for (let i = 0; i < 25; i++) {
            addCardToCollection(i, "TEST1")
        }
        cy.get('[data-testid=KeyboardArrowRightIcon]').first().click();
        addCardToCollection(0, "TEST1")
        //goto collections
        cy.get('#collection-page').click();
        //look for card
        cy.contains("VSTAR Token")
        cy.contains("1–25 of 26")
        cy.get('[data-testid=KeyboardArrowRightIcon]').first().click();
        cy.contains("Monferno")
        //clean up
        deleteCurrentCollection()
    })
})