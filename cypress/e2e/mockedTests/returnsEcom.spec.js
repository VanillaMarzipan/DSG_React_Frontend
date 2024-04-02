/// <reference types="cypress" />

import elements from '../../support/pageElements'
import ecomOrder from '../../fixtures/return/ecomReturns/threeItemEcomOrder.json'
import addReturnItems from '../../fixtures/return/ecomReturns/addReturnItemsToTrx.json'
import selectAllItems from '../../fixtures/return/ecomReturns/selectAllItemsToReturn.json'
import threeItemsTwoReturned from '../../fixtures/return/ecomReturns/threeItemsTwoReturned.json'
import oneItemReturn from '../../fixtures/return/ecomReturns/oneItemReturn.json'
import exchangeFundsDue from '../../fixtures/return/ecomReturns/exchangeFundsDue.json'

context('Ecom Returns tests', () => {
  const tags = new elements()
  const tumblerUPC = Cypress.env().yetiTumblerUPC
  const tumblerPrice = Cypress.env().yetiTumblerPrice
  const tumblerDescription = Cypress.env().yetiTumblerDescription
  const recumbantBikeUPC = Cypress.env().recumbantBikeUPC
  const returnDoNumber = Cypress.env().returnDoNumber
  const exchangeSubtotal = (Number('50.99') - Number(tumblerPrice)).toFixed(2)
  const exchangeTax = (Number(exchangeSubtotal) *.07).toFixed(2)
  const exchangeAmount = (Number(exchangeSubtotal) - Number(exchangeTax)).toFixed(2)
  const exchangeResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1621866852828,"signature":"TOO2o0Ncm/7iF7Ds2MvToO2RYcAtg7u/XGZkV0iKr5I=","transactionKey":"255440087931705242021","tenderIdentifier":"1-255440087931705242021","eReceiptKey":"5008793170017052421044","storeNumber":879,"registerNumber":317,"transactionNumber":17,"startDateTime":"2021-05-24T14:33:57.126549Z","timezoneOffset":0,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"100001212457","upc":"400001803318","sku":"090500822","style":"BOPISTEST1","description":"[UAT] BOPIS TEST 1","quantity":1,"imageUrl":"","returnPrice":-50.99,"damaged":false}]}],"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":' + tumblerPrice + ',"promptForPrice":false,"unitPrice":' + tumblerPrice + ',"referencePrice":' + tumblerPrice + ',"everydayPrice":' + tumblerPrice + ',"priceOverridden":false,"originalUnitPrice":' + tumblerPrice + ',"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":' + exchangeSubtotal + ',"tax":' + exchangeTax + ',"grandTotal":' + exchangeAmount + ',"changeDue":0.0,"remainingBalance":' + exchangeAmount + '}},"upc":"888830050118"}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 1: The return button should be available on the initial scan screen.', () => {
    tags.returnsFooterButton().should('be.visible')
  })

  it('Test 2: Clicking the returns footer button brings up the returns modal.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.modalCloseButton('returns').should('be.visible')
    cy.get('body').should('contain.text', 'Return Items')
      .should('contain.text', 'Scan or type in a receipt or phone number.')
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().should('be.visible')
  })

  it('Test 3: Entering a receipt or phone number under 10 digits does not enable the next button.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type('123456789').type('{enter}')
    tags.returnsLookupGenericButton().should('not.be.enabled')
  })

  it('Test 4: Receipt/Phone number field should not accept more than 22 digits.', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type('1234567890123456789012345')
    tags.returnGenericNumberEntryField().should('have.value', '1234567890123456789012')
  })

  it('Test 5: When a valid DO # is entered, and the next button is pressed, the POS displays the order and items.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)
    cy.lookupReturn(ecomOrder)
    tags.descriptionItem1().should('be.visible')
      .should('have.text', '[UAT] BOPIS TEST 1')
    tags.descriptionItem2().should('be.visible')
      .should('have.text', 'CHECK SHORT')
    tags.descriptionItem3().should('be.visible')
      .should('have.text', "Columbia Men's Watertight II Rain Jacket")
    tags.priceItem1().should('be.visible')
      .should('have.text', '50.99')
    tags.priceItem2().should('be.visible')
      .should('have.text', '34.99')
    tags.priceItem3().should('be.visible')
      .should('have.text', '37.10')
  })

  it('Test 6: The select items for return button is not enabled until you select an item for return.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)
    cy.lookupReturn(ecomOrder)
    tags.returnSelectedItems().should('have.css', 'background-color', 'rgb(200, 200, 200)')
  })

  it('Test 7: After selecting an item, the damaged reason code box is displayed.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)
    cy.lookupReturn(ecomOrder)
    tags.returnItem1().click()
    tags.returnItemRow1().should('contain.text', 'Blemished')
    tags.returnSelectedItems().should('not.have.css', 'background-color', 'rgb(200, 200, 200)')
  })

  it('Test 8: It should be possible to click the damaged checkbox', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)
    cy.lookupReturn(ecomOrder)
    tags.returnItem1().click()
    tags.returnDamagedCheckbox1().children().eq(0).should('have.css', 'background-color', 'rgb(255, 255, 255)')
    tags.returnItemRow1().children().eq(0).children().eq(1).children().eq(1).children().eq(1).click({ force: true })
    tags.returnDamagedCheckbox1().children().eq(0).should('have.css', 'background-color', 'rgb(0, 150, 136)')
  })

  it('Test 9: After clicking the next button, the POS displays the return items with damaged flag correctly.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)

    cy.lookupReturn(ecomOrder)
    tags.returnItem1().click()
    tags.returnItemRow1().children().eq(0).children().eq(1).children().eq(1).children().eq(1).click({ force: true })
    tags.returnItem2().click()
    cy.addReturnItems(addReturnItems)
    tags.descriptionItem1().should('have.text', '[UAT] BOPIS TEST 1')
    tags.priceItem1().should('have.text', '-50.99')
    tags.returnDamagedIndicator1().should('be.visible')
    tags.descriptionItem2().should('have.text', 'CHECK SHORT')
    tags.priceItem2().should('have.text', '-34.99')
    tags.returnDamagedIndicator2().should('not.exist')
    tags.subtotal().should('have.text', '-85.98')
    tags.taxes().should('have.text', '-3.57')
    tags.total().should('have.text', '-89.55')
  })

  it('Test 10: Pressing complete shows a $-89.55 refund with only the giftcard and credit options.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)

    cy.lookupReturn(ecomOrder)
    tags.returnItem1().click()
    tags.returnItem2().click()
    cy.addReturnItems(addReturnItems)
    tags.transactionCard().should('be.visible')
    cy.returnAuth('approve')
    tags.tenderMenuAmountDue().should('have.text', 'Total Due: -$89.55')
    tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
    tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
  })

  it('Test 11: Selecting all on the eCom return modal selects all the items for return.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)

    cy.lookupReturn(ecomOrder)
    cy.get('[data-testid=returns-modal]').contains('Select All').click()
    cy.addReturnItems(selectAllItems)
    tags.descriptionItem1().should('be.visible')
    tags.descriptionItem2().should('be.visible')
    tags.descriptionItem3().should('be.visible')
    tags.total().should('have.text', '-126.65')
  })

  it('Test 12: Returned items can not be returned again, and show as having been returned.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)

    cy.lookupReturn(threeItemsTwoReturned)
    tags.returnItem1().should('not.exist')
    tags.returnItem2().should('not.exist')
    tags.returnItemRow1().should('contain.text', "Columbia Men's Watertight II Rain Jacket")
  })

  it('Test 13: Can add sale items to a return transaction, to create an exchange transaction.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)

    cy.lookupReturn(ecomOrder)
    tags.returnItem1().click()
    cy.addReturnItems(oneItemReturn)
    cy.addItemOrLoyalty(tumblerUPC, exchangeResponseData)
    tags.descriptionItem1().should('have.text', '[UAT] BOPIS TEST 1')
    tags.priceItem1().should('have.text', '-50.99')
    tags.descriptionItem2().should('have.text', tumblerDescription)
    tags.priceItem2().should('have.text', tumblerPrice)
    tags.subtotal().should('have.text', (Number(exchangeSubtotal)).toFixed(2))
    tags.taxes().should('have.text', (Number(exchangeTax)).toFixed(2))
    tags.total().should('have.text', (Number(exchangeAmount)).toFixed(2))
  })

  it('Test 14: Prompt for tender when an exchange transaction has funds due.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(returnDoNumber)

    cy.lookupReturn(ecomOrder)
    tags.returnItem1().click()
    cy.addReturnItems(oneItemReturn)
    cy.addItemOrLoyalty(recumbantBikeUPC, exchangeFundsDue)
    tags.subtotal().should('have.text', '1549.00')
    tags.taxes().should('have.text', '108.05')
    tags.total().should('have.text', '1657.05')
    cy.returnAuth('approve')
    tags.tenderMenuAmountDue().should('have.text', 'Total Due: $1657.05')
    tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    tags.tenderMenuSplitTenderButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    tags.tenderMenuScoreRewardsLookupButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    tags.tenderMenuStoreCreditButton().should('have.css', 'background-color', 'rgb(186, 188, 187)') // disabled
  })

  it('Test 15: If the DO/CO is not found, a user friendly error message.', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.returnGenericNumberEntryField().click()
    tags.returnGenericNumberEntryField().type('123456789012')
    cy.intercept('**/Returns/**', { statusCode: 204 }).as('orderNotFound')
    tags.returnsLookupGenericButton().click()
    cy.wait('@orderNotFound')
    cy.get('body').should('contain.text', 'Order not found')
  })
})