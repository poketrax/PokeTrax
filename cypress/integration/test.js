import { 
    addCardToCollection,
    sortSet,
    deleteCurrentCollection,
    gotoCollections,
    addCollection,
    gotoCollection
} from './common'

describe('Test Tester', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
        sortSet("Brilliant-Stars")
    })
})