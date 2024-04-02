/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

context('Reward Certificate Panel tests', () => {
  const tags = new elements()
  const customerResponseData = '{"header":{"timestamp":1620840434935,"signature":"xdvTvS/Srl/qq21gUMGJRZhQOZFjbVbUXVBBIO73zB4=","transactionKey":"252720087931705122021","tenderIdentifier":"1-252720087931705122021","eReceiptKey":"5008793170014051221012","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-12T17:27:02.256122Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"200000030018"},"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":32.09}}'
  const loyaltylookupResponseData = '{"type":"LoyaltyAccounts","loyalty":[{"id":15,"firstName":"Abraham","lastName":"Lincoln","emailAddress":"ABRAHAM.LINCOLN@PRESIDENT.GOV","street":"1600 Pennsylvania Ave NW","city":"Washington","state":"DC","zip":"20500","homePhone":"7241234321","loyalty":"200000030018","subAccount":"20000003","currentPointBalance":0.0,"rewardAmount":0.0}],"transaction":{"header":{"timestamp":1620834355876,"signature":"LYOs2Y8gq2iMYFJipAxh9RY8EH7p7bOkbXkS5dtOll8=","transactionKey":"252630087931705122021","tenderIdentifier":"1-252630087931705122021","eReceiptKey":"5008793170014051221012","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-12T15:45:37.660316Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":32.09}}}'
  const accountLevelDetailsResponseData = '{"rewards":[{"rewardCertificateNumber":"R0002600120000003","rewardType":0,"rewardTypeDescription":"RewardCertificate","onlineCertificateNumber":"RWDY8UHVJYG","status":1,"statusDescription":"Available","rewardAmount":10.00,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-20T00:00:00"},{"rewardCertificateNumber":"R0002601320000003","rewardType":0,"rewardTypeDescription":"RewardCertificate","onlineCertificateNumber":"RWDX2NSHHB6","status":1,"statusDescription":"Available","rewardAmount":10.00,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-06T00:00:00"},{"rewardCertificateNumber":"R0002601420000003","rewardType":0,"rewardTypeDescription":"RewardCertificate","onlineCertificateNumber":"RWDEJW39S55","status":1,"statusDescription":"Available","rewardAmount":10.00,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-06T00:00:00"}],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":0.0,"rewardAmount":0.00,"pointsToNextReward":300.0,"currentRewardTier":0.0,"nextRewardTier":10.0}}'
  const afterAddingRewardResponseData = '{"type":"Reward","reward":{"rewardCertificateNumber":"R0002600120000003","onlineCertificateNumber":"RWDY8UHVJYG","status":1,"statusDescription":"Available","message":"","rewardAmount":10.00,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-20T00:00:00"},"transaction":{"header":{"timestamp":1620840775410,"signature":"98iQvyrFrX99lzor0O81X6P2LcNAYrskS5HloMg9uQc=","transactionKey":"252720087931705122021","tenderIdentifier":"1-252720087931705122021","eReceiptKey":"5008793170014051221012","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-12T17:27:02.256122Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":19.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[{"discountDescription":"Reward Certificate","discountAmount":-10.0,"rewardCertificateNumber":"R0002600120000003","discountBasePrice":1}],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[{"rewardCertificateNumber":"R0002600120000003","rewardCertificateType":1,"rewardAmount":10.0,"redeemed":false,"expired":false,"expirationDate":"2021-12-31T23:59:59","graceExpirationDate":"2022-03-31T23:59:59","activeDate":"2021-04-20T00:00:00"}],"receiptMessages":[],"customer":{"loyaltyNumber":"200000030018"},"total":{"subTotal":19.99,"tax":1.4,"grandTotal":21.39,"changeDue":0.0,"remainingBalance":21.39}}}'

  beforeEach(() => {
    cy.launchPageLoggedIn(activeTransaction)
    cy.intercept('**/Transaction/Customer/**', { body: customerResponseData }).as('customerResponse')
    cy.intercept('**/OmniSearch', { body: loyaltylookupResponseData }).as('accountLookup')
    cy.intercept('**/AccountLevelDetails/**', { body: accountLevelDetailsResponseData }).as('accountLevelDetails')
    cy.omniSearch(Cypress.env().phoneAbeLincoln)
    cy.wait([ '@accountLookup', '@customerResponse', '@accountLevelDetails' ])
  })

  it('Test 1: The POS should show reward count as a badge on loyalty card, and on details panel.', () => {
    tags.rewardCountBadge().should('be.visible')
      .should('have.text', '3')
    tags.rewardsAvailableCard().should('be.visible')
      .should('have.text', '3 Rewards Available')
  })

  it('Test 2: The rewards details panel should show reward certificates with the correct details.', () => {
    tags.rewardsAvailableCard().should('be.visible')
      .should('have.text', '3 Rewards Available')
    tags.rewardsAvailableCard().click()
    tags.rewardCertificate1().should('be.visible')
      .should('have.text', '$10 Expires 12/31/21')
    tags.rewardCertificate2().should('be.visible')
      .should('have.text', '$10 Expires 12/31/21')
    tags.rewardCertificate3().should('be.visible')
      .should('have.text', '$10 Expires 12/31/21')
  })

  it('Test 3: The available rewards count decrements after one is added to the transaction.', () => {
    tags.rewardsAvailableCard().should('be.visible')
      .should('have.text', '3 Rewards Available')
    tags.rewardsAvailableCard().click()
    cy.intercept('**/OmniSearch', { body: afterAddingRewardResponseData }).as('usedReward1')
    tags.rewardCertificate1().should('not.have.css', 'background-color', 'rgb(200, 200, 200)') // reward enabled color
    tags.rewardCertificate1().click()
    cy.wait('@usedReward1')
    tags.rewardCertificate1().should('have.css', 'background-color', 'rgb(200, 200, 200)') // reward disabled color
    tags.rewardCountBadge().should('have.text', '2')
    tags.itemDiscountApplied().should('be.visible')
    tags.itemDiscountAmount().should('have.text', ' (-10.00)')
    tags.couponsAndDiscounts().should('have.text', '-10.00')
    tags.loyaltyMiniController().click()
    tags.rewardsAvailableCard().should('have.text', '2 Rewards Available')
  })
})
