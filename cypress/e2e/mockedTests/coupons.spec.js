/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'
import yetiWith20Off100ExpiedCouponResponseData from '../../fixtures/coupon/coupon20Off100ExpiredResponse'

context('Coupon tests', () => {
  
  const tags = new elements()
  const gloveUPC = Cypress.env().baseballGloveUPC
  const coupon = Cypress.env().coupon10off50
  const couponNotFound = Cypress.env().couponNotFound
  const coupon20 = Cypress.env().coupon20off100
  const percentOff = Cypress.env().coupon20percentInput
  const dollarOff = Cypress.env().coupon15dollarInput
  const yetiWithCouponThatDoesNotApplyResponseData = '{"type":"Coupon","transaction":{"header":{"timestamp":1620831288991,"signature":"eHl3LrJc4nN1eoQCJGEw0u/BKSnyRISrxSmC28RuTTk=","transactionKey":"252460087931705122021","tenderIdentifier":"1-252460087931705122021","eReceiptKey":"5008793170014051221012","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-12T14:54:21.128278Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00043458","description":"$10 off $50","couponState":0,"couponStateDescription":"Unknown"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":32.09}},"couponCode":"P00043458"}'
  const yetiTumblerBaseballGloveAndGolfClubResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1619105764050,"signature":"jfBU10W+AHHXILDTUdpqR9pjIsSBWF+8zD3Imq5XyiM=","transactionKey":"247480087931704222021","tenderIdentifier":"1-247480087931704222021","eReceiptKey":"5008793170011042221014","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-04-22T15:31:20.658591Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":24.97,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":101.95,"tax":7.14,"grandTotal":109.09,"changeDue":0.00,"remainingBalance":109.09}},"upc":"889751127996"}'
  const yetiTumblerBaseballGloveGolfClubAndCouponResponseData = '{"type":"Coupon","transaction":{"header":{"timestamp":1620827646747,"signature":"SqfBFtqaGiEcvicIUZ4f5RWuaet+eRXSVHInlw9O/eY=","transactionKey":"252420087931705122021","tenderIdentifier":"1-252420087931705122021","eReceiptKey":"5008793170014051221012","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-12T13:53:02.301502Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":27.05,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[{"discountId":"32594189","discountDescription":"$10 off $50","discountAmount":-2.94,"couponCode":"P00043458","discountBasePrice":1}],"giftReceipt":false},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":42.38,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[{"discountId":"32594189","discountDescription":"$10 off $50","discountAmount":-4.61,"couponCode":"P00043458","discountBasePrice":1}],"giftReceipt":false},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":22.52,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[{"discountId":"32594189","discountDescription":"$10 off $50","discountAmount":-2.45,"couponCode":"P00043458","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00043458","expirationDate":"2021-07-01T00:00:00","description":"$10 off $50","couponState":0,"couponStateDescription":"Unknown"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":91.95,"tax":6.45,"grandTotal":98.4,"changeDue":0.0,"remainingBalance":98.4}},"couponCode":"P00043458"}'
  
  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
  })

  it('Test 1: The POS Should show coupon details panel when coupon is scanned', () => {
    cy.addItemOrLoyalty(coupon, yetiTumblerBaseballGloveGolfClubAndCouponResponseData)
    tags.couponDetailPanel().should('be.visible')
  })

  it('Test 2: The coupon details panel should have the correct values for this discount.', () => {
    cy.addItemOrLoyalty(coupon, yetiTumblerBaseballGloveGolfClubAndCouponResponseData)
    tags.couponAppliedIcon().should('be.visible')
    tags.couponDetailDescription().should('be.visible')
      .should('have.text', '$10 off $50')
    tags.couponDetailCode().should('be.visible')
      .should('have.text', 'P00043458')
    tags.couponDetailExpirationDate().should('have.text', '7/1/2021')
  })

  it('Test 3: The coupon should show in the transaction card.', () => {
    cy.addItemOrLoyalty(coupon, yetiTumblerBaseballGloveGolfClubAndCouponResponseData)
    tags.itemDiscountApplied().should('be.visible')
      .should('have.text', '$10 off $50')
    tags.itemDiscountAmount().should('be.visible')
      .should('have.text', ' (-2.94)')
    cy.get('[data-testid=discount-amount10]').should('have.text', ' (-4.61)')
    cy.get('[data-testid=discount-amount20]').should('have.text', ' (-2.45)')
    tags.couponsAndDiscounts().should('be.visible')
      .should('have.text', '-10.00')
  })

  it('Test 4: the POS should show the coupon unknown error if it can not find the coupon.', () => {
    cy.addItemOrLoyalty(gloveUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    cy.intercept('**/OmniSearch',
    {
      statusCode: 422,
      body: '{"type":"Error","error":{"statusCode":422,"reasonCode":0,"message":"Legacy Pricing Mode is enabled but the supplied Coupon Code [00093608] could not be found on the store controller","originatingService":"PosProductService"},"upc":"P00093608"}'
    }).as('barcodeNotFound')
    cy.omniSearch(couponNotFound)
    cy.wait('@barcodeNotFound')
    cy.get('body').should('contain.text', 'Barcode unknown')
  })

  it('Test 5: $10 off $50 does not discount transactions under $50.', () => {
    cy.addItemOrLoyalty(coupon, yetiWithCouponThatDoesNotApplyResponseData)
    tags.couponDetailPanel().should('be.visible')
    tags.itemDiscountApplied().should('not.exist')
    tags.couponsAndDiscounts().should('have.text', '0.00')
  })

  it('Test 6: Validate on clicking overriden for expired/declined coupon, Manual Discount Modal opens & has correct buttons', () => {
    cy.couponOverrideModalOpen()
    tags.couponOverrideModalTitle().should('be.visible').and('have.text', 'MANUAL DISCOUNT')
    tags.couponOverridePercentButton().should('be.visible').and('have.css', 'background-color', 'rgb(0, 101, 84)').and('have.text', 'PERCENT')
    tags.couponOverrideDollarButton().should('be.visible').and('have.css', 'border-color', 'rgb(0, 0, 0)').and('have.text', 'DOLLAR')
    tags.couponOverrideModalCloseButton().click()
  })

  it('Test 7: Validate if Expired or declined coupon can be overriden by Percentage Off Input .', () => {
    cy.couponOverrideModalOpen()
    tags.couponOverrideAmount().should('be.visible').type(percentOff)
    cy.intercept('**/Coupon', {fixture: 'coupon/couponPercentOffInputResponse'}).as('couponPercentOff')
    tags.couponOverrideApplyButton().should('be.visible').click()
    cy.wait('@couponPercentOff')
    tags.couponIcon().should('be.visible').and('contain.text', 'Coupon Accepted')
    cy.get('[data-testid="discount-amount00"]').should('have.text', ' (-7.00)')
    tags.couponRewardDiscount().should('have.text', '-7.00')
  })

  it('Test 8: Validate if expired or declined coupon can be overridden by dollar off Input', () => {
    cy.couponOverrideModalOpen()
    tags.couponOverrideDollarButton().click()
    tags.couponOverrideAmount().should('be.visible').type(dollarOff)
    cy.intercept('**/Coupon', {fixture: 'coupon/couponDollarOffInputResponse'}).as('couponDollarOff')
    tags.couponOverrideApplyButton().should('be.visible').click()
    cy.wait('@couponDollarOff')
    tags.couponIcon().should('be.visible').and('contain.text', 'Coupon Accepted')
    cy.get('[data-testid="discount-amount00"]').should('have.text', ' (-15.00)')
    tags.couponRewardDiscount().should('have.text', '-15.00')
  })

  it('Test 9: Validate $20 Off $100 Expired promotion accepted after overriden & does not discount under $100 ', () => {
    cy.addItemOrLoyalty(coupon20, yetiWith20Off100ExpiedCouponResponseData)
    cy.intercept('**/Coupon', {fixture: 'coupon/coupon20Off100ExpiredOverrideResponse'}).as('expiredOverrideResponse')
    tags.couponOverrideButton().click()
    cy.wait('@expiredOverrideResponse')
    tags.couponIcon().should('be.visible').and('have.text', 'Coupon Accepted')
    tags.couponRewardDiscount().should('have.text', '0.00')
  })

  it('Test 10: Validate $20 Off $100 Expired promotion discount applied in the cart after override ', () => {
    cy.addItemPriceAbove100()
    tags.omniScan().type(coupon20)
    cy.intercept('**/OmniSearch', {fixture: 'coupon/coupon20Off100Above100ResponseData'}).as('20Off100Above100Response')
    tags.scanSubmit().click()
    cy.wait('@20Off100Above100Response')
    cy.intercept('**/Coupon', {fixture: 'coupon/coupon20Off100Above100OverrideResp'}).as('20Off100Above100Override')
    tags.couponOverrideButton().click()
    cy.wait('@20Off100Above100Override')
    cy.get('[data-testid="discount-amount00"]').should('have.text', ' (-4.24)')
    cy.get('[data-testid="discount-amount10"]').should('have.text', ' (-15.76)')
    tags.couponIcon().should('be.visible').and('have.text', 'Coupon Accepted')
    tags.couponRewardDiscount().should('have.text', '-20.00')
  })
})
