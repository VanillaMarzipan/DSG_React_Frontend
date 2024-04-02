/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Reward Certificate test', () => {

  const tags = new elements()
  const rewardCert = Cypress.env().rewardCertificate
  const tumblerWith10RewardCert = '{"type":"Reward","reward":{"rewardCertificateNumber":"R0002601320000003","onlineCertificateNumber":"RWDX2NSHHB6","status":1,"statusDescription":"Available","message":"","rewardAmount":10.00,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-06T00:00:00"},"transaction":{"header":{"timestamp":1620737746557,"signature":"4b9I2OpdZB9T7SyZU5CnpHQPAhECV577xPP7ZN/NIBc=","transactionKey":"251770087931705112021","tenderIdentifier":"1-251770087931705112021","eReceiptKey":"5008793170014051121015","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-11T12:55:00.947057Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":19.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[{"discountDescription":"Reward Certificate","discountAmount":-10.0,"rewardCertificateNumber":"R0002601320000003","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[{"rewardCertificateNumber":"R0002601320000003","rewardCertificateType":1,"rewardAmount":10.0,"redeemed":false,"expired":false,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-06T00:00:00"}],"receiptMessages":[],"total":{"subTotal":19.99,"tax":1.4,"grandTotal":21.39,"changeDue":0.0,"remainingBalance":21.39}}}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.addItemOrLoyalty(rewardCert, tumblerWith10RewardCert)
  })

  it('Test 1: The POS should show the coupon detail panel', () => {
    tags.couponDetailPanel().should('be.visible')
    tags.couponAppliedIcon().should('be.visible')
      .should('have.text', 'Reward Accepted')
    tags.couponDetailDescription().should('be.visible')
      .should('have.text', 'Reward Certificate ($10 off)')
    tags.couponDetailCode().should('be.visible')
      .should('have.text', 'R0002601320000003')
    tags.couponDetailExpirationDate().should('be.visible')
      .should('have.text', '12/31/2021')
  })

  it('Test 2: The transaction card shows the reward discount.', () => {
    tags.itemDiscountApplied().should('be.visible')
      .should('have.text', 'Reward Certificate')
    tags.couponsAndDiscounts().should('have.text', '-10.00')
  })
})
