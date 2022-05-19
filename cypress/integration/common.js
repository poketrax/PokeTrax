/**
 * Add card to collection
 * @param {number} number 
 * @param {string} string 
 */
export function addCardToCollection(card_number, collection) {
    cy.get(`#add-card-button${card_number}`).click();
    cy.get('#collection-input').click().type(collection);
    cy.get('#confirm-add-button').click({force: true});
}

/**
 * Sort by set number and by the set provided
 * @param {string} set 
 */
export function sortSet(set) {
    cy.get('#expantions-sel').click();
    cy.get(`#option-${set}`).click();
    cy.get('#sort-set-number').click();
}

/**
 * Add collection
 * @param {string} colleciton 
 */
export function addCollection(colleciton){
    cy.get('#add-collection-button').click();
    cy.get('#add-collection-name').click().type(colleciton);
    cy.get('#add-collection-confirm-button').click();
}

/**
 * Goto Collection page
 * @param {string} collection 
 */
export function gotoCollection(collection){
    cy.get(`#tab-${collection}`).click()
}

export function gotoCards(){
    cy.get('#cards-page').click();
}

export function gotoCollections(){
    cy.get('#collection-page').click();
}

export function deleteCurrentCollection(){
    cy.get('#delete-collection-button').click();
    cy.get('#delete-confirm-button').click();
}