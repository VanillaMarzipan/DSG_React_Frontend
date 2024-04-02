/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Reprint Receipt tests', () => {
  
  const tags = new elements()
  const associateNum = Cypress.env().associateNum
  const associatePIN = Cypress.env().associatePIN
  const reprintReceipt = '{"transaction":{"header":{"timestamp":1621000186492,"signature":"BgH+ZCb4lyQzD955sO58Ao4f8AvVsHtFghEOpxIb0nE=","transactionKey":"250710087931705072021","tenderIdentifier":"3-250710087931705072021","eReceiptKey":"5008793170013050721010","storeNumber":879,"registerNumber":317,"transactionNumber":13,"startDateTime":"2021-05-07T18:50:20.679566Z","endDateTime":"2021-05-07T19:04:09.740517Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":15.0},{"tenderType":1,"tenderTypeDescription":"Cash","amount":20.0}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":2.91,"remainingBalance":-2.91}},"associate":{"associateId":"1234567","firstName":"Johnny","lastName":"Cashier"}}'

  beforeEach(() => {
    cy.launchPage()
  })

  it('Test 1: Receipts menu should be available on the initial scan screen.', () => {
    cy.login(associateNum, associatePIN)
    tags.receiptOptions().should('be.visible')
  })

  it('Test 2: Without a previous transaction, receipt reprint should be grayed out.', () => {
    cy.login(associateNum, associatePIN)
    tags.receiptOptions().click()
    tags.giftReceiptButton().should('be.visible')
    tags.reprintGiftReceiptButton().should('be.visible')
    tags.reprintLastReceiptButton().should('be.visible')
    cy.get('#reprint-receipt-circle').should('have.css', 'fill', 'rgb(200, 200, 200)')
    tags.reprintLastReceiptButton().click()
    tags.reprintLastReceiptButton().should('not.contain', 'PRINTING...')
    tags.footerMenuOverlay().should('be.visible')
  })

  it('Test 3: If not in a transaction, gift receipt option should be grayed out.', () => {
    cy.login(associateNum, associatePIN)
    tags.receiptOptions().click()
    tags.reprintLastReceiptButton().should('be.visible')
    tags.giftReceiptButton().should('be.visible')
    cy.get('#gift-receipt-circle').should('have.css', 'fill', 'rgb(200, 200, 200)')
    tags.giftReceiptButton().click()
    tags.giftReceiptButtonText().should('not.contain', 'PRINTING...')
    tags.footerMenuOverlay().should('be.visible')
  })

  it('Test 4: If a previous transaction was found, only gift receipts should be unavailable.', () => {
    cy.login(associateNum, associatePIN, reprintReceipt)
    tags.receiptOptions().click()
    cy.get('#gift-receipt-circle').should('have.css', 'fill', 'rgb(200, 200, 200)')
    tags.giftReceiptButton().click()
    tags.giftReceiptButtonText().should('not.contain', 'PRINTING...')
    tags.footerMenuOverlay().should('be.visible')
    tags.giftReceiptButton().should('be.visible')
    tags.reprintLastReceiptButton().should('be.visible')
    tags.reprintGiftReceiptButton().should('be.visible')
    cy.get('#reprint-gift-receipt-circle').should('have.css', 'fill', 'rgb(245, 122, 25)')
    cy.get('#reprint-receipt-circle').should('have.css', 'fill', 'rgb(245, 122, 25)')
    tags.reprintLastReceiptButton().click()
    tags.reprintLastReceiptButton().should('have.text', 'PRINTING...')
    tags.footerMenuOverlay().should('not.exist')
  })
})
