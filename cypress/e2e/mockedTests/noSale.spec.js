/// <reference types="cypress" />

import elements from '../../support/pageElements'
import noSaleResponse from '../../fixtures/noSaleResponse.json'

context('No Sale tests', () => {

    const tags = new elements()

    beforeEach(() => {
        cy.launchPageLoggedIn()
      })
    
    it('Test 1: The No Sale button appears on the screen after clicking Register Functions', () => {
        tags.registerFunctions().click()
        tags.noSaleButton().should('be.visible')
    })

    it('Test 2: Clicking the No Sale button pops the drawer open', () => {
        tags.registerFunctions().click()
        cy.intercept('**/NoSaleTransaction', { body: noSaleResponse }).as('noSale')
        tags.noSaleButton().click()
        cy.wait('@noSale')
        tags.cashDrawerOpenTitleModal().should('be.visible')
            .should('have.text', 'Cash Drawer Open')
        tags.cashDrawerOpenModal().should('be.visible')
            .should('have.text', 'The cash drawer is openPLEASE CLOSE THE CASH DRAWER TO CONTINUE')
    })
})