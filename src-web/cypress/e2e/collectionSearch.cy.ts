export {}
describe('Collection Tests', () => {
  it('basic view tests', () => {
    cy.visit('http://localhost:3001');
    cy.get('#loading', {timeout: 60000}).should('not.exist');
    cy.get("#collection-page").click();
    //Search for know cards
    cy.contains('Charizard')
    cy.contains("Umbreon VMAX")
    cy.contains("Greninja GX")
    cy.contains("Pikachu VMAX")
    //make sure count is working
    cy.contains("1-7 of 7")
  })
})