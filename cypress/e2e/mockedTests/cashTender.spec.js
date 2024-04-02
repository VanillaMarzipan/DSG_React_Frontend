/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'
import featureFlagResponse from '../../fixtures/featureFlagResponse.json'

context('Cash Tender tests', () => {

  const tags = new elements()
  const amountDueCashTenderResponseData = '{"header":{"timestamp":1620411017169,"signature":"Oskxw1OQRu1dLhoIx4yAAK2erTbtbAsEIBjfOjspVPY=","transactionKey":"250660087931705072021","tenderIdentifier":"2-250660087931705072021","eReceiptKey":"5008793170011050721016","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-05-07T18:09:44.2628Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":32.09}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":0.0}}'
  const amountDueFinalizeTransactionResponseData = '{"header":{"timestamp":1620411017608,"signature":"a4vB6CkX6uYJOLvL1JxqVrsqcMd+ZNegJzYWo8r2iDE=","transactionKey":"250660087931705072021","tenderIdentifier":"2-250660087931705072021","eReceiptKey":"5008793170011050721016","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-05-07T18:09:44.2628Z","endDateTime":"2021-05-07T18:10:17.5586964Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":32.09}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":0.0}}'
  const overTenderCashResponseData = '{"header":{"timestamp":1620413006090,"signature":"kcFwJEuBoshv1zKQef2pYd6uQ2Uo6Qz66JMt9FXg8hs=","transactionKey":"250700087931705072021","tenderIdentifier":"2-250700087931705072021","eReceiptKey":"5008793170012050721013","storeNumber":879,"registerNumber":317,"transactionNumber":12,"startDateTime":"2021-05-07T18:42:47.602896Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":50.0}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":17.91,"remainingBalance":-17.91}}'
  const overTenderFinalizeTransactionResponseData = '{"header":{"timestamp":1620413006499,"signature":"dRHC5eek33PF1huZCq3XZmcArbdLTz1lVNaJ7ThDA0g=","transactionKey":"250700087931705072021","tenderIdentifier":"2-250700087931705072021","eReceiptKey":"5008793170012050721013","storeNumber":879,"registerNumber":317,"transactionNumber":12,"startDateTime":"2021-05-07T18:42:47.602896Z","endDateTime":"2021-05-07T18:43:26.4553142Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":50.0}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":17.91,"remainingBalance":-17.91}}'
  const lessThanAmountDueResponseData = '{"header":{"timestamp":1620413458551,"signature":"o3AFgITWQn2Xzfoh8TiFvYCRO3mfR3bGh8BHnSerqjw=","transactionKey":"250710087931705072021","tenderIdentifier":"2-250710087931705072021","eReceiptKey":"5008793170013050721010","storeNumber":879,"registerNumber":317,"transactionNumber":13,"startDateTime":"2021-05-07T18:50:20.679566Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":20.0}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":12.09}}'
  const tumblerPrice = Cypress.env().yetiTumblerPrice

  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
    cy.pressComplete()
    tags.sportsMatterCampaignNoThanksButton().click()
    tags.tenderMenuCashButton().click()
  })

  it('Test 1: Clicking the Cash Tender button takes you to the cash tender page', () => {
    cy.get('body').should('contain.text', 'How much cash did you receive?')
    tags.backButton().should('be.visible')
    tags.cashInput().should('be.visible')
    tags.cashInputEnter().should('be.visible')
    tags.tenderMenuCashButton().should('not.exist')
    tags.tenderMenuCreditButton().should('not.exist')
    tags.tenderMenuGiftCardButton().should('not.exist')
    tags.tenderMenuStoreCreditButton().should('not.exist')
    tags.tenderMenuSplitTenderButton().should('not.exist')
    tags.signout().should('not.exist')
    tags.registerFunctions().should('be.visible')
    tags.registerFunctions().click()
    tags.taxExemptButton().should('be.visible')
    tags.connectPinpadButton().should('not.exist')
    tags.noSaleButton().should('not.exist')
    tags.closeRegister().should('not.exist')
  })

  it('Test 2: The cash input field should only allow numeric values with one decimal point.', () => {
    tags.cashInput().click()
      .type('.!@#$%.^&*()_-+=,.')
    tags.cashInput().should('have.value', '0.00')
  })

  it('Test 3: The back button should take you to the tender menu page.', () => {
    tags.backButton().click()
    tags.tenderMenuAmountDue().should('be.visible')
    tags.tenderMenuCashButton().should('be.visible')
    tags.tenderMenuCreditButton().should('be.visible')
    tags.tenderMenuGiftCardButton().should('be.visible')
    tags.registerFunctions().should('be.visible')
    tags.registerFunctions().click()
    tags.taxExemptButton().should('be.visible')
    tags.connectPinpadButton().should('not.exist')
    tags.noSaleButton().should('not.exist')
    tags.closeRegister().should('not.exist')
    tags.registerFunctions().click()
    tags.signout().should('not.exist')
  })

  it('Test 4: Entering the exact amount due completes the transaction, shows $0.00 change due, and new transaction button', () => {
    const price = Number(tumblerPrice).toFixed(2)
    const tax = helpers.determinTax(price)
    const total = helpers.determinTotal(price, tax)
    cy.intercept('**/Tender/NewCashTender', { body: amountDueCashTenderResponseData }).as('cashAmountDue')
    tags.cashInput().click()
      .type(total)
    cy.intercept('**/Transaction/FinalizeTransaction', { body: amountDueFinalizeTransactionResponseData }).as('finalizeTransaction')
    tags.cashInputEnter().click()
    cy.wait(['@cashAmountDue', '@finalizeTransaction' ])
    cy.get('body').should('contain.text', 'Cash Tendered: $32.09')
    tags.changeDue().should('have.text', '0')
    tags.newTransactionButton().should('be.visible')
  })

  it('Test 5: Clicking the New Transaction button takes you to the OmniScan screen with no items in the cart.', () => {
    const price = Number(tumblerPrice).toFixed(2)
    const tax = helpers.determinTax(price)
    const total = helpers.determinTotal(price, tax)
    cy.intercept('**/Tender/NewCashTender', { body: amountDueCashTenderResponseData }).as('cashAmountDue')
    tags.cashInput().click()
      .type(total)
    cy.intercept('**/Transaction/FinalizeTransaction', { body: amountDueFinalizeTransactionResponseData }).as('finalizeTransaction')
    tags.cashInputEnter().click()
    cy.wait([ '@cashAmountDue', '@finalizeTransaction' ])
    cy.intercept('**/Features/879/317/-1', { body: featureFlagResponse })
    tags.newTransactionButton().click()
    cy.wait('@featureFlags')
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
    tags.registerFunctions().should('be.visible')
    tags.signout().should('be.visible')
  })

  it('Test 6: Entering more than the amount due shows the correct change due.', () => {
    cy.intercept('**/Tender/NewCashTender', { body: overTenderCashResponseData }).as('cashOverTender')
    tags.cashInput().click()
      .type('5000')
    cy.intercept('**/Transaction/FinalizeTransaction', { body: overTenderFinalizeTransactionResponseData }).as('finalizeTransaction')
    tags.cashInputEnter().click()
    cy.wait([ '@cashOverTender', '@finalizeTransaction' ])
    cy.get('body').should('contain.text', 'Cash Tendered: $50.00')
    tags.changeDue().should('have.text', '17.91')
    tags.newTransactionButton().should('be.visible')
  })

  it('Test 7: Entering less than the amount due takes you back to the tender menu.', () => {
    cy.intercept('**/Tender/NewCashTender', { body: lessThanAmountDueResponseData }).as('cashUnderTender')
    tags.cashInput().click()
      .type('2000')
    tags.cashInputEnter().click()
    cy.wait('@cashUnderTender')
    tags.amountTendered().should('be.visible')
      .should('have.text', 'Total Tendered:  $20.00')
    tags.remainingAmountDue().should('be.visible')
      .should('have.text', 'Remaining Due:  $12.09')
    tags.tenderMenuCashButton().should('be.visible')
    tags.tenderMenuCreditButton().should('be.visible')
    tags.tenderMenuGiftCardButton().should('be.visible')
    tags.registerFunctions().should('be.visible')
    tags.registerFunctions().click()
    tags.taxExemptButton().should('be.visible')
    tags.connectPinpadButton().should('not.exist')
    tags.noSaleButton().should('not.exist')
    tags.closeRegister().should('not.exist')
    tags.registerFunctions().click()
    tags.signout().should('not.exist')
  })
})
