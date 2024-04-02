/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

context('Scorecard Panel tests', () => {
  const tags = new elements()
  
  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
  })

  it('Test 1: Scorecard panel should format a 10-digit phone number', () => {
    tags.loyaltyLookupField().click().focused()
    tags.loyaltyLookupField().type('1234567890')
    tags.loyaltyLookupField().should('have.value', '(123) 456-7890')
  })

  it('Test 2: Scorecard panel should allow up to 10 digits as input for numeric scorecards', () => {
    tags.loyaltyLookupField().click().focused()
    tags.loyaltyLookupField().type('123456789012')
    tags.loyaltyLookupField().should('have.value', '123456789012')
  })

  it('Test 3: Entering a phone number with one account should add it to the trx.', () => {
    cy.addLoyaltyToBaseballGlove()
    tags.transactionCard().should('be.visible')
    tags.loyaltyMiniController().should('be.visible')
      .should('contain.text', 'Rolyat Nai')
      .should('contain.text', 'Points Balance: 353')
    tags.loyaltyClearButton().should('be.visible')
  })

  it('Test 4: Clicking clear should clear current customer from transaction and reset scorecard panel', () => {
    cy.addLoyaltyToBaseballGlove()
    cy.removeLoyaltyFromBaseballGlove()
    tags.loyaltyMiniController().should('be.visible')
      .should('not.contain.text', 'Rolyat Nai')
      .should('not.contain.text', 'Points Balance: 353')
    tags.loyaltyClearButton().should('not.exist')
  })
})
