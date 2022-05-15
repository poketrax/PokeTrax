/// <reference types="cypress" />

describe('Initialization tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })

  it('Check for Loading message', () => {
    cy.get(`#app-loading-bar`)
    cy.get(`#loading-message`)

  })

  it('Check for Card Search controls', () => {
    //Detect serach bar
    cy.get('#card-test-search-bar')
    //Detect expation selection
    cy.get('#expantions-sel').click()
    cy.get('#option-Celebrations')
    //Detect rarities selection
    cy.get('#rarities-sel').click()
    cy.get('#option-Common')
  })

  it('Check Card Grid loaded', () => {
    //Detect cards
    cy.get('#card-grid').children().should('have.length', 25)
  })
})
