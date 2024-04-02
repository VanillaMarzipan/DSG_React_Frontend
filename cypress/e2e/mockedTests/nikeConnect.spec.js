/// <reference types="cypress" />

import elements from '../../support/pageElements'
import lookupTokenResponse from '../../fixtures/productLookup/lookupTokenResponse.json'
import productLookupJacketResponse from '../../fixtures/nikeConnectedResponses/productLookupJacketResponse.json'
import productLookupJacketPriceResponse from '../../fixtures/nikeConnectedResponses/productLookupJacketPriceResponse.json'
import omniSearchNikeConnectedLoyaltyResponse from '../../fixtures/nikeConnectedResponses/nikeConnectedLoyaltyOmniSearchResponse.json'
import nikeConnectedAccountLookupResponse from '../../fixtures/nikeConnectedResponses/nikeConnectedAccountResponse.json'
import activeTransactionNickAJordan from '../../fixtures/nikeConnectedResponses/activeTransactionNikeConnectedLoyalty.json'
import sweatpantsProductLookupResponse from '../../fixtures/productLookup/sweatpantsProductLookupResponse.json'
import sweatpantsProductLookupPriceResponse from '../../fixtures/productLookup/sweatpantsProductLookupPriceResponse.json'
import omniSearchAbeLincolnOnlyResponse from '../../fixtures/loyalty/omniSearchResponseAbeLincolnOnly.json'
import newTransactionAbeLincolnOnlyResponse from '../../fixtures/loyalty/transactionAbeLincolnOnlyResponse.json'
import abeLincolnRewards from '../../fixtures/loyalty/rewards/abeAccountLevelDetailsRespons.json'
import nikeConnectedJacket from '../../fixtures/items/nikeConnectedJacket.json'
import sweatpantsResponse from '../../fixtures/items/sweatpants.json'

const tags = new elements()
const nikeConnectedJacketUPC = Cypress.env().nikeConnectedJacketUPC
const nikeSweatpantsUPC = Cypress.env().nikeSweatpantsUPC

context('Nike Connected Product Lookup tests', () => {
    beforeEach(() => {
      cy.launchPage()
    })

    const associateNum = Cypress.env().associateNum
    const associatePIN = Cypress.env().associatePIN

    it('Test 1: Nike Connect tag appears on product lookup while logged out', () => {
        tags.productLookupFooterButton().click()
        tags.productLookupOverlayButton().click()
        cy.intercept('**/LookupSecurity/Authenticate/**', { body: lookupTokenResponse }).as('lookupToken')
        cy.intercept('**/ProductLookup/Details/**', { body: productLookupJacketResponse }).as('jacketLookupResponse')
        cy.intercept('**/Pricing/PriceBySku/**', { body: productLookupJacketPriceResponse }).as('jacketLookupPriceResponse')
        tags.productLookupSearchInput().type(nikeConnectedJacketUPC).type('{enter}')
        cy.wait(['@jacketLookupResponse','@jacketLookupPriceResponse'])
        tags.nikeConnectTag()
          .should('be.visible')
          .should('have.text', 'Nike Connect Members Only')
        tags.nikeConnectProductPopupLine1().should('not.exist')
        tags.nikeConnectProductPopupLine2().should('not.exist')
        tags.nikeConnectCloseButton().should('not.exist')
        tags.nikeConnectTag().click()
        tags.nikeConnectProductPopupLine1().should('be.visible')
        tags.nikeConnectProductPopupLine2().should('be.visible')
        tags.nikeConnectCloseButton()
          .should('be.visible')
          .click()
        tags.nikeConnectProductPopupLine1().should('not.exist')
        tags.nikeConnectProductPopupLine2().should('not.exist')
        tags.nikeConnectCloseButton().should('not.exist')
    })

    it('Test 2: Nike Connect tag appears on product lookup while logged in', () => {
      cy.login(associateNum, associatePIN)
      tags.productLookupFooterButton().click()
      tags.productLookupOverlayButton().click()
      cy.intercept('**/ProductLookup/Details/**', { body: productLookupJacketResponse }).as('jacketLookupResponse')
      cy.intercept('**/Pricing/PriceBySku/**', { body: productLookupJacketPriceResponse }).as('jacketLookupPriceResponse')
      tags.productLookupSearchInput()
        .type(nikeConnectedJacketUPC)
        .type('{enter}')
      cy.wait(['@jacketLookupResponse','@jacketLookupPriceResponse'])
      tags.nikeConnectTag()
        .should('be.visible')
        .should('have.text', 'Nike Connect Members Only')
      tags.nikeConnectProductPopupLine1().should('not.exist')
      tags.nikeConnectProductPopupLine2().should('not.exist')
      tags.nikeConnectCloseButton().should('not.exist')
      tags.nikeConnectTag().click()
      tags.nikeConnectProductPopupLine1().should('be.visible')
      tags.nikeConnectProductPopupLine2().should('be.visible')
      tags.nikeConnectCloseButton()
        .should('be.visible')
        .click()
      tags.nikeConnectProductPopupLine1().should('not.exist')
      tags.nikeConnectProductPopupLine2().should('not.exist')
      tags.nikeConnectCloseButton().should('not.exist')
    })

    it('Test 3: Nike Connected tag does NOT appear on product lookup for products that are not Nike Connected', () => {
      cy.login(associateNum, associatePIN)
      tags.productLookupFooterButton().click()
      tags.productLookupOverlayButton().click()
      cy.intercept('**/ProductLookup/Details/196149321257', { body: sweatpantsProductLookupResponse}).as('sweatpantsLookupResponse')
      cy.intercept('**/Pricing/PriceBySku/23268041', { body: sweatpantsProductLookupPriceResponse }).as('sweatpantsLookupPriceResponse')
      tags.productLookupSearchInput()
        .type(nikeSweatpantsUPC)
        .type('{enter}')
      cy.wait(['@sweatpantsLookupResponse','@sweatpantsLookupPriceResponse'])
      tags.nikeConnectTag().should('not.exist')
    })

})

