export {};

describe('Search Tests', () => {
	it('Display Tests', () => {
		//Load Page
		cy.visit('http://localhost:3001');
		cy.get('#loading', { timeout: 60000 }).should('not.exist');
		//check for card case
		cy.get('#card-case0', { timeout: 20000 });
		//set list
		cy.get('#display-list').click();
		cy.get('#card-list-item-0', { timeout: 20000 });
		cy.get('#sort-name').click();
		cy.contains('AZ', { timeout: 20000 });
		cy.get('#sort-set-number').click();
		cy.contains('VSTAR', { timeout: 20000 });
		cy.get('#sort-dex').click();
		cy.get('#search', { timeout: 20000 }).type('Charizard');
		cy.get('#Sets-dropdown').click();
		cy.get('#Lost-Origin').click();
		cy.contains('TG03', { timeout: 20000 });
	});
});
