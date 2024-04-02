/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Reprint Gift Receipt tests', () => {

  const tags = new elements()

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 1: Reprint gift receipt modal has correct buttons and verbiage', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    tags.reprintGiftReceiptCloseButton().should('be.visible')
    tags.reprintGiftReceiptNextButton().should('be.visible').and('have.text', 'NEXT')
  })

  it('Test 2: Cannot reprint gift receipt for different date', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.intercept('**/Transaction/TransactionByBarcode?barCode=**', { fixture: 'receipts/reprintReceiptWrongDate' }).as('wrongDateResponse')
    tags.reprintGiftReceiptInputBox().type('5008881900151082522017{enter}')
    cy.wait('@wrongDateResponse')
    tags.reprintReceiptWrongDateError().should('be.visible')
  })

  it('Test 3: Cannot reprint gift receipt for different store', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.intercept('**/Transaction/TransactionByBarcode?barCode=**', { fixture: 'receipts/reprintReceiptWrongStore' }).as('wrongStoreResponse')
    tags.reprintGiftReceiptInputBox().type('5008881900151082522017{enter}')
    cy.wait('@wrongStoreResponse')
    tags.reprintReceiptWrongStoreError().should('be.visible')
  })

  it('Test 4: Reprint gift receipt modal has correct items and buttons after entering a valid gift receipt', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.reprintValidGiftReceipt()
    tags.descriptionItem1().should('have.text', 'YETI Rambler Lowball with MagSlider Lid')
    tags.upcItem1().should('have.text', '888830113080')
    tags.priceItem1().should('have.text', '20.00')
    tags.descriptionItem2().should('have.text', 'Rawlings 12’’ Youth Highlight Series Glove 2019')
    tags.upcItem2().should('have.text', '083321578120')
    tags.priceItem2().should('have.text', '49.99')
    tags.descriptionItem3().should('have.text', 'DSG FOUNDATION')
    tags.upcItem3().should('have.text', '400000897646')
    tags.priceItem3().should('have.text', '0.49')
    tags.everydayPriceItem3().should('have.text', 'Price $0.00')
    tags.overridePriceItem3().should('have.text', 'Price Override $0.49')
    tags.reprintGiftReceiptCloseButton().should('be.visible').and('have.text', 'Close')
    tags.giftReceiptsSelectAllOption().should('be.visible').and('have.text', 'Select All')
  })

  it('Test 5: Reprint gift receipt select all button works', () =>{
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.reprintValidGiftReceipt({})
    tags.giftReceiptsSelectAllOption().click()
    tags.singleGiftReceiptButton().should('be.visible')
    tags.oneItemPerGiftReceiptButton().should('be.visible')
    tags.giftReceiptsSelectAllOption().click()
    tags.singleGiftReceiptButton().should('not.exist')
    tags.oneItemPerGiftReceiptButton().should('not.exist')
  })

  it('Test 6: Only able to select Single Receipt if one item is selected', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.reprintValidGiftReceipt()
    tags.giftReceiptSelectItem1().click()
    tags.oneItemPerGiftReceiptButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.singleGiftReceiptButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
  })

  it('Test 7: Able to select One Item per Receipt if multiple items are selected', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.reprintValidGiftReceipt()
    tags.giftReceiptSelectItem1().click()
    tags.giftReceiptSelectItem2().click()
    tags.oneItemPerGiftReceiptButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.singleGiftReceiptButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
  })

  it('Test 8: Attempting to print a gift receipt for a return generates an error', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.intercept('**/Transaction/TransactionByBarcode?barCode=**', { fixture: 'receipts/reprintGiftReceiptReturn' }).as('giftReceiptReturnResponse')
    tags.reprintGiftReceiptInputBox().type('5008881900151082522017{enter}')
    cy.wait('@giftReceiptReturnResponse')
    tags.reprintReceiptTransactionError().should('be.visible')
  })

  it('Test 9: Attempting to print a gift receipt for a transaction containing only a gift card generates an error', () => {
    tags.receiptOptions().click()
    tags.reprintGiftReceiptButton().click()
    cy.intercept('**/Transaction/TransactionByBarcode?barCode=**', { fixture: 'receipts/reprintGiftCardOnly' }).as('giftCardOnlyResponse')
    tags.reprintGiftReceiptInputBox().type('5008881900151082522017{enter}')
    cy.wait('@giftCardOnlyResponse')
    tags.reprintReceiptTransactionError().should('be.visible')
  })

})