context('Nike Connected loyalty tests', () => {
  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  const nikeConnectedAccountNumber = Cypress.env().nikeConnectedAccountNumber
  const AbeLincolnLoyaltyNumber = Cypress.env().AbeLincolnLoyaltyNumber

  it('Test 4: Nike Connected tag appears on Loyalty panel when Nike Connected account is added to transaction', () => {
    cy.intercept('**/OmniSearch', { body: omniSearchNikeConnectedLoyaltyResponse }).as('nikeConnectedOmniSearchLoyaltyResponse')
    cy.intercept('**/Transaction/Customer/L01VB23YCPJD', { body: activeTransactionNickAJordan }).as('newTransactionWithLoyalty')
    cy.intercept('**/Loyalty/AccountLevelDetails/L01VB23YCPJD', { body: nikeConnectedAccountLookupResponse }).as('nikeConnectedLoyaltyLookupResponse')
    tags.omniScan()
      .type(nikeConnectedAccountNumber)
      .type('{enter}')
    cy.wait(['@nikeConnectedOmniSearchLoyaltyResponse', '@newTransactionWithLoyalty', '@nikeConnectedLoyaltyLookupResponse'])
    tags.nikeConnectTag()
      .should('be.visible')
      .should('have.text', 'Nike Connected Member')
    tags.nikeConnectMemberPopupLine1().should('not.exist')
    tags.nikeConnectCloseButton().should('not.exist')
    tags.nikeConnectTag().click()
    tags.nikeConnectMemberPopupLine1().should('be.visible')
    tags.nikeConnectCloseButton()
      .should('be.visible')
      .click()
    tags.nikeConnectMemberPopupLine1().should('not.exist')
    tags.nikeConnectCloseButton().should('not.exist')
  })

  it('Test 5: Nike Connect icon appears on loyalty mini view', () => {
    cy.intercept('**/OmniSearch', { body: omniSearchNikeConnectedLoyaltyResponse }).as('nikeConnectedOmniSearchLoyaltyResponse')
    cy.intercept('**/Transaction/Customer/L01VB23YCPJD', { body: activeTransactionNickAJordan }).as('newTransactionWithLoyalty')
    cy.intercept('**/Loyalty/AccountLevelDetails/L01VB23YCPJD', { body: nikeConnectedAccountLookupResponse }).as('nikeConnectedLoyaltyLookupResponse')
    tags.omniScan()
      .type(nikeConnectedAccountNumber)
      .type('{enter}')
    cy.wait(['@nikeConnectedOmniSearchLoyaltyResponse', '@newTransactionWithLoyalty', '@nikeConnectedLoyaltyLookupResponse'])
    tags.loyaltySelectedAthlete().should('have.text', 'Nick A Jordan')
    tags.nikeConnectLoyaltyMiniViewIcon().should('be.visible')
  })

  it('Test 6: Nike Connect tag and miniview icon do not appear for loyalty accounts that are not Nike Connected', () => {
    cy.intercept('**/OmniSearch', { body: omniSearchAbeLincolnOnlyResponse }).as('abeLincolnOmniSearchResponse')
    cy.intercept('**/Transaction/Customer/200000030018', { body: newTransactionAbeLincolnOnlyResponse }).as('abeLincolnNewTransactionResponse')
    cy.intercept('**/Loyalty/AccountLevelDetails/200000030018', { body: abeLincolnRewards }).as('abeLincolnRewardsResponse')
    tags.omniScan()
      .type(AbeLincolnLoyaltyNumber)
      .type('{enter}')
    cy.wait(['@abeLincolnOmniSearchResponse', '@abeLincolnNewTransactionResponse', '@abeLincolnRewardsResponse'])
    tags.nikeConnectTag().should('not.exist')
    tags.nikeConnectLoyaltyMiniViewIcon().should('not.exist')
  })

})

context('Nike Connected transaction item tests', () => {
  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 7: Nike Connected tag appears on transaction card and item details pane', () => {
    cy.intercept('**/OmniSearch', { body: nikeConnectedJacket }).as('nikeConnectedJacketResponse')
    tags.omniScan()
      .type(nikeConnectedJacketUPC)
      .type('{enter}')
    cy.wait('@nikeConnectedJacketResponse')
    tags.nikeConnectTag()
      .should('be.visible')
      .should('have.text', 'Nike Connect Members OnlyNike Connect Members Only')
    tags.nikeConnectProductPopupLine1().should('not.exist')
    tags.nikeConnectProductPopupLine2().should('not.exist')
    tags.nikeConnectCloseButton().should('not.exist')
    tags.nikeConnectTag().click({ multiple: true })
    tags.nikeConnectProductPopupLine1().should('be.visible')
    tags.nikeConnectProductPopupLine2().should('be.visible')
    tags.nikeConnectCloseButton()
      .should('be.visible')
      .click({ multiple: true })
    tags.nikeConnectProductPopupLine1().should('not.exist')
    tags.nikeConnectProductPopupLine2().should('not.exist')
    tags.nikeConnectCloseButton().should('not.exist')   
  })

  it('Test 8: Nike Connect tag does not appear for items that do are not Nike Connected', () => {
    cy.intercept('**/OmniSearch', { body: sweatpantsResponse }).as('nikeSweatpantsResponse')
    tags.omniScan()
      .type(nikeSweatpantsUPC)
      .type('{enter}')
    cy.wait('@nikeSweatpantsResponse')
    tags.nikeConnectTag().should('not.exist')
  })
})