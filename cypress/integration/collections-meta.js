/// <reference types="cypress" />

describe('Collection Meta Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })
  
  it('Collection init', () => {
    cy.get(`#app-loading-bar`)
    cy.get(`#loading-message`)
  })

  it('Test add', () => {
    cy.get('#collection-page').click();
    //add collection
    cy.get('#add-collection-button').click();
    cy.get('#add-collection-name').click().type('TEST1');
    cy.get('#add-collection-confirm-button').click();
    cy.get('#add-collection-dialog').should('not.exist');
    //look for collection
    cy.get('#tab-TEST1').invoke('attr', 'aria-selected').should('eq', 'true')
  })
 
  it('Test fail add collection with same name', () => {
    cy.get('#collection-page').click();
    cy.get('#add-collection-button').click();
    cy.get('#add-collection-name').click().type('TEST1');
    cy.get('#add-collection-confirm-button').click();
    cy.get('#add-collection-error').should('exist')
    cy.get('#add-collection-cancel-button').click()
  })
 
  it('Test delete to no collections', () => {
    cy.get('#collection-page').click();
    cy.get('#delete-collection-button').click();
    cy.get('#delete-confirm-button').click();
    cy.get('#delete-collection-dialog').should('not.exist');
  })

  it('Test Collection Selection on Delete and Add', () => {
    cy.get('#collection-page').click();
    //add Test 1
    cy.get('#add-collection-button').click();
    cy.get('#add-collection-name').click().type('TEST1');
    cy.get('#add-collection-confirm-button').click();
    //add Test 2
    cy.get('#add-collection-button').click();
    cy.get('#add-collection-name').click().type('TEST2');
    cy.get('#add-collection-confirm-button').click();
    //make sure newest collection is selected
    cy.get('#tab-TEST2').invoke('attr', 'aria-selected').should('eq', 'true')
    //delete Test 2
    cy.get('#delete-collection-button').click();
    cy.get('#delete-confirm-button').click();
    //Check if test 1 is selected after delete
    cy.get('#tab-TEST1').invoke('attr', 'aria-selected').should('eq', 'true')
    //delete Test1 clean up
    cy.get('#delete-collection-button').click();
    cy.get('#delete-confirm-button').click();
  })

})
