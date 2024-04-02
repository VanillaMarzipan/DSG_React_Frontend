/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Sign Out tests', () => {

  const tags = new elements()
  const associateNum = Cypress.env().associateNum
  const associatePIN = Cypress.env().associatePIN

  beforeEach(() => {
    cy.launchPage()
  })

  it('Test 1: Sign out button should not be visible on open register page.', () => {
    tags.signout().should('not.exist')
  })

  it('Test 2:  Sign out button should appear on the scan item page.', () => {
    cy.login(associateNum, associatePIN)
    tags.signout().should('be.visible')
  })

  it('Test 3: Sign out should clear associate name from top greeting', () => {
    cy.login(associateNum, associatePIN)
    tags.signout().click()
    cy.get('body').should('not.contain.text', 'Hello, Johnny!')
      .should('contain.text', 'Hello! Please Login')
  })

  it('Test 4: Should return application to login screen', () => {
    cy.login(associateNum, associatePIN)
    tags.signout().click()
    tags.login().should('be.visible')
    tags.pin().should('be.visible')
    tags.loginSubmit().should('be.visible')
  })
})
