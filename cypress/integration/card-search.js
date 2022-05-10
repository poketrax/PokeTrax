/// <reference types="cypress" />

describe('Card Serach tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/')
      cy.get('#card-grid')
    })
  
    it('Check Card Grid loaded', () => {
      //Detect cards
      cy.get('#expantions-sel').click();
      cy.get('#option-Brilliant-Stars').click();
      cy.get('#card-test-search-bar').type('Ultra Ball').type("{enter}");
      cy.get('#card-grid').children().should('have.length', 2)
      cy.get('#rarities-sel').click();
      cy.get('#option-Ultra-Rare').click();
      cy.get('#card-grid').children().should('have.length', 1)
    })

    it('Test Dialog', () => {
        //Detect cards
        cy.get('#expantions-sel').click();
        cy.get('#option-Brilliant-Stars').click();
        cy.get('#card-test-search-bar').type('Ultra Ball').type("{enter}");
        cy.get('#rarities-sel').click();
        cy.get('#option-Ultra-Rare').click();
        cy.get('#card-grid').children().should('have.length', 1)
      })

  })
  