/// <reference types="cypress" />

import elements from '../../support/pageElements'
import inStoreOneItemReturn from '../../fixtures/return/inStoreReturns/inStoreOneItemReturn.json'
import addCashOnlyItem from '../../fixtures/return/inStoreReturns/addReturnItems/cashOnly.json'
import cashRefund from '../../fixtures/return/inStoreReturns/refundToCash.json'
import finalizeCashRefund from '../../fixtures/return/inStoreReturns/finalizeCashRefund.json'
import giftcardAndCashItem from '../../fixtures/return/inStoreReturns/addReturnItems/giftcardAndCash.json'
import creditAndGiftCardItem from '../../fixtures/return/inStoreReturns/addReturnItems/creditAndGiftcard.json'
import cashAndCreditItem from '../../fixtures/return/inStoreReturns/addReturnItems/cashAndDebit.json'
import giftcardOnlyItem from '../../fixtures/return/inStoreReturns/addReturnItems/giftcardOnly.json'

context('In Store Returns tests', () => {

    const tags = new elements()
    const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum
  
    beforeEach(() => {
      cy.launchPageLoggedIn()
    })

    it('Test 1: In-Store-Returns original cash tender allows cash and giftcard, completed with cash.', () => {
        tags.returnsFooterButton().click()
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
        cy.lookupReturn(inStoreOneItemReturn)
        tags.returnItem1().click()
        cy.addReturnItems(addCashOnlyItem)
        cy.returnAuth('approve')
        tags.tenderMenuAmountDue().should('have.text', 'Total Due: -$129.99')
        tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
        tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
        cy.intercept('**/Tender/NewCashTender', { body: cashRefund }).as('cashRefund')
        cy.intercept('**/Transaction/FinalizeTransaction',{ body: finalizeCashRefund }).as('finalizeTransaction')
        tags.tenderMenuCashButton().click()
        cy.wait([ '@cashRefund', '@finalizeTransaction' ])
        cy.get('body').should('contain.text', 'Cash Refund Due: $129.99')
        tags.changeDue().should('not.exist')
        tags.closeRegisterInstructions().should('contain.text', 'Close Register Drawer After Giving Customer Refund')
        tags.newTransactionButton().should('be.visible')
    })

    it('Test 2: In-Store-Returns original cash and giftcard tender, allows giftcard only', () => {
        tags.returnsFooterButton().click()
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
        cy.lookupReturn(inStoreOneItemReturn)
        tags.returnItem1().click()
        cy.addReturnItems(giftcardAndCashItem)
        cy.returnAuth('approve')
        tags.tenderMenuAmountDue().should('have.text', 'Total Due: -$129.99')
        tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    })

    it('Test 3: In-Store-Returns original cash and credit tender, allows credit and giftcard only', () => {
        tags.returnsFooterButton().click()
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
        cy.lookupReturn(inStoreOneItemReturn)
        tags.returnItem1().click()
        cy.addReturnItems(creditAndGiftCardItem)
        cy.returnAuth('approve')
        tags.tenderMenuAmountDue().should('have.text', 'Total Due: -$129.99')
        tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
        tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    })

    it('Test 4: In-Store-Returns original cash and debit tender, allows credit and giftcard only', () => {
        tags.returnsFooterButton().click()
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
        cy.lookupReturn(inStoreOneItemReturn)
        tags.returnItem1().click()
        cy.addReturnItems(cashAndCreditItem)
        cy.returnAuth('approve')
        tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
        tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    })

    it('Test 5: In-store return original gift card tender, allows only gift card refund', () => {
        tags.returnsFooterButton().click()
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
        cy.lookupReturn(inStoreOneItemReturn)
        tags.returnItem1().click()
        cy.addReturnItems(giftcardOnlyItem)
        cy.returnAuth('approve')
        tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(200, 200, 200)') // disabled
        tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(0, 101, 84)') // enabled
    })
})