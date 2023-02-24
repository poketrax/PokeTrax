export {}
describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3001');
    cy.get("#collection-page").click();
    cy.contains('Charizard')
    cy.contains("Umbreon VMAX")
    cy.contains("Greninja GX")
    cy.contains("Pikachu VMAX")
  })
})