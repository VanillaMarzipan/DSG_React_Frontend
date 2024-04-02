/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'

context('Warranty tests', () => {

  const tags = new elements()
  const tumblerUPC = Cypress.env().yetiTumblerUPC
  const gloveUPC = Cypress.env().baseballGloveUPC
  const glovePrice = Cypress.env().baseballGlovePrice
  const gloveDescription = Cypress.env().baseballGloveDescription
  const gloveWarrantyPrice = Cypress.env().baseballGloveOneYearWarrantyPrice
  const gloveWarrantyDescription = Cypress.env().baseballGloveOneYearWarrantyDescription
  const warrantySoldBy = Cypress.env().baseballGloveWarrantySoldBy
  const yetiTumblerResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1618433317540,"signature":"4eD/8OevagKShq1WBMV0Y/B40a95YaA8Hy0x9p3aXcY=","transactionKey":"246200087911304142021","tenderIdentifier":"1-246200087911304142021","eReceiptKey":"5008791130009041421013","storeNumber":879,"registerNumber":113,"transactionNumber":9,"startDateTime":"2021-04-14T20:48:37.383631Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.00,"remainingBalance":32.09}},"upc":"888830050118"}'
  const baseballGloveResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1619034423025,"signature":"O5nxTgr3XsKii8yypSd6QbQNLvVdGjJdrgcokgYiLmE=","transactionKey":"246910087931704212021","tenderIdentifier":"1-246910087931704212021","eReceiptKey":"5008793170011042121017","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-04-21T19:47:02.795626Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.50,"grandTotal":53.49,"changeDue":0.00,"remainingBalance":53.49}},"upc":"083321578120"}'
  const addNoWarrantyResponse = '{"header":{"timestamp":1654283087646,"signature":"7msXC48M5kg58MLs9JZ6WyFx2Y/qtks+2J+5skqy+WU=","transactionKey":"410250087922506032022","tenderIdentifier":"1-410250087922506032022","eReceiptKey":"5008792250035060322018","storeNumber":879,"registerNumber":225,"transactionNumber":35,"startDateTime":"2022-06-03T19:04:08.342947Z","transactionDate":"2022-06-03T00:00:00","timezoneOffset":-240,"associateId":"1234567","warrantySellingAssociateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"totalItemTax":3.5,"hierarchy":"330-001-001-001","attributes":[6],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.5,"grandTotal":53.49,"changeDue":0.0,"remainingBalance":53.49}}'
  const addCurrentAssociate = '{"header":{"timestamp":1654283401904,"signature":"oZ5oc+EDAXSuLRRCgZfr3/dm1eDglVDk5Mo179vJ+Qk=","transactionKey":"410250087922506032022","tenderIdentifier":"1-410250087922506032022","eReceiptKey":"5008792250035060322018","storeNumber":879,"registerNumber":225,"transactionNumber":35,"startDateTime":"2022-06-03T19:04:08.342947Z","transactionDate":"2022-06-03T00:00:00","timezoneOffset":-240,"associateId":"1234567","warrantySellingAssociateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"totalItemTax":3.5,"hierarchy":"330-001-001-001","attributes":[6],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.5,"grandTotal":53.49,"changeDue":0.0,"remainingBalance":53.49}}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 1: When there are no warranties the POS should move on to tender screen', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerResponseData)
    cy.pressComplete()
    tags.backButton().should('be.visible')
    tags.tenderMenuAmountDue().should('be.visible')
    tags.tenderMenuCashButton().should('be.visible')
    tags.tenderMenuCreditButton().should('be.visible')
    tags.tenderMenuGiftCardButton().should('be.visible')
  })

  it('Test 2: When there are warranties available the POS should display the No Sweat Protection Plan page.', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.warrantiesForGlove()
    cy.get('body').should('contain.text', 'No Sweat Protection Plan')
      .should('contain.text', 'No Protection Plan')
      .should('contain.text', '1 Year Replacement Plan - 8.99')
    tags.warrantySellingAssociate().should('be.visible')
    tags.warrantySellingAssociateEnterButton().should('be.visible')
    tags.noProtectionPlanRadioButton0().should('be.visible')
    tags.firstProtectionPlanOptionRadioButton1().should('be.visible')
  })

  it('Test 3: No Sweat Protection Plan page loads with no protection plan selected by default', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.warrantiesForGlove()
    tags.warrantyItemDisplay().should('be.visible')
    tags.noProtectionPlanRadioButton0Selected().should('be.visible')
    tags.firstProtectionPlanOptionRadioButton1Selected().should('not.be.visible')
  })

  it('Test 4: Selecting No Protection Plan does not add a warranty to the transaction card.', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.warrantiesForGlove()
    cy.intercept('**/AddToTransaction', { body: addNoWarrantyResponse }).as('addNoWarranty')
    cy.intercept('**/Associate/WarrantySelling/**', { body: addCurrentAssociate }).as('addAssociate')
    tags.complete().click()
    cy.wait([ '@addNoWarranty', '@addAssociate' ])
    tags.sportsMatterCampaignNoThanksButton().click()
    tags.transactionCard().should('contain.text', gloveDescription)
      .should('contain.text', gloveUPC)
      .should('contain.text', glovePrice)
      .should('not.contain', gloveWarrantyDescription)
      .should('not.contain', gloveWarrantyPrice)
      .should('not.contain', gloveWarrantyPrice)
      .should('not.contain', warrantySoldBy)
    tags.subtotal().should('have.text', glovePrice)
  })

  it('Test 5: A warranty without selling associate defaults to cashier and no warranty seller appears on trx card', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.warrantiesForGlove()
    cy.oneYearWarrantyNoSellingAssociate()
    tags.sportsMatterCampaignNoThanksButton().click()
    tags.transactionCard().should('contain.text', gloveWarrantyDescription)
    const prices = [glovePrice, gloveWarrantyPrice]
    const subtotal = helpers.determinSubtotal(prices)
    tags.subtotal().should('have.text', subtotal)
  })

  it('Test 6: Clicking Complete adds the warranty to the transaction subtotal, and total.', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.warrantiesForGlove()
    cy.janeManagerSellingAssociate()
    tags.firstProtectionPlanOptionRadioButton1().click()
    cy.oneYearWarrantyGloveSellingAssociate()
    tags.sportsMatterCampaignNoThanksButton().click()
    tags.transactionCard().should('be.visible')
      .should('contain.text', gloveUPC)
      .should('contain.text', gloveDescription)
      .should('contain.text', glovePrice)
      .should('contain.text', gloveWarrantyDescription)
      .should('contain.text', warrantySoldBy)
      .should('contain.text', gloveWarrantyPrice)
    const prices = [glovePrice, gloveWarrantyPrice]
    const subtotal = helpers.determinSubtotal(prices)
    tags.subtotal().should('have.text', subtotal)
  })
})
