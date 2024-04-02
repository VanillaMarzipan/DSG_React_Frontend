/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Launch and recall modal tests', () => {

  const tags = new elements()
  const responseStatus = 451
  const recallResponseData = '{"type":"RestrictedProduct","restrictedProductAttributes":[{"attribute":2,"description":"Recall"},{"attribute":0,"description":"RestrictedAge"}],"upc":"013658112247"}'
  const launchResponseData = '{"type":"RestrictedProduct","restrictedProductAttributes":[{"attribute":3,"description":"Launch"}],"upc":"400001930397"}'
  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 1: POS should display Recall modal when a recall item is scanned.', () => {
    cy.addItemOrLoyalty(Cypress.env().recallUPC, recallResponseData, responseStatus)
    cy.get('body').should('contain.text', 'RECALLED')
      .should('contain.text', 'This item has been recalled by the manufacturer. Please follow your store guidelines for recalled merchandise.')
      .should('contain.text', 'Please inform the athlete.')
      .should('contain.text', 'THIS ITEM WILL NOT BE ADDED TO THE TRANSACTION')
    tags.modalCloseButton('recall').should('be.visible')
  })

  it('Test 2: Clicking the modal close button should closes the modal and void the transaction.', () => {
    cy.addItemOrLoyalty(Cypress.env().recallUPC, recallResponseData, responseStatus)
    tags.modalCloseButton('recall').should('be.visible').click()
    tags.transactionCard().should('not.exist')
  })

  it('Test 3: POS should display Launch modal when a launch item is scanned.', () => {
    cy.addItemOrLoyalty(Cypress.env().launchUPC, launchResponseData, responseStatus)
    cy.get('body').should('contain.text', 'LAUNCH ITEM')
      .should('contain.text', 'This item is not yet available for purchase.')
      .should('contain.text', 'Please inform the athlete.')
      .should('contain.text', 'THIS ITEM WILL NOT BE ADDED TO THE TRANSACTION')
    tags.modalCloseButton('launch').should('be.visible')
  })

  it('Test 4: Clicking the modal close button closes the modal and voids the transaction', () => {
    cy.addItemOrLoyalty(Cypress.env().launchUPC, launchResponseData, responseStatus)
    tags.modalCloseButton('launch').click()
    tags.transactionCard().should('not.exist')
  })
})
