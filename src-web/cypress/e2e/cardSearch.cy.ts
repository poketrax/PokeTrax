export {};

describe('Search Tests', () => {
	it('Display Tests', () => {
		//Load Page
		cy.visit('http://localhost:3001');
		cy.get('#loading', { timeout: 300000 }).should('not.exist');
		//check for card case
		cy.get('#card-case0');
		//set list
		cy.get('#display-list').click();
		cy.get('#card-list-item-0');
		cy.get('#sort-name').click();
		cy.contains('AZ');
		cy.get('#sort-set-number').click();
		cy.contains('VSTAR');
		cy.get('#sort-dex').click();
		cy.get('#search').type('Charizard');
		cy.get('#Sets-dropdown').click();
		cy.get('#Lost-Origin').click();
		cy.contains('TG03');
	});
});
