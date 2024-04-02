/// <reference types="cypress" />
import elements from '../../support/pageElements'
import rewardCertificateOverTenderResponse from '../../fixtures/rewardCertificateOnly/rewardOverTenderResponse.json'
import cancelRewardResponse from '../../fixtures/rewardCertificateOnly/cancelRewardResponse.json'
import finalizetransaction from '../../fixtures/rewardCertificateOnly/finalizeWithRewardCertResponse.json'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

context('Reward as Only Tender test', () => {
  
  const tags = new elements()
  const tumblerDescription = Cypress.env().yetiTumblerDescription

  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
    tags.scanSubmit().should('have.text', 'Enter')
  })

  it('Test 1: If the reward exceeds the transaction total the warning modal is displayed', () => {
    cy.addItemOrLoyalty(Cypress.env().rewardCertificate, rewardCertificateOverTenderResponse)
    tags.rewardExceededTotalModal().should('be.visible')
      .should('contain.text', 'REWARDS APPLIED')
    tags.rewardExceededTotalContinueButton().should('be.visible')
    tags.rewardExceededTotalCancelButton().should('be.visible')
  })

  it('Test 2: If Cancel is clicked on the Reward Exceeds Total warning, the reward is removed', () => {
    cy.addItemOrLoyalty(Cypress.env().rewardCertificate, rewardCertificateOverTenderResponse)
    cy.intercept('**/RewardCertificate/**', { body: cancelRewardResponse }).as('cancelRewardCert')
    tags.rewardExceededTotalCancelButton().click()
    cy.wait('@cancelRewardCert')
    tags.rewardExceededTotalModal().should('not.be.visible')
    tags.rewardExceededTotalContinueButton().should('not.be.visible')
    tags.rewardExceededTotalCancelButton().should('not.be.visible')
    tags.descriptionItem1().should('have.text', tumblerDescription)
    tags.total().should('have.text', '37.45')
  })

  it('Test 3: If a reward is the only tender, the cash drawer should not pop open', () => {
    let openDrawerCount = 0
    cy.activatePeripherals()
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(1)
    })
    cy.addItemOrLoyalty(Cypress.env().rewardCertificate, rewardCertificateOverTenderResponse)
    tags.rewardExceededTotalContinueButton().click()
    cy.intercept('**/Transaction/FinalizeTransaction', { body: finalizetransaction }).as('finalizeTransaction')
    cy.pressComplete()
    cy.wait('@finalizeTransaction')
    cy.window().then((w) => {
      w.closeDrawer = false
    }).then(() => {
      expect(openDrawerCount).to.eq(1)
    })
    tags.newTransactionButton().click()
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
  })
})
