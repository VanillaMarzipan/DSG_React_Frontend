/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Loyalty Customer Selected tests', () => {
  const tags = new elements()

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.loyaltyNoItems()
    tags.loyaltySelectedAthlete().click()
  })

  it('Test 1: When a customer is found, the profile box is shown', () => {
    tags.loyaltyUserProfileCard().should('be.visible')
  })

  it('Test 2: Clicking profile box loads edit account in details pane with customer details', () => {
    cy.clickEditProfile()
    tags.loyaltyAdvancedSearchFirstName().should('be.visible')
      .should('have.value', 'Rolyat')
    tags.loyaltyAdvancedSearchLastName().should('be.visible')
      .should('have.value', 'Nai')
    tags.loyaltyAdvancedSearchZipCode().should('be.visible')
      .should('have.value', '16508')
    tags.loyaltyAdvancedSearchCity().should('be.visible')
      .should('have.value', 'Erie')
    tags.loyaltyAdvancedSearchState().should('be.visible')
      .should('have.value', 'PA')
    tags.loyaltyAdvancedSearchStreet().should('be.visible')
      .should('have.value', '3213 John-Wayne Street')
    tags.loyaltyAdvancedSearchPhone().should('be.visible')
      .should('have.value', '(412) 443-5568')
    tags.loyaltyAdvancedSearchEmail().should('be.visible')
      .should('have.value', 'it@hotmail.com')
    tags.loyaltyAdvancedSearchConfirmChanges().should('be.visible')
  })

  it('Test 3: Phone number entry field should require 10 digits', () => {
    cy.clickEditProfile()
    tags.loyaltyAdvancedSearchPhone().click().focused()
    tags.loyaltyAdvancedSearchPhone().type('{backspace}')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    cy.get('[data-testid="phone-input-border"]').should('have.css', 'border-color', 'rgb(176, 0, 32)') // invalid input
  })

  it('Test 4: Email field requires and @ sign to save updates.', () => {
    cy.clickEditProfile()
    tags.loyaltyAdvancedSearchEmail().click().focused()
    tags.loyaltyAdvancedSearchEmail().clear()
      .type('testing.com{enter}')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    cy.get('[data-testid="email-input-border"]').should('have.css', 'border-color', 'rgb(176, 0, 32)') // invalid input
  })

  it('Test 5: Email field requires a .com ending.', () => {
    cy.clickEditProfile()
    tags.loyaltyAdvancedSearchEmail().click().focused()
    tags.loyaltyAdvancedSearchEmail().clear()
      .type('testing@com{enter}')
      tags.loyaltyAdvancedSearchConfirmChanges().click()
    cy.get('[data-testid="email-input-border"]').should('have.css', 'border-color', 'rgb(176, 0, 32)') // invalid input
  })

  it('Test 6: The POS should display the correct reward tier icon for the customer', () => {
    tags.loyaltyGoldTier().should('be.visible')
  })

  it('Test 7: The POS should display the correct points balance of the customer', () => {
    tags.loyaltyPointsBalance().should('be.visible')
      .should('have.text', 'Points Balance: 353')
  })
})
