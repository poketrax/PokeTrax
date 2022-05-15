/// <reference types="cypress" />

describe('Card Serach tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
        cy.get('#card-grid')
    })

    it('Test Search filters', () => {
        //Detect cards
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#card-test-search-bar').type('Ultra Ball').type("{enter}");
        cy.get('#card-grid').children().should('have.length', 2)
        cy.get('#rarities-sel').click();
        cy.get('#option-Ultra-Rare').click();
        cy.get('#card-grid').children().should('have.length', 1)
    })

    it('Test Order By Name', () => {
        //Detect cards
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-name').click();
        cy.get('#card-case-title').first().should('have.text', 'Acerola\'s Premonition')
    })

    it('Test Order By Set #', () => {
        //Detect cards
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
        cy.get('#card-case-title').first().should('have.text', 'VSTAR Token')
    })

    it('Test paging', () => {
        //Detect cards
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#sort-set-number').click();
        cy.get('#card-case-title').first().should('have.text', 'VSTAR Token')
        //next page
        cy.get('[data-testid=KeyboardArrowRightIcon]').first().click();
        cy.get('#card-case-title').first().should('have.text', 'Monferno')
        cy.get('[data-testid=KeyboardArrowLeftIcon]').first().click();
        cy.get('#card-case-title').first().should('have.text', 'VSTAR Token')
    })

    it('Test Dialog', () => {
        //Detect cards
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#card-test-search-bar').type('Ultra Ball').type("{enter}");
        cy.get("#add-card-button0")
        cy.get('#rarities-sel').click();
        cy.get('#option-Ultra-Rare').click();
        cy.get('#card-grid').children().should('have.length', 1)
        cy.get('#card-img0').click()
        cy.get('#td-expantion').should('have.text', 'Brilliant Stars - 186')
        cy.get('#td-rarity').should('have.text', 'Ultra Rare')
        cy.get('#td-card-type').should('have.text', 'Item')
    })

    it('Test Close button', () => {
        cy.get('#card-img0').click()
        cy.get('#close-card-dialog').click()
        cy.get('#card-dialog').should('not.exist');
    })

})
