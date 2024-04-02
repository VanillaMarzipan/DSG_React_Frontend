/// <reference types="cypress" />
import elements from '../../support/pageElements'
import CO2TankUnder18ResponseData from '../../fixtures/ageRestrictedResponses/co2TankUnder18Response.json'
import AmmoUnder21ResponseData from '../../fixtures/ageRestrictedResponses/ammoUnder21Response.json'

context('Age Restriction tests', () => {
  
  const tags = new elements()
  const responseStatus = 451
  const age18UPC = Cypress.env().age18RestrictedCO2tankUPC
  const age18Price = Cypress.env().age18RestrictedCO2tankPrice
  const age18Description = Cypress.env().age18RestrictedCO2tankDescription
  const age21UPC = Cypress.env().age21Restricted22AmmoUPC
  const age21Price = Cypress.env().age21Restricted22AmmoPrice
  const age21Description = Cypress.env().age21Restricted22AmmoDescription

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 1: The POS should show a modal on item flagged as age 18 restricted', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedModal().should('be.visible')
    tags.ageRestrictedBirthDateEntryField().should('be.visible')
    tags.ageRestrictedBirthDateEnterButton().should('be.visible')
    tags.modalCloseButton('ageRestriction').should('be.visible')
  })

  it('Test 2: Pressing enter without entering anything displays an error message.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('{enter}')
    tags.ageRestrictedBirthDateEntryField().should('have.value', '')
    tags.ageRestrictedModal().should('contain.text', 'Incorrect formatting.  Please input birthdate MM/DD/YYYY.')
  })

  it('Test 3: Age entry should not accept letters or special characters.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('A!b@c#d${enter}')
    tags.ageRestrictedModal().should('contain.text', 'Incorrect formatting.  Please input birthdate MM/DD/YYYY.')
  })

  it('Test 4: Age entry should require 8 digits in MM/DD/YYYY format.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('123456{enter}')
    tags.ageRestrictedModal().should('contain.text', 'Incorrect formatting.  Please input birthdate MM/DD/YYYY.')
  })

  it('Test 5: Age entry should not accept 9 or more digits.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('1234567890').type('{enter}')
    tags.ageRestrictedBirthDateEntryField().should('have.value', '12/34/5678')
  })

  it('Test 6: An age under 18 does not add the item to the transaction, and goes back to the omnisearch screen.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('06012015')
    cy.CO2tankNot18()
    tags.ageRestrictedModal().should('contain.text', 'Athlete ineligible to purchase, based on age.')
    tags.modalCloseButton('athleteIsAgeRestricted').click()
    tags.athleteIsAgeRestrictedModal().should('not.be.visible')
    tags.transactionCard().should('not.exist')
    tags.omniScan().should('be.visible')
  })

  it('Test 7: An age over 18 is adds the CO2 tank to the transaction.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('06012003')
    cy.CO2tank19()
    tags.transactionCard().should('be.visible')
      .should('contain.text', age18Description)
      .should('contain.text', age18Price)
      .should('contain.text', age18UPC)
  })

  it('Test 8: Age 21 restricted item displays the age restricted modal.', () => {
    cy.addItemOrLoyalty(age21UPC, AmmoUnder21ResponseData, responseStatus)
    tags.ageRestrictedModal().should('be.visible')
    tags.ageRestrictedBirthDateEntryField().should('be.visible')
    tags.ageRestrictedBirthDateEnterButton().should('be.visible')
    tags.modalCloseButton('ageRestriction').should('be.visible')
  })

  it('Test 9: An age under 21 removes the item from the transaction, and goes back to the omnisearch screen.', () => {
    cy.addItemOrLoyalty(age21UPC, AmmoUnder21ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('06012001')
    cy.AmmoNot21()
    tags.ageRestrictedModal().should('contain.text', 'Athlete ineligible to purchase, based on age.')
    tags.modalCloseButton('athleteIsAgeRestricted').click()
    tags.athleteIsAgeRestrictedModal().should('not.be.visible')
    tags.transactionCard().should('not.exist')
    tags.omniScan().should('be.visible')
  })

  it('Test 10: An age over 21 adds the item to the transaction.', () => {
    cy.addItemOrLoyalty(age21UPC, AmmoUnder21ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('06011999')
    cy.Ammo21()
    tags.transactionCard().should('be.visible')
      .should('contain.text', age21Description)
      .should('contain.text', age21Price)
      .should('contain.text', age21UPC)
  })

  it('Test 11: Entering an age over 18 allows the age 18 item, but not the age 21 item.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('06012001')
    cy.CO2tank19()
    tags.ageRestrictedModal().should('not.exist')
    tags.ageRestrictedBirthDateEntryField().should('not.exist')
    tags.ageRestrictedBirthDateEnterButton().should('not.exist')
    tags.transactionCard().should('be.visible')
      .should('contain.text', age18Description)
    cy.add21AgeRestricted22Ammo()
    tags.ageRestrictedCannotAddItem().should('be.visible')
    tags.modalCloseButton('athleteIsAgeRestricted').should('be.visible').click()
    tags.ageRestrictedCannotAddItem().should('not.exist')
    tags.transactionCard().should('not.contain', age21Description)
  })

  it('Test 12: Enter an age over 21 allows both age 18 and age 21 items.', () => {
    cy.addItemOrLoyalty(age18UPC, CO2TankUnder18ResponseData, responseStatus)
    tags.ageRestrictedBirthDateEntryField().click().focused()
    tags.ageRestrictedBirthDateEntryField().type('06011999')
    cy.CO2tank19()
    tags.ageRestrictedModal().should('not.exist')
    tags.transactionCard().should('be.visible')
      .should('contain.text', age18Description)
    cy.CO2andAmmo()
    tags.transactionCard().should('contain.text', age18Description)
      .should('contain.text', age21Description)
    tags.total().should('have.text', '67.39')
  })
})
