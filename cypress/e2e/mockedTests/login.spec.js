/// <reference types="cypress" />

import elements from '../../support/pageElements'

context('Login page tests', () => {

  const associateNum = Cypress.env().associateNum
  const associatePIN = Cypress.env().associatePIN

  beforeEach(() => {
    cy.launchPage()
  })

  const tags = new elements()

  it('Test 1: The POS login page is displayed as expected', () => {
    cy.get('body').should('contain.text', 'REGISTER IS CLOSED')
      .should('not.contain.text', 'Page could not be displayed')
      .should('not.contain.text', 'Page not found')
      .should('not.contain.text', 'Site Unavailable')
    tags.login().should('be.visible')
    tags.pin().should('be.visible')
    tags.loginSubmit().should('be.visible')
  })

  it('Test 2: Only footer button available on closed or locked register is item lookup', () => {
    tags.registerFunctions().should('not.exist')
    tags.receiptOptions().should('not.exist')
    tags.feedback().should('not.exist')
    tags.giftCardBalanceInquiryButton().should('not.exist')
    tags.returnsFooterButton().should('not.exist')
    tags.teammateButton().should('not.exist')
    tags.postVoid().should('not.exist')
    tags.signout().should('not.exist')
    tags.productLookupFooterButton().should('be.visible')
  })

  it('Test 3: Cannot login with less than 7 digit numerical associate number', () => {
    tags.login().click({ force: true }).focused()
    tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.login().type('123456')
    cy.get('body').should('contain.text', 'Invalid Associate Number')
  })

  it('Test 4: Cannot login with more than 7 digit numerical associate number', () => {
    tags.login().click({ force: true }).focused()
    tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.login().type('12345678')
    tags.login().should('have.value', '1234567')
      .should('not.have.value', '12345678')
  })

  it('Test 5: Cannot login with non-numerical characters for associate number', () => {
    tags.login().click({ force: true }).focused()
    tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.login().type('12@A567')
    tags.login().should('not.have.value', '12@A567')
      .should('contain.have.value', '12567')
  })

  it('Test 6: Cannot log in with a blank associate number', () => {
    tags.login().click({ force: true }).focused()
    tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.login().type(associatePIN)
    tags.loginSubmit().click()
    tags.omniScan().should('not.exist')
  })

  it('Test 7: Cannot log in with a blank pin', () => {
    tags.login().click({ force: true }).focused()
    tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.pin().type(associateNum)
    tags.loginSubmit().click()
    tags.omniScan().should('not.exist')
  })

  it('Test 8: Can login with 7 digit numerical associate number and 6 digit pin', () => {
    tags.login().click({ force: true }).focused()
    tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    cy.login(associateNum, associatePIN)
    tags.omniScan().should('be.visible')
    cy.get('body').should('contain.text', 'Hello, Johnny!')
  })
})
