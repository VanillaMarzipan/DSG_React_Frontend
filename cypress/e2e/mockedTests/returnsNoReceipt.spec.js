/// <reference types="cypress" />

import elements from '../../support/pageElements'
import voidNoReceiptReturn from '../../fixtures/return/voidNoReceiptReturn.json'
import noReceiptReturnItemOne from '../../fixtures/return/noReceiptReturnItemOne.json'
import noReceiptReturnItemTwo from '../../fixtures/return/noReceiptReturnItemTwo.json'

const tags = new elements()
const tumblerUPC = Cypress.env().yetiTumblerUPC
const tumblerDescription = Cypress.env().yetiTumblerDescription
const gloveUPC = Cypress.env().baseballGloveUPC
const gloveDescription = Cypress.env().baseballGloveDescription

context('No Receipt Returns tests', () => {
  
    beforeEach(() => {
      cy.launchPageLoggedIn()
    })

  it('Test 1: No-Receipt-Returns button is available on the Return Items modal', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().should('be.visible')
  })

  it('Test 2: No Barcode Available link should exist in Receipt Return Modal', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().click()
    tags.noReceiptReturnModalHeader().should('be.visible')
    tags.noReceiptReturnsDisclaimer().should('be.visible')
    tags.barcodeNotAvailableLink().should('be.visible')
  })

  it('Test 3: There should be a manual entry field in the no-receipt return modal', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptReturnModalHeader().should('be.visible')
    tags.noReceiptReturnsDisclaimer().should('be.visible')
    tags.noReceiptManualInputField().should('be.visible')
  })

  it('Test 4: It should be possible to key items into no-receipt return modal', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptReturnModalHeader().should('be.visible')
    tags.noReceiptReturnsDisclaimer().should('be.visible')
    cy.intercept({method: 'GET',url: '**/Returns/NonReceiptedProduct/**'}, { body: noReceiptReturnItemOne }).as('noReceiptReturnAddItemOne')
    tags.noReceiptManualInputField().type(tumblerUPC + '{enter}')
    cy.wait('@noReceiptReturnAddItemOne') 
    cy.intercept({method: 'GET',url: '**/Returns/NonReceiptedProduct/**'}, { body: noReceiptReturnItemTwo }).as('noReceiptReturnAddItemTwo')
    tags.noReceiptManualInputField().type(gloveUPC + '{enter}')
    cy.wait('@noReceiptReturnAddItemTwo')
  })

  it('Test 5: It should be possible to select items on the no-receipt return modal', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptReturnModalHeader().should('be.visible')
    tags.noReceiptReturnsDisclaimer().should('be.visible')
    cy.noReceiptReturnAddItem(tumblerUPC)
    tags.noReceiptReturnItem1().click()
    tags.returnSelectedItems().should('not.have.css', 'background-color', 'rgb(200, 200, 200)') // enabled
    cy.noReceiptReturnAddItem(gloveUPC)
    tags.noReceiptReturnItem2().click()
    tags.returnSelectedItems().should('not.have.css', 'background-color', 'rgb(200, 200, 200)') // enabled
    tags.returnSelectedItems().should('have.css', 'background-color', 'rgb(197, 113, 53)')
  })

  it('Test 6: It should be possible to deselect an item on the no receipt return modal', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    tags.noReceiptReturnModalHeader().should('be.visible')
    tags.noReceiptReturnsDisclaimer().should('be.visible')
    cy.noReceiptReturnAddItem(tumblerUPC)
    cy.get('[data-testid="item-row"]').should('not.have.css', 'background-color', 'rgb(196, 196, 196)') // unchecked
    tags.noReceiptReturnItem1().click()
    cy.get('[data-testid="item-row"]').should('have.css', 'background-color', 'rgb(196, 196, 196)') // checked
    tags.returnSelectedItems().should('be.visible')
      .should('not.be.disabled')
    cy.noReceiptReturnAddItem(gloveUPC)
    cy.get('[data-testid="item-row"]').eq(1).should('not.have.css', 'background-color', 'rgb(196, 196, 196)') // unchecked
    tags.noReceiptReturnItem2().click()
    cy.get('[data-testid="item-row"]').eq(1).should('have.css', 'background-color', 'rgb(196, 196, 196)') // checked
    tags.returnSelectedItems().should('be.visible')
      .should('not.be.disabled')
    tags.noReceiptReturnItem2().click()
    cy.get('[data-testid="item-row"]').eq(1).should('not.have.css', 'background-color', 'rgb(196, 196, 196)') // unchecked
  })

  it('Test 7: Clicking next should add the no-receipt return items to the transaction', () => {
    tags.returnsFooterButton().click({ force: true })
    tags.noReceiptReturnLink().click()
    tags.barcodeNotAvailableLink().click()
    cy.noReceiptReturnAddItem(tumblerUPC)
    cy.noReceiptReturnAddItem(gloveUPC)
    tags.noReceiptReturnItem1().click()
    tags.noReceiptReturnItem2().click()
    cy.addNoReceiptReturnItemsToTransaction()
    cy.pressComplete()
    tags.transactionCard().should('contain.text', tumblerDescription)
    tags.transactionCard().should('contain.text', tumblerUPC)
    tags.transactionCard().should('contain.text', gloveDescription)
    tags.transactionCard().should('contain.text', gloveUPC)
    tags.transactionCard().should('contain.text', '-57.73')
  })

  it('Test 8: No receipt returns prompt for ID capture', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalLabel().should('be.visible')
    tags.modalCloseButton('returnsAuthorization').should('be.visible')
    tags.noReceiptReturnAuthModalFirstLineOfText().should('be.visible')
    tags.noReceiptReturnAuthModalSecondLineOfText().should('be.visible')
    tags.noReceiptReturnAuthModalThirdLineOfText().should('be.visible')
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().should('be.visible')
  })

  it('Test 9: Clicking the no bar code available link should advance to the ID type screen', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.noReceiptReturnAuthModalLabel().should('be.visible')
    tags.modalCloseButton('returnsAuthorization').should('be.visible')
    tags.returnAuthIdPicker().should('be.visible')
    tags.nonReceiptedReturnAuthNextButton().should('be.visible')
  })

  it('Test 10: The Next button should not be available till an ID type is selected', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.nonReceiptedReturnAuthModalDescription().should('be.visible')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
  })

  it('Test 11: Selecting the Drivers License automatically advances to the next screen', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select("Driver's License")
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalStateEntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalExpirationDateField().should('be.visible')
  })

  it('Test 12: Selecting State ID automatically advances to the next screen', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalStateEntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalExpirationDateField().should('be.visible')
  })

  it('Test 13: License ID form must be fully filled out to advance to the next screen', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select("Driver's License")
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
    tags.nonReceiptedReturnAuthNextButton().click()
    tags.nonReceiptedReturnAuthModalFirstNameField().should('be.visible')
    tags.nonReceiptedReturnAuthModalLastNameField().should('be.visible')
    tags.nonReceiptedReturnAuthModalBirthDateField().should('be.visible')
  })

  it('Test 14: State ID form must be fully filled out to advance to the next screen', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
    tags.nonReceiptedReturnAuthNextButton().click()
    tags.nonReceiptedReturnAuthModalFirstNameField().should('be.visible')
    tags.nonReceiptedReturnAuthModalLastNameField().should('be.visible')
    tags.nonReceiptedReturnAuthModalBirthDateField().should('be.visible')
  })

  it('Test 15: ID Verification screen does not adavance until all fields are filled out', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
    tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
    tags.nonReceiptedReturnAuthNextButton().click()
    tags.nonReceiptedReturnAuthModalAddress1EntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalAddress2EntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalCityAndStateEntryField().should('be.visible')
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().should('be.visible')
  })
  
  it('Test 16: Closing the return auth address verification screen voids the transaction', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
    tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
    tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
    tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
    cy.intercept('**/Transaction/VoidTransaction', { body: voidNoReceiptReturn }).as('voidNoReceiptReturn')
    tags.modalCloseButton('returnsAuthorization').click()
    cy.wait('@voidNoReceiptReturn')
    tags.noReceiptReturnAuthModalLabel().should('not.exist')
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
    tags.tenderMenuAmountDue().should('not.exist')
  })
  
  it('Test 17: All fields on the address verification form must be filled out to activate the Next button', () => {
    cy.performNoReceiptReturn()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select('State ID')
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
    tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
    tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
    tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
    tags.nonReceiptedReturnAuthModalAddress1EntryField().type('933 Kennedy Drive{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalAddress2EntryField().type('Apt #1{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalCityAndStateEntryField().type('Ambridge, PA{enter}')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003')
    tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
  })
  
  it('Test 18: Clicking next on address verification screen loads the final confirmation screen', () => {
    cy.performNoReceiptReturn()
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
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003')
    tags.nonReceiptedReturnAuthNextButton().click()
    cy.get('body').should('contain.text', 'ERIC GROELLERID Number 123456ABCDEF Issuing State PAExpiration 12/31/2040DOB 12/25/1974933 KENNEDY DRIVEAMBRIDGE, PA 15003')
    tags.nonReceiptedReturnAuthModalSubmitButton().should('be.visible')
  })
})

context('Testing back button after the tender is selected', ()=>{

  beforeEach(()=>{
    cy.launchPageLoggedIn()
    cy.performNoReceiptReturn()
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
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003')
    tags.nonReceiptedReturnAuthNextButton().click()
    cy.get('body').should('contain.text', 'ERIC GROELLERID Number 123456ABCDEF Issuing State PAExpiration 12/31/2040DOB 12/25/1974933 KENNEDY DRIVEAMBRIDGE, PA 15003')
    tags.nonReceiptedReturnAuthModalSubmitButton().should('be.visible')
    tags.nonReceiptedReturnAuthNextButton().click()
    tags.tenderMenuStoreCreditButton().should('be.visible')
        .click()
    tags.complete().should('not.exist')
  })

  it('Test 1: back button is displayed after selecting tender ', () => {
    tags.backButtonOnTenderScreen().should('exist')
  }) 
  it('Test 2: Click back button will take the cashier back to tender screen ', () => {
    tags.backButtonOnTenderScreen().click()
    tags.backButtonOnTenderScreen().should('exist')
  })   
})

