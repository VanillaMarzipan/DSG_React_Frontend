/// <reference types="cypress" />
import elements from '../../support/pageElements'
import yetiResponse from '../../fixtures/items/tumbler.json'
import helpers from '../../support/cypressHelpers'
import donationRoundUpResponse from '../../fixtures/donationResponses/donationRoundUpResponse.json'
import sportsMatterAddOneDollarResponse from '../../fixtures/donationResponses/sportsMatterAddOneDollarResponse.json'
import sportsMatterAddFiveDollarsResponse from '../../fixtures/donationResponses/sportsMatterAddFiveDollarsResponse.json'
import sportsMatterOtherTenDollarsResponse from '../../fixtures/donationResponses/sportsMatterOtherTenDollarsResponse.json'
import sweatpantsResponse from '../../fixtures/items/sweatpants.json'
import gloveResponse from '../../fixtures/items/warrantyLinkedGlove.json'
import gloveWarranties from '../../fixtures/warranties/availableWarrantiesForGlove.json'
import noWarranty from '../../fixtures/warranties/gloveNoWarranties.json'
import noAssociate from '../../fixtures/warranties/associateNoWarranties.json'
import addWarranty from '../../fixtures/warranties/addWarrantyToTransaction.json'
import lookupWarrantyAssociate from '../../fixtures/warranties/lookupWarrantyAssociate.json'
import addWarrantyAssociate from '../../fixtures/warranties/addAssociateToTransaction.json'
import singleItemReturnLookupResponse from '../../fixtures/return/inStoreReturns/inStoreOneItemReturn.json'
import selectItemForReturn from '../../fixtures/return/inStoreReturns/addReturnItems/cashOnly.json'
import returnShoeBuyTumber from '../../fixtures/return/inStoreReturns/exchanges/returnShoeBuyTumbler.json'
import noReceiptYetiItem from '../../fixtures/return/noReceiptReturnItemOne.json'
import returnYetiItem from '../../fixtures/return/inStoreReturns/addReturnItems/yetiTumblerOnly.json'
import returnShoeBuyBike from '../../fixtures/return/inStoreReturns/exchanges/returnShoeBuyBike.json'
import returnTumberBuyPepsi from '../../fixtures/return/inStoreReturns/exchanges/returnTumblerBuyPepsi.json'
import returnTumberBuyTumbler from '../../fixtures/return/inStoreReturns/exchanges/returnTumblerBuyTumbler.json'
import evenExchangeTumblers from '../../fixtures/return/inStoreReturns/exchanges/evenExchangeTumblers.json'
import evenExchangeLookup from '../../fixtures/return/inStoreReturns/receiptedLookupTumbler.json'
import receiptedTumblerReturn from '../../fixtures/return/inStoreReturns/addReturnItems/receiptedTumblerReturn.json'
import finalizeEvenExchange from '../../fixtures/return/finalizeEvenExchange.json'
import evenExchangeAddSportsMatter from '../../fixtures/return/inStoreReturns/exchanges/nonReceiptEvenExchange.json'
import evenEchangePriceUpdate from '../../fixtures/return/inStoreReturns/exchanges/evenExchangePriceUpdate.json'


  
  const tags = new elements()
  const tumbler = Cypress.env().yetiTumblerUPC
  const tumblerUPC = Cypress.env().yetiTumblerUPC
  const tumblerPrice = Cypress.env().yetiTumblerPrice
  const tumblerDescription = Cypress.env().yetiTumblerDescription
  const glove = Cypress.env().baseballGloveUPC
  const pepsiDescription = Cypress.env().dietPepsiDescription
  const smDescription = Cypress.env().smDescription
  const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum
  const golfClubUPC = Cypress.env().golfClubUPC
  const recumbantBikeUPC = Cypress.env().recumbantBikeUPC
  const recumbantBikeDescription = Cypress.env().recumbantBikeDescription
  const smPromptForPriceUPC = Cypress.env().smPromptForPriceUPC
  const sweatpantsUPC = Cypress.env().nikeSweatpantsUPC

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

context('Donation Round Up modal tests', () => {

  it('Test 1: Donation Round Up modal should appear after complete is clicked', () => {
      cy.addItemOrLoyalty(tumbler, yetiResponse)
      cy.pressComplete()
      tags.sportsMatterCampaignNoThanksButton().should('be.visible')
      tags.sportsMatterCampaignRoundUpAcceptButton().should('be.visible')
  })

  it('Test 2: Modal appears after warranty prompt with no warranties selected', () => {
      cy.addItemOrLoyalty(glove, gloveResponse)
      cy.intercept('**/Warranty/AvailableWarranties', { body: gloveWarranties }).as('warranties')
      tags.complete().click()
      cy.wait('@warranties')
      cy.intercept('**/Warranty/AddToTransaction', { body: noWarranty }).as('noWarranties')
      cy.intercept('**/1234567', { body: noAssociate }).as('noWarrantyAssociate')
      tags.complete().click()
      cy.wait([ '@noWarranties', '@noWarrantyAssociate' ])
      tags.sportsMatterModalVerbage1().should('be.visible')
      tags.sportsMatterModalVerbage2().should('be.visible')
      tags.sportsMatterModalVerbage3().should('be.visible')
      tags.sportsMatterCampaignRoundUpAcceptButton().should('be.visible')
        .should('have.text', 'ROUND UP*')
      tags.sportsMatterCampaignAddOneDollarButton().should('be.visible')
        .should('have.text', '$1')
      tags.sportsMatterCampaignAddFiveDollarsButton().should('be.visible')
        .should('have.text', '$5')
      tags.sportsMatterCampaignOtherButton().should('be.visible')
        .should('have.text', 'Other')
      tags.sportsMatterCampaignNoThanksButton().should('be.visible')
        .should('have.text', 'No Thanks')
  })

  it('Test 3: Modal appears after warranty prompt with an assoicate and warranty selected.', () => {
    cy.addItemOrLoyalty(glove, gloveResponse)
    cy.intercept('**/Warranty/AvailableWarranties', { body: gloveWarranties }).as('availableWarranties')
    tags.complete().click()
    cy.wait('@availableWarranties')
    cy.intercept('**/LookupAssociate/**', { body: lookupWarrantyAssociate }).as('lookupWarrantyAssociate')
    cy.intercept('**/Warranty/AddToTransaction', { body: addWarranty }).as('Warranty')
    cy.intercept('**/Associate/WarrantySelling/**', { body: addWarrantyAssociate }).as('addWarrantyAssociate')
    tags.warrantySellingAssociate().type('9876543')
    tags.warrantySellingAssociateEnterButton().click()
    cy.wait('@lookupWarrantyAssociate')
    tags.firstProtectionPlanOptionRadioButton1().click()
    tags.complete().click()
    cy.wait('@Warranty')
    cy.wait('@addWarrantyAssociate')
    tags.sportsMatterModalVerbage1().should('be.visible')
    tags.sportsMatterModalVerbage2().should('be.visible')
    tags.sportsMatterModalVerbage3().should('be.visible')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('be.visible')
      .should('have.text', 'ROUND UP*')
    tags.sportsMatterCampaignAddOneDollarButton().should('be.visible')
      .should('have.text', '$1')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('be.visible')
      .should('have.text', '$5')
    tags.sportsMatterCampaignOtherButton().should('be.visible')
      .should('have.text', 'Other')
    tags.sportsMatterCampaignNoThanksButton().should('be.visible')
      .should('have.text', 'No Thanks')
  })

  it('Test 4: Modal has expected verbiage in buttons', () => {
      cy.addItemOrLoyalty(tumbler, yetiResponse)
      cy.pressComplete()
      tags.sportsMatterModalVerbage1().should('be.visible')
      tags.sportsMatterModalVerbage2().should('be.visible')
      tags.sportsMatterModalVerbage3().should('be.visible')
      tags.sportsMatterCampaignRoundUpAcceptButton().should('be.visible')
        .should('have.text', 'ROUND UP*')
      tags.sportsMatterCampaignAddOneDollarButton().should('be.visible')
        .should('have.text', '$1')
      tags.sportsMatterCampaignAddFiveDollarsButton().should('be.visible')
        .should('have.text', '$5')
      tags.sportsMatterCampaignOtherButton().should('be.visible')
        .should('have.text', 'Other')
      tags.sportsMatterCampaignNoThanksButton().should('be.visible')
        .should('have.text', 'No Thanks')
  })

  it('Test 5: Round-up button and verbiage not visible when transaction has an even total', () => {
      cy.addItemOrLoyalty(sweatpantsUPC, sweatpantsResponse)
      cy.pressComplete()
      tags.sportsMatterModalVerbage1().should('be.visible')
      tags.sportsMatterModalVerbage2().should('not.exist')
      tags.sportsMatterModalVerbage3().should('not.exist')
      tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
      tags.sportsMatterCampaignAddOneDollarButton().should('be.visible')
        .should('have.text', '$1')
      tags.sportsMatterCampaignAddFiveDollarsButton().should('be.visible')
        .should('have.text', '$5')
      tags.sportsMatterCampaignOtherButton().should('be.visible')
        .should('have.text', 'Other')
      tags.sportsMatterCampaignNoThanksButton().should('be.visible')
        .should('have.text', 'No Thanks')
  })

  it('Test 6: No Thanks closes modal and does not round up', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignNoThanksButton().click()
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.total().should('have.text', transactionTotal)
  })

  it('Test 7: Round Up closes modal and does round up', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    cy.intercept('**/Product/PriceChange/**', { body: donationRoundUpResponse }).as('roundUpResponse')
    tags.sportsMatterCampaignRoundUpAcceptButton().click()
    cy.wait('@roundUpResponse')
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    transactionTotal=Number(Math.ceil(transactionTotal)).toFixed(2)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.descriptionItem2().should('have.text', smDescription)
    tags.total().should('have.text', transactionTotal)
  })

  it('Test 8: $1 closes modal and rounds up $1', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    cy.intercept('**/Product/PriceChange/**', { body: sportsMatterAddOneDollarResponse }).as('roundUpResponse')
    tags.sportsMatterCampaignAddOneDollarButton().click()
    cy.wait('@roundUpResponse')
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    transactionTotal=(Number(transactionTotal) + 1).toFixed(2)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.descriptionItem2().should('have.text', smDescription)
    tags.priceItem2().should('have.text', '1.00')
    tags.total().should('have.text', transactionTotal)
  })

  it('Test 9: $5 closes modal and adds $5 donation to transaction', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    cy.intercept('**/Product/PriceChange/**', { body: sportsMatterAddFiveDollarsResponse }).as('roundUpResponse')
    tags.sportsMatterCampaignAddOneDollarButton().click()
    cy.wait('@roundUpResponse')
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    transactionTotal=(Number(transactionTotal) + 5).toFixed(2)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.descriptionItem2().should('have.text', smDescription)
    tags.priceItem2().should('have.text', '5.00')
    tags.total().should('have.text', transactionTotal)
  })

})

