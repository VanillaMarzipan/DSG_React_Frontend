/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

context('Expired Coupons', () => {
  
  const overrideExpiredCoupon = Cypress.env().overrideExpiredCoupon
  const overrideNoPromotionsCoupon = Cypress.env().overrideNoPromotionsCoupon
  const couponNoOverrideNeeded = Cypress.env().couponNoOverrideNeeded
  const omniSearchExpiredCouponThatAppliesAfterOverride = '{"type":"Coupon","transaction":{"header":{"timestamp":1632486875188,"signature":"SfsSypeBIulNtkNeL8OOcVPmFpCFk8k7FwwI5SFCFEs=","transactionKey":"2842890088831409242021","tenderIdentifier":"1-2842890088831409242021","eReceiptKey":"5008883140011092421019","storeNumber":879,"registerNumber":314,"transactionNumber":11,"startDateTime":"2021-09-24T12:33:16.741479Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"887768671082","sku":"018523364","style":"WTA09RB18D125","description":"Wilson 12.5’’ A950 Series Glove","quantity":1,"returnPrice":89.99,"promptForPrice":false,"unitPrice":89.99,"referencePrice":89.99,"everydayPrice":89.99,"priceOverridden":false,"originalUnitPrice":89.99,"variants":{},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17WILA125950MNSBLBGL?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-002-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00045194","description":"$10 off $50","couponState":1,"couponStateDescription":"NotApplied","couponPromotionStatus":2,"couponPromotionStatusDescription":"ExpiredPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":89.99,"tax":6.3,"grandTotal":96.29,"changeDue":0.0,"remainingBalance":96.29}},"couponCode":"p00045194"}'
  const couponThatAutoAppliesAfterOverride = '{"header":{"timestamp":1632486918427,"signature":"cA18W6pnGfbcTH1hgI7zQJaVKNWRuSgRTpm4PMTkqI0=","transactionKey":"2842890088831409242021","tenderIdentifier":"1-2842890088831409242021","eReceiptKey":"5008883140011092421019","storeNumber":879,"registerNumber":314,"transactionNumber":11,"startDateTime":"2021-09-24T12:33:16.741479Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"887768671082","sku":"018523364","style":"WTA09RB18D125","description":"Wilson 12.5’’ A950 Series Glove","quantity":1,"returnPrice":79.99,"promptForPrice":false,"unitPrice":89.99,"referencePrice":89.99,"everydayPrice":89.99,"priceOverridden":false,"originalUnitPrice":89.99,"variants":{},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17WILA125950MNSBLBGL?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-002-001","attributes":[],"appliedDiscounts":[{"discountId":"33269965","discountDescription":"$10 off $50","discountAmount":-10.0,"couponCode":"P00045194","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00045194","description":"$10 off $50","couponState":2,"couponStateDescription":"Applied","couponPromotionStatus":2,"couponPromotionStatusDescription":"ExpiredPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":79.99,"tax":5.6,"grandTotal":85.59,"changeDue":0.0,"remainingBalance":85.59}}'
  const omniSearchCouponWithNoPromotionsAfterOverride = '{"type":"Coupon","transaction":{"header":{"timestamp":1632487494643,"signature":"7aX1rLl3cVBSEQapDqbgamuz/4ncNndskAg0NmW4lfY=","transactionKey":"2842900088831409242021","tenderIdentifier":"1-2842900088831409242021","eReceiptKey":"5008883140012092421016","storeNumber":879,"registerNumber":314,"transactionNumber":12,"startDateTime":"2021-09-24T12:44:40.695532Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"887768671082","sku":"018523364","style":"WTA09RB18D125","description":"Wilson 12.5’’ A950 Series Glove","quantity":1,"returnPrice":89.99,"promptForPrice":false,"unitPrice":89.99,"referencePrice":89.99,"everydayPrice":89.99,"priceOverridden":false,"originalUnitPrice":89.99,"variants":{},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17WILA125950MNSBLBGL?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-002-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00044905","description":"20% off Entire Store","couponState":1,"couponStateDescription":"NotApplied","couponPromotionStatus":3,"couponPromotionStatusDescription":"NoPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":89.99,"tax":6.3,"grandTotal":96.29,"changeDue":0.0,"remainingBalance":96.29}},"couponCode":"p00044905"}'
  const couponWithNoPromosThatAppliesPercentOffAfterOverride = '{"header":{"timestamp":1632487581226,"signature":"TSh9UkBcnkLC8PKg+aEmuizxa3hatl18t/W7seeKcM4=","transactionKey":"2842900088831409242021","tenderIdentifier":"1-2842900088831409242021","eReceiptKey":"5008883140012092421016","storeNumber":879,"registerNumber":314,"transactionNumber":12,"startDateTime":"2021-09-24T12:44:40.695532Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"887768671082","sku":"018523364","style":"WTA09RB18D125","description":"Wilson 12.5’’ A950 Series Glove","quantity":1,"returnPrice":71.99,"promptForPrice":false,"unitPrice":89.99,"referencePrice":89.99,"everydayPrice":89.99,"priceOverridden":false,"originalUnitPrice":89.99,"variants":{},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17WILA125950MNSBLBGL?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-002-001","attributes":[],"appliedDiscounts":[{"discountId":"99999999","discountDescription":"Manual Discount (Percent Off)","discountAmount":-18.0,"couponCode":"P00044905","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00044905","description":"20% off Entire Store","couponState":4,"couponStateDescription":"Overridden","couponPromotionStatus":3,"couponPromotionStatusDescription":"NoPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":71.99,"tax":5.04,"grandTotal":77.03,"changeDue":0.0,"remainingBalance":77.03}}'
  const couponWithNoPromosThatAppliesDollarOffAfterOverride = '{"header":{"timestamp":1632488886212,"signature":"zEW0XDx+kDiZeytB7Q+fe2AbMmphY9+zZUqLo+1+5L4=","transactionKey":"2842920088831409242021","tenderIdentifier":"1-2842920088831409242021","eReceiptKey":"5008883140014092421019","storeNumber":879,"registerNumber":314,"transactionNumber":13,"startDateTime":"2021-09-24T13:07:42.586968Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"887768671082","sku":"018523364","style":"WTA09RB18D125","description":"Wilson 12.5’’ A950 Series Glove","quantity":1,"returnPrice":59.99,"promptForPrice":false,"unitPrice":89.99,"referencePrice":89.99,"everydayPrice":89.99,"priceOverridden":false,"originalUnitPrice":89.99,"variants":{},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17WILA125950MNSBLBGL?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-002-001","attributes":[],"appliedDiscounts":[{"discountId":"88888888","discountDescription":"Manual Discount (Dollar Off)","discountAmount":-30.0,"couponCode":"P00044905","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00044905","description":"20% off Entire Store","couponState":4,"couponStateDescription":"Overridden","couponPromotionStatus":3,"couponPromotionStatusDescription":"NoPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":59.99,"tax":4.2,"grandTotal":64.19,"changeDue":0.0,"remainingBalance":64.19}}'
  const omniSearchCouponWithValidPromotion = '{"type":"Coupon","transaction":{"header":{"timestamp":1632489210469,"signature":"g8jN6HDz3Us3IEWUiwkhTlLT5yV343LMCqBIG7Blk8Q=","transactionKey":"2842930088831409242021","tenderIdentifier":"1-2842930088831409242021","eReceiptKey":"5008883140015092421016","storeNumber":879,"registerNumber":314,"transactionNumber":14,"startDateTime":"2021-09-24T13:12:40.718907Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"887768671082","sku":"018523364","style":"WTA09RB18D125","description":"Wilson 12.5’’ A950 Series Glove","quantity":1,"returnPrice":71.99,"promptForPrice":false,"unitPrice":89.99,"referencePrice":89.99,"everydayPrice":89.99,"priceOverridden":false,"originalUnitPrice":89.99,"variants":{},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17WILA125950MNSBLBGL?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-002-001","attributes":[],"appliedDiscounts":[{"discountId":"33404744","discountDescription":"20% off Entire Store","discountAmount":-18.0,"couponCode":"P00044920","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[{"couponCode":"P00044920","expirationDate":"2021-10-30T00:00:00","description":"20% off Entire Store","couponState":2,"couponStateDescription":"Applied","couponPromotionStatus":1,"couponPromotionStatusDescription":"ActivePromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":71.99,"tax":5.04,"grandTotal":77.03,"changeDue":0.0,"remainingBalance":77.03}},"couponCode":"P00044920"}'

  const tags = new elements()

  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
  })

  it('Test 1: An expired coupon should show the expired coupon icon and verbiage.', () => {
    cy.addItemOrLoyalty(overrideExpiredCoupon, omniSearchExpiredCouponThatAppliesAfterOverride)
    tags.couponIcon().should('be.visible')
      .should('be.visible')
      .should('contain.text', 'Coupon declined')
      .should('contain.text', 'Coupon Expired')
    tags.couponOverrideButton().should('be.visible')
      .should('have.text', 'OVERRIDE')
  })

  it('Test 2: Clicking the override button auto applies the coupon since this coupon exists and has not been purged.', () => {
    cy.addItemOrLoyalty(overrideExpiredCoupon, omniSearchExpiredCouponThatAppliesAfterOverride)
    cy.intercept('**/Coupon', { body: couponThatAutoAppliesAfterOverride }).as('coupon')
    tags.couponOverrideButton().click()
    cy.wait('@coupon')
    tags.couponAppliedIcon().should('be.visible')
      .should('have.text', 'Coupon Accepted')
    tags.couponDetailCode().should('be.visible')
      .should('have.text', overrideExpiredCoupon)
    tags.couponsAndDiscounts().should('be.visible')
      .should('have.text', '-10.00')
  })

  it('Test 3: Clicking the override button on a coupon allows a percent off transaction level coupon to apply', () => {
    cy.addItemOrLoyalty(overrideNoPromotionsCoupon, omniSearchCouponWithNoPromotionsAfterOverride)
    cy.intercept('**/Coupon', { body: couponWithNoPromosThatAppliesPercentOffAfterOverride }).as('coupon')
    tags.couponOverrideButton().click()
    tags.couponOverrideDollarButton().click()
    tags.couponOverridePercentButton().click()
      .should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.couponOverrideAmount().type('20')
    tags.couponOverrideApplyButton().click()
    cy.wait('@coupon')
    tags.couponAppliedIcon().should('be.visible')
      .should('have.text', 'Coupon Accepted')
    tags.couponsAndDiscounts().should('be.visible')
      .should('have.text', '-18.00')
  })

  it('Test 4: Clicking the override button on a coupon allows a dollar off transaction level coupon to apply', () => {
    cy.addItemOrLoyalty(overrideNoPromotionsCoupon, omniSearchCouponWithNoPromotionsAfterOverride)
    cy.intercept('**/Coupon', { body: couponWithNoPromosThatAppliesDollarOffAfterOverride }).as('coupon')
    tags.couponOverrideButton().click()
    tags.couponOverridePercentButton().click()
    tags.couponOverrideDollarButton().click()
    .should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.couponOverrideAmount().type('30')
    tags.couponOverrideApplyButton().click()
    cy.wait('@coupon')
    tags.couponAppliedIcon().should('be.visible')
      .should('have.text', 'Coupon Accepted')
    tags.couponsAndDiscounts().should('be.visible')
      .should('have.text', '-30.00')
  })

  it('Test 5: A valid promotion applies as expected without an override.', () => {
    cy.addItemOrLoyalty(couponNoOverrideNeeded, omniSearchCouponWithValidPromotion)
    tags.couponAppliedIcon().should('be.visible')
      .should('have.text', 'Coupon Accepted')
    tags.couponDetailCode().should('be.visible')
      .should('have.text', couponNoOverrideNeeded)
    tags.couponsAndDiscounts().should('be.visible')
      .should('be.visible')
      .should('have.text', '-18.00')
  })
})
