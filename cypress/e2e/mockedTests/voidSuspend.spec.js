/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Void Suspend tests', () => {
  const tags = new elements()
  const gloveUPC = Cypress.env().baseballGloveUPC
  const glovePrice = Cypress.env().baseballGlovePrice
  const gloveDescription = Cypress.env().baseballGloveDescription
  const baseballGloveResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1619034423025,"signature":"O5nxTgr3XsKii8yypSd6QbQNLvVdGjJdrgcokgYiLmE=","transactionKey":"246910087931704212021","tenderIdentifier":"1-246910087931704212021","eReceiptKey":"5008793170011042121017","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-04-21T19:47:02.795626Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":48.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.50,"grandTotal":53.49,"changeDue":0.00,"remainingBalance":53.49}},"upc":"083321578120"}'

  beforeEach(() => {
    cy.launchPageLoggedIn(null, null, 'true')
  })

  it('Test 1: The void and suspend buttons should be visible during a transaction.', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    tags.voidButton().should('be.visible')
    tags.suspendButton().should('be.visible')
  })

  it('Test 2: Clicking the void button should bring up Void modal', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    tags.voidButton().click()
    tags.confirmVoidButton().should('be.visible')
    tags.modalCloseButton('void').should('be.visible')
  })

  it('Test 3: Clicking the close button should close modal, and keep transaction', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    tags.voidButton().click()
    tags.confirmVoidButton().should('be.visible')
    tags.modalCloseButton('void').click()
    tags.transactionCard().should('be.visible')
      .should('contain.text', gloveDescription)
      .should('contain.text', gloveUPC)
      .should('contain.text', glovePrice)
    tags.complete().should('be.visible')
  })

  it('Test 4: Void feedback flow functions successfully', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.voidTransaction()
    cy.get('body').should('contain.text', 'Void Feedback')
    tags.reasonButton(0).click()
    cy.get('body').should('contain.text', 'Void Feedback: credit card lookup')
    cy.intercept('**/Feedback/Void/*', { body: '' }).as('feedbackSend')
    tags.transactionFeedbackInputSend().click()
    cy.wait('@feedbackSend')
    tags.transactionFeedbackSuccessClose().click()
    tags.transactionCard().should('not.exist')
    tags.omniScan().should('be.visible')
  })

  it('Test 5: Void feedback requires input if "other" is selected', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.voidTransaction()
    cy.get('body').should('contain.text', 'Void Feedback')
    tags.reasonButton(5).click()
    cy.get('body').should('contain.text', 'Void Feedback: other')
    tags.transactionFeedbackInputSend().should('have.attr', 'aria-disabled', 'true')
    tags.transactionFeedbackInput().type('test')
    tags.transactionFeedbackInputSend().should('not.have.attr', 'aria-disabled', 'true')
  })

  it('Test 6: Void feedback errors are handled', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.voidTransaction()
    tags.reasonButton(0).click()
    cy.intercept('**/Feedback/Void/*', { statusCode: 500 }).as('feedbackSendError')
    tags.transactionFeedbackInputSend().click()
    cy.wait('@feedbackSendError')
    cy.intercept('**/Feedback/Void/*', { body: '' }).as('feedbackSendSuccess')
    tags.transactionFeedbackErrorRetry().click()
    cy.wait('@feedbackSendSuccess')
    tags.transactionFeedbackSuccessClose().click()
  })

  it('Test 7: Clicking confirm on the suspend modal suspends the transaction and returns to the initial scan screen', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.suspendTransaction()
    cy.get('body').should('contain.text', 'Suspend Feedback')
    tags.modalCloseButton('suspend').click()
    tags.transactionCard().should('not.exist')
    tags.omniScan().should('be.visible')
  })

  it('Test 8: Suspend feedback errors are handled', () => {
    cy.addItemOrLoyalty(gloveUPC, baseballGloveResponseData)
    cy.suspendTransaction()
    cy.intercept('**/Feedback/Suspend/*', { statusCode: 500 }).as('feedbackSuspendError')
    tags.transactionFeedbackInput().type('Test')
    tags.transactionFeedbackInputSend().click()
    cy.wait('@feedbackSuspendError')
    cy.intercept('**/Feedback/Suspend/*', { body: '' }).as('feedbackSuspendSuccess')
    tags.transactionFeedbackErrorRetry().click()
    cy.wait('@feedbackSuspendSuccess')
    tags.transactionFeedbackSuccessClose().click()
  })
})