context('Sports Matter modal on returns/exchanges', () => {

  it('Test 10: Donation round up does not appear on receipted returns.', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
    cy.lookupReturn(singleItemReturnLookupResponse)
    tags.returnItem1().click()
    cy.addReturnItems(selectItemForReturn)
    cy.returnAuth('approve')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
  })

  it('Test 11: Donation round up does not appear on no-receipt returns.', () => {
    tags.returnsFooterButton().click()
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptManualInputField().type(tumblerUPC)
    cy.intercept('**/Returns/NonReceiptedProduct/**', { body: noReceiptYetiItem }).as('noReceiptItemLookup')
    tags.noReceiptManualInputField().type('{enter}')
    cy.wait('@noReceiptItemLookup')
    tags.noReceiptReturnItem1().click()
    cy.intercept('**/Returns/AddNonReceiptedReturnItems/', { body: returnYetiItem }).as('addToTransaction')
    tags.confirmReturnsButton().click()
    cy.wait('@addToTransaction')
    cy.noReceiptReturnApproved()
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
  })

  it('Test 12: Donation round up does not appear on receipted exchanges where the customer is refunded money.', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
    cy.lookupReturn(singleItemReturnLookupResponse)
    tags.returnItem1().click()
    cy.addReturnItems(selectItemForReturn)
    cy.addItemOrLoyalty(tumblerUPC, returnShoeBuyTumber)
    tags.productDetailDescription().should('have.text', tumblerDescription)
    cy.returnAuth('approve')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
  })

  it('Test 13: Donation round up does not appear on no-receipt exchanges where the customer is refunded.', () => {
    tags.returnsFooterButton().click()
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptManualInputField().type(tumblerUPC)
    cy.intercept('**/Returns/NonReceiptedProduct/**', { body: noReceiptYetiItem }).as('noReceiptItemLookup')
    tags.noReceiptManualInputField().type('{enter}')
    cy.wait('@noReceiptItemLookup')
    tags.noReceiptReturnItem1().click()
    cy.intercept('**/Returns/AddNonReceiptedReturnItems/', { body: returnYetiItem }).as('addToTransaction')
    tags.confirmReturnsButton().click()
    cy.wait('@addToTransaction')
    cy.addItemOrLoyalty(golfClubUPC, returnTumberBuyPepsi)
    tags.descriptionItem2().should('have.text', pepsiDescription)
    cy.noReceiptReturnApproved()
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
  })

  it('Test 14: Donation round up does appear on receipted exchanges where the customer owes money.', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
    cy.lookupReturn(singleItemReturnLookupResponse)
    tags.returnItem1().click()
    cy.addReturnItems(selectItemForReturn)
    cy.addItemOrLoyalty(recumbantBikeUPC, returnShoeBuyBike)
    tags.productDetailDescription().should('have.text', recumbantBikeDescription)
    cy.returnAuth('approve')
    tags.sportsMatterCampaignNoThanksButton().should('be.visible')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterModalVerbage2().should('not.exist')
    tags.sportsMatterModalVerbage3().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('be.visible')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('be.visible')
    tags.sportsMatterCampaignOtherButton().should('be.visible')
  })

  it('Test 15: Donation round up does appear on no-receipted exchanges where the customer owes money.', () => {
    tags.returnsFooterButton().click()
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptManualInputField().type(tumblerUPC)
    cy.intercept('**/Returns/NonReceiptedProduct/**', { body: noReceiptYetiItem }).as('noReceiptItemLookup')
    tags.noReceiptManualInputField().type('{enter}')
    cy.wait('@noReceiptItemLookup')
    tags.noReceiptReturnItem1().click()
    cy.intercept('**/Returns/AddNonReceiptedReturnItems/', { body: returnYetiItem }).as('addToTransaction')
    tags.confirmReturnsButton().click()
    cy.wait('@addToTransaction')
    cy.addItemOrLoyalty(golfClubUPC, returnTumberBuyTumbler)
    tags.descriptionItem2().should('have.text', tumblerDescription)
    cy.noReceiptReturnApproved()
    tags.sportsMatterCampaignNoThanksButton().should('be.visible')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('be.visible')
    tags.sportsMatterCampaignAddOneDollarButton().should('be.visible')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('be.visible')
    tags.sportsMatterCampaignOtherButton().should('be.visible')
  })

  it('Test 16: Donation round up does not appear on receipted return even exchanges.', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
    cy.lookupReturn(evenExchangeLookup)
    tags.returnItem1().click()
    cy.addReturnItems(receiptedTumblerReturn)
    cy.addItemOrLoyalty(tumblerUPC, evenExchangeTumblers)
    tags.descriptionItem2().should('have.text', tumblerDescription)
    cy.intercept('**/Transaction/FinalizeTransaction', { body: finalizeEvenExchange }).as('finalizeExchange')
    cy.returnAuth('approve')
    cy.wait('@finalizeExchange')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
  })

  it('Test 17: Donation round up does not appear on no-receipted return even exchanges.', () => {
    tags.returnsFooterButton().click()
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptManualInputField().type(tumblerUPC)
    cy.intercept('**/Returns/NonReceiptedProduct/**', { body: noReceiptYetiItem }).as('noReceiptItemLookup')
    tags.noReceiptManualInputField().type('{enter}')
    cy.wait('@noReceiptItemLookup')
    tags.noReceiptReturnItem1().click()
    cy.intercept('**/Returns/AddNonReceiptedReturnItems/', { body: returnYetiItem }).as('addToTransaction')
    tags.confirmReturnsButton().click()
    cy.wait('@addToTransaction')
    cy.addItemOrLoyalty(smPromptForPriceUPC, evenExchangeAddSportsMatter)
    tags.descriptionItem2().should('have.text', smDescription)
    cy.intercept('**/Product/PriceChange/**', { body: evenEchangePriceUpdate }).as('priceOverride')
    tags.itemPrice0EntryField().type('15.00{enter}')
    cy.wait('@priceOverride')
    cy.intercept('**/Transaction/FinalizeTransaction', { body: finalizeEvenExchange }).as('finalizeExchange')
    cy.noReceiptReturnApproved()
    cy.wait('@finalizeExchange')
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
  })
})

