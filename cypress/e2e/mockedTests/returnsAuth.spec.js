/// <reference types="cypress" />

import elements from '../../support/pageElements'
import returnApproved from '../../fixtures/returnAuthResponses/approved.json'
import returnWarned from '../../fixtures/returnAuthResponses/warned.json'
import returnDenied from '../../fixtures/returnAuthResponses/denied.json'
import voidNoReceiptReturn from '../../fixtures/return/voidNoReceiptReturn.json'
import inStoreOneItemReturn from '../../fixtures/return/inStoreReturns/inStoreOneItemReturn.json'
import addCashOnlyItem from '../../fixtures/return/inStoreReturns/addReturnItems/cashOnly.json'

context('Returns Authorization tests', () => {
    const tags = new elements()
    const inStoreReturnReceiptNum = '1048891020673031122016'
  
    beforeEach(() => {
      cy.launchPageLoggedIn()
    })

  it('Test 1: Approve response allows the return to complete and Store Credit is the only refund option.', () => {
    cy.performNoReceiptReturn({ force: true })
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
    tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
    tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
    tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
    tags.nonReceiptedReturnAuthModalAddress1EntryField().type('933 Kennedy Drive{enter}')
    tags.nonReceiptedReturnAuthModalCityAndStateEntryField().type('Ambridge, PA{enter}')
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003{enter}')
    cy.intercept('**/Returns/Authorize ', { body: returnApproved }).as ('approved')
    tags.nonReceiptedReturnAuthModalSubmitButton().click()
    cy.wait('@approved')
    tags.omniScan().should('not.exist')
    tags.total().should('have.text', '-57.73')
    tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')              // disabled
    tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')            // disabled
    tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')          // disabled
    tags.tenderMenuSplitTenderButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')       // disabled
    tags.tenderMenuStoreCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')          // enabled
    tags.tenderMenuScoreRewardsLookupButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')// disabled
  })

  it('Test 2: Denied response only allows the transaction to be voided', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
    cy.lookupReturn(inStoreOneItemReturn)
    tags.returnItem1().click()
    cy.addReturnItems(addCashOnlyItem)
    cy.intercept('**/Returns/Authorize ', { body: returnDenied }).as ('denied')
    cy.intercept('**/AvailableWarranties', { body: '[]' }).as('warranties')
    tags.complete().click()
    cy.wait([ '@warranties', '@denied' ])
    tags.returnAuthModalCompleteBtn().should('not.exist')
    cy.intercept('**/Transaction/VoidTransaction', { body: voidNoReceiptReturn }).as('voidNoReceiptReturn')
    tags.returnAuthModalVoidButton().click()
    cy.wait('@voidNoReceiptReturn')
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
    tags.tenderMenuAmountDue().should('not.exist')
  })

  it('Test 3: Voiding a warned return voids the transaction', () => {
    tags.returnsFooterButton().click()
    tags.returnGenericNumberEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.returnGenericNumberEntryField().click().focused()
    tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
    cy.lookupReturn(inStoreOneItemReturn)
    tags.returnItem1().click()
    cy.addReturnItems(addCashOnlyItem)
    cy.intercept('**/Returns/Authorize ', { body: returnWarned }).as('warned')
    cy.intercept('**/AvailableWarranties', { body: '[]' }).as('warranties')
    tags.complete().click()
    cy.wait([ '@warranties', '@warned' ])
    cy.intercept('**/Transaction/VoidTransaction**', { body: voidNoReceiptReturn }).as('voidNoReceiptReturn')
    tags.returnAuthWarnedContinueButton().should('be.visible')
    tags.returnAuthModalVoidButton().click()
    cy.wait('@voidNoReceiptReturn')
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
    tags.tenderMenuAmountDue().should('not.exist')
  })

  it('Test 4: Warned returns can continue and only allows store credit as the refund type', () => {
    cy.performNoReceiptReturn({ force: true })
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
    tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
    tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
    tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
    tags.nonReceiptedReturnAuthModalAddress1EntryField().type('933 Kennedy Drive{enter}')
    tags.nonReceiptedReturnAuthModalCityAndStateEntryField().type('Ambridge, PA{enter}')
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003{enter}')
    cy.intercept('**/Returns/Authorize ', { body: returnWarned}).as('warned')
    tags.nonReceiptedReturnAuthModalSubmitButton().click()
    cy.wait('@warned')
    tags.returnAuthModalVoidBtn().should('be.visible')
    tags.returnAuthWarnedContinueButton().click()
    tags.omniScan().should('not.exist')
    tags.total().should('have.text', '-57.73')
    tags.tenderMenuCashButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')              // disabled
    tags.tenderMenuCreditButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')            // disabled
    tags.tenderMenuGiftCardButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')          // disabled
    tags.tenderMenuSplitTenderButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')       // disabled
    tags.tenderMenuStoreCreditButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')          // enabled
    tags.tenderMenuScoreRewardsLookupButton().should('have.css', 'background-color', 'rgb(186, 188, 187)')// disabled
  })
})