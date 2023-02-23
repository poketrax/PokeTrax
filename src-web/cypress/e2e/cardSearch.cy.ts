export {};

describe('Search Tests', () => {
	it('Display Tests', () => {
		//Load Page
		cy.visit('http://localhost:3001');
		//check for card case
		cy.get('#card-case0');
		//set list
		cy.get('#display-list').click();
		cy.get('#card-list-item-0');
		cy.get('#sort-name').click();
    cy.contains("AV");
		cy.get('#sort-set-number').click();
    cy.contains("VSTAR");
		cy.get('#sort-dex').click();
		cy.get('#sort-price').click();
		cy.get('#sort-date').click();
	});
});
