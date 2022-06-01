/// <reference types="cypress" />
import { 
  deleteCurrentCollection,
  gotoCollections,
  addCollection
} from './common'
describe('Collection Meta Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
    gotoCollections()
  })

  it('Test add', () => {
    //add collection
    addCollection("TEST1")
    cy.get('#add-collection-dialog').should('not.exist');
    //look for collection
    cy.get('#tab-TEST1').invoke('attr', 'aria-selected').should('eq', 'true')
    addCollection("TEST1")
    //test error condition
    cy.get('#add-collection-error').should('exist')
    cy.get('#add-collection-cancel-button').click()
    //test delete
    deleteCurrentCollection()
    cy.get('#delete-collection-dialog').should('not.exist');
  })

  it('Test Collection Selection on Delete and Add', () => {
    //add Test 1
    addCollection('TEST1')
    //add Test 2
    addCollection('TEST2')
    //make sure newest collection is selected
    cy.get('#tab-TEST2').invoke('attr', 'aria-selected').should('eq', 'true')
    //delete Test 2
    deleteCurrentCollection()
    //Check if test 1 is selected after delete
    cy.get('#tab-TEST1').invoke('attr', 'aria-selected').should('eq', 'true')
    //delete Test1 clean up
    deleteCurrentCollection()
  })

})