context('Sports Matter Other modal tests', () => {

  it('Test 18: Choosing Other brings up modal with correct buttons and verbiage', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherVerbiage().should('be.visible')
    tags.sportsMatterCampaignOtherDonationInputBox().should('be.visible')
    tags.sportsMatterCampaignOtherAcceptButton().should('be.visible')
    tags.sportsMatterCampaignOtherNoThanksButton().should('be.visible')
  })

  it('Test 19: Accept button is not clickable until an amount is entered', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherAcceptButton().should('be.visible')
      .should('have.css', 'background-color', 'rgb(200, 200, 200)')
      .click()
    tags.sportsMatterCampaignOtherVerbiage().should('be.visible')
    tags.sportsMatterCampaignOtherDonationInputBox().should('be.visible')
    tags.sportsMatterCampaignOtherAcceptButton().should('be.visible')
    tags.sportsMatterCampaignOtherNoThanksButton().should('be.visible')
  })

  it('Test 20: Choosing No Thanks closes Other modal and Sports Matter modal and does not add donation', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherVerbiage().should('be.visible')
    tags.sportsMatterCampaignOtherDonationInputBox().should('be.visible')
    tags.sportsMatterCampaignOtherAcceptButton().should('be.visible')
    tags.sportsMatterCampaignOtherNoThanksButton().should('be.visible')
    tags.sportsMatterCampaignOtherNoThanksButton().click()
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.sportsMatterCampaignOtherVerbiage().should('not.exist')
    tags.sportsMatterCampaignOtherDonationInputBox().should('not.exist')
    tags.sportsMatterCampaignOtherAcceptButton().should('not.exist')
    tags.sportsMatterCampaignOtherNoThanksButton().should('not.exist')
    tags.total().should('have.text', transactionTotal)
  })

  it('Test 21: Pressing Enter key adds donation to transaction', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherDonationInputBox().type('1000')
      .should('have.value', '$10.00')
    cy.intercept('**/Product/PriceChange/**', { body: sportsMatterOtherTenDollarsResponse }).as('roundUpResponse')
    tags.sportsMatterCampaignOtherDonationInputBox().type('{enter}')
    cy.wait('@roundUpResponse')
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    transactionTotal=(Number(transactionTotal) + 10).toFixed(2)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.sportsMatterCampaignOtherVerbiage().should('not.exist')
    tags.sportsMatterCampaignOtherDonationInputBox().should('not.exist')
    tags.sportsMatterCampaignOtherAcceptButton().should('not.exist')
    tags.sportsMatterCampaignOtherNoThanksButton().should('not.exist')
    tags.descriptionItem2().should('have.text', smDescription)
    tags.priceItem2().should('have.text', '10.00')
    tags.total().should('have.text', transactionTotal)
  })

  it('Test 22: Clicking Accept adds donation to transaction', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherDonationInputBox().type('1000')
      .should('have.value', '$10.00')
    cy.intercept('**/Product/PriceChange/**', { body: sportsMatterOtherTenDollarsResponse }).as('roundUpResponse')
    tags.sportsMatterCampaignOtherAcceptButton().should('be.visible')
      .should('have.css', 'background-color', 'rgb(187, 88, 17)')
      .click()
    cy.wait('@roundUpResponse')
    let transactionTax=helpers.determinTax(tumblerPrice)
    let transactionTotal=helpers.determinTotal(tumblerPrice, transactionTax)
    transactionTotal=(Number(transactionTotal) + 10).toFixed(2)
    tags.sportsMatterCampaignRoundUpAcceptButton().should('not.exist')
    tags.sportsMatterCampaignNoThanksButton().should('not.exist')
    tags.sportsMatterCampaignAddOneDollarButton().should('not.exist')
    tags.sportsMatterCampaignAddFiveDollarsButton().should('not.exist')
    tags.sportsMatterCampaignOtherButton().should('not.exist')
    tags.sportsMatterCampaignOtherVerbiage().should('not.exist')
    tags.sportsMatterCampaignOtherDonationInputBox().should('not.exist')
    tags.sportsMatterCampaignOtherAcceptButton().should('not.exist')
    tags.sportsMatterCampaignOtherNoThanksButton().should('not.exist')
    tags.descriptionItem2().should('have.text', smDescription)
    tags.priceItem2().should('have.text', '10.00')
    tags.total().should('have.text', transactionTotal)
  })

  it('Test 23: Cannot add more than 7 digits to donation', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherDonationInputBox().type('9999999999999999999')
      .should('have.value', '$99999.99')
  })

/*   Finish these tests after bug 9187 is resolved
  it('Test 24: Cannot add letters to donation', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherDonationInputBox().type('abcdef')
      .should('have.value', '$0.00')
  })

  it('Test 25: Cannot add symbols to donation', () => {
    cy.addItemOrLoyalty(tumbler, yetiResponse)
    cy.pressComplete()
    tags.sportsMatterCampaignOtherButton().click()
    tags.sportsMatterCampaignOtherDonationInputBox().type('!@#$%^&*')
      .should('have.value', '$0.00')
  }) */

})