export {}
describe('Collection Tests', () => {
  it('basic view tests', () => {
    cy.visit('http://localhost:3001');
    cy.get('#loading', {timeout: 60000}).should('not.exist');
    cy.get("#collection-page").click();
    //Search for know cards
    cy.contains('Charizard', { timeout: 20000 })
    cy.contains("Umbreon VMAX", { timeout: 20000 })
    cy.contains("Greninja GX", { timeout: 20000 })
    cy.contains("Pikachu VMAX", { timeout: 20000 })
    //make sure count is working
    cy.contains("1-7 of 7", { timeout: 20000 })
  })
})