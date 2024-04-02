/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'
import abeLincolnCustomerResponse from '../../fixtures/loyalty/abeLincolnCustomerResponse.json'
import abeLincolnAccountLevelDetailsResponse from '../../fixtures/loyalty/rewards/abeAccountLevelDetailsRespons.json'
import rewardAsPartialTender from '../../fixtures/loyalty/rewards/rewardAsPartialTender.json'
import partialCashTender from '../../fixtures/cashTenders/forAddRewardOnTender/newCashTender.json'
import finalizeTransaction from '../../fixtures/cashTenders/forAddRewardOnTender/finalizeTransaction.json'
import tumberWithAbeLookup from '../../fixtures/loyalty/tumberWithAbeLookup.json'

context('Add reward certificate from tender menu tests', () => {
  
  const tags = new elements()
  const abesPhoneNumber = Cypress.env().phoneAbeLincoln

  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
    cy.intercept('**/OmniSearch', { body: tumberWithAbeLookup }).as('omniSearch')
    cy.intercept('**/Customer/**', { body: abeLincolnCustomerResponse }).as('account')
    cy.intercept('**/AccountLevelDetails/**', { body: abeLincolnAccountLevelDetailsResponse }).as('accountLevelDetails')
    cy.omniSearch(abesPhoneNumber)
    cy.wait([ '@omniSearch', '@account', '@accountLevelDetails' ])
    cy.wait(1000)
    cy.pressComplete()
    tags.sportsMatterCampaignNoThanksButton().click()
  })

  it('Test 1: The loyalty card with available rewards is displayed on the tender menu.', () => {
    tags.loyaltyMiniController().should('be.visible')
    tags.basicRewardCard().should('be.visible')
      .should('not.be.disabled')
    tags.rewardCountBadge().should('be.visible')
  })

  it('Test 2: From the tender menu, a reward can be added, and the transaction completes as expected.', () => {
    tags.basicRewardCard().click()
    tags.rewardsAvailableCard().click()
    cy.intercept('**/OmniSearch', { body: rewardAsPartialTender }).as('addReward')
    tags.rewardCertificate1().click()
    cy.wait('@addReward')
    cy.wait(500)
    cy.pressComplete()
    tags.tenderMenuCashButton().click()
    cy.intercept('**/Tender/NewCashTender', { body: partialCashTender }).as('newCashTender')
    tags.cashInput().type('2700{enter}')
    cy.wait('@newCashTender')
    cy.intercept('**/FinalizeTransaction**', { body: finalizeTransaction }).as('finalize')
    tags.printReceiptButton().click()
    cy.wait('@finalize')
    tags.changeDue().should('be.visible')
      .should('have.text', '0.25')
    tags.newTransactionButton().should('be.visible')
      .click()
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
  })

  it('Test 3: The loyalty card should not be clickable after selecting a tender type on the tender menu.', () => {
    tags.tenderMenuCashButton().click()
    tags.loyaltyMiniController().should('be.visible')
    tags.basicRewardCard().should('be.visible')
      .should('not.be.enabled')
  })
})
