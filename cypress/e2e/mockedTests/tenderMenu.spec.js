/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'
import { should } from 'chai'

context('Tender Menu tests', () => {

  const tags = new elements()
  const tumblerDescription = Cypress.env().yetiTumblerDescription
  
  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
    cy.pressComplete()
    tags.sportsMatterCampaignNoThanksButton().click()
  })

  it('Test 1: Tender menu contains expected elements.', () => {
    tags.backButton().should('be.visible')
    tags.tenderMenuAmountDue().should('be.visible')
    tags.tenderMenuCashButton().should('be.visible')
    tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.tenderMenuCreditButton().should('be.visible')
    tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.tenderMenuGiftCardButton().should('be.visible')
    tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.tenderMenuSplitTenderButton().should('be.visible')
    tags.tenderMenuSplitTenderButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.tenderMenuStoreCreditButton().should('be.visible')
    tags.tenderMenuStoreCreditButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')
    tags.tenderMenuScoreRewardsLookupButton().should('be.visible')
    tags.tenderMenuScoreRewardsLookupButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.registerFunctions().should('be.visible')
      .should('not.have.attr', 'aria-disabled')
    tags.productLookupFooterButton().should('be.visible')
      .should('not.have.attr', ' aria-disabled')
    tags.receiptOptions().should('be.visible')
      .should('not.have.attr', 'aria-disabled')
    tags.returnsFooterButton().should('be.visible')
      .should('have.attr', 'aria-disabled', 'true')
    tags.teammateButton().should('be.visible')
      .should('have.attr', 'aria-disabled', 'true')
    tags.feedback().should('be.visible')
      .should('not.have.attr', 'aria-disabled')
  })

  it('Test 2: The Register Functions button should not be available on the Tender Menu screen.', () => {
    tags.omniScan().should('not.exist')
    tags.scanSubmit().should('not.exist')
    tags.loyaltyMiniController().should('not.be.visible')
    tags.registerFunctions().should('be.visible')
    tags.noSaleButton().should('not.exist')
    tags.closeRegister().should('not.exist')
    tags.signout().should('not.exist')
    tags.returnsFooterButton().should('have.attr', 'aria-disabled')
    tags.returnsFooterButton().should('have.attr', 'aria-disabled')
    tags.teammateButton().should('have.attr', 'aria-disabled')
    tags.registerFunctions().click()
    tags.taxExemptButton().should('be.visible')
    tags.connectPinpadButton().should('not.exist')
  })

  it('Test 3: The Back button on the Tender Menu screen navigates back to the OmniScan screen with an item in the cart.', () => {
    tags.backButton().click()
    tags.omniScan().should('be.visible')
    tags.scanSubmit().should('be.visible')
    tags.transactionCard().should('contain.text', tumblerDescription)
  })
})
