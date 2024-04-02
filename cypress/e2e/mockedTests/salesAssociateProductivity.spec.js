/// <reference types="cypress" />
import elements from '../../support/pageElements'
import addNonSapItem from '../../fixtures/sap/addNonSapItem.json'

context('Sales Associate Productivity tests', () => {
  const tags = new elements()
  const tumblerUPC = Cypress.env().yetiTumblerUPC
  const tumblerDescription = Cypress.env().yetiTumblerDescription
  const gloveUPC = Cypress.env().baseballGloveUPC
  const gloveDescription = Cypress.env().baseballGloveDescription
  const otherGloveUPC = Cypress.env().otherBaseballGlove
  const otherGloveDescription = Cypress.env().otherBaseballGloveDescription

  beforeEach(() => {
    cy.launchPageLoggedIn()
    tags.teammateButton().click()
  })

  it('Test 1: Clicking the Teammate button brings up the Add Teammate To Sale button', () => {
    tags.addTeammateToSaleButton().should('be.visible')
  })

  it('Test 2: Clicking the Add Teammate To Sale button brings up the SAP modal', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalHeader().should('be.visible')
    tags.sapModalCloseButton().should('be.visible')
    tags.sapModalDescription().should('be.visible')
    tags.sapModalItemEntryField().should('be.visible')
    tags.sapModalItemEntrySubmitButton().should('be.visible')
        .should('have.css', 'background-color', 'rgb(200, 200, 200)')
  })

  it('Test 3: The Enter button should be enabled after entering a 7 digit SAP number', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    tags.sapModalItemEntrySubmitButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
  })

  it('Test 4: Entering an SAP number should take you to the item entry modal with the associate name', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    cy.lookupSap()
    tags.sapModalAddItemsHeader().should('be.visible')
    tags.sapModalCloseButton().should('be.visible')
    tags.sapModalAddItemsDescription().should('be.visible')
    tags.sapModalItemEntryField().should('be.visible')
    tags.sapModalItemEntrySubmitButton().should('be.visible')
  })

  it('Test 5: Entering a UPC displays a message that the UPC has been added.', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    cy.lookupSap()
    tags.sapModalItemEntryField().type(tumblerUPC)
    tags.sapModalItemEntrySubmitButton().click()
    tags.sapItemAddedVerbiage().should('be.visible')
    tags.sapItemAddedVerbiage().should('contain.text', '1 Item')
    tags.sapAddItemToSaleButton().should('be.visible')
  })

  it('Test 6: The item count and verbiage update for multiple items', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    cy.lookupSap()
    tags.sapModalItemEntryField().type(tumblerUPC + '{enter}')
    tags.sapModalItemEntryField().type(gloveUPC + '{enter}')
    tags.sapItemAddedVerbiage().should('be.visible')
    tags.sapItemAddedVerbiage().should('contain.text', '2 Items')
    tags.sapAddItemToSaleButton().should('be.visible')
  })

  it('Test 7: clicking the close button voids the transaction', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    cy.lookupSap()
    tags.sapModalItemEntryField().type(tumblerUPC + '{enter}')
    tags.sapModalItemEntryField().type(gloveUPC + '{enter}')
    tags.sapModalCloseButton().click()
    tags.transactionCard().should('not.exist')
    tags.omniScan().should('be.visible')
  })

  it('Test 8: Pressing Add to Sale displays the items in the transaction card with SAP', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    cy.lookupSap()
    tags.sapModalItemEntryField().type(tumblerUPC + '{enter}')
    tags.sapModalItemEntryField().type(gloveUPC + '{enter}')
    cy.addSapItemsToSale()
    tags.transactionCard().should('be.visible')
    tags.descriptionItem1().should('have.text', tumblerDescription)
    tags.sapItem1().should('be.visible')
    tags.descriptionItem2().should('have.text', gloveDescription)
    tags.sapItem2().should('be.visible')
  })

  it('Test 9: Adding a non SAP item does not show the SAP line for the item', () => {
    tags.addTeammateToSaleButton().click()
    tags.sapModalItemEntryField().click()
    tags.sapModalItemEntryFieldBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.sapModalItemEntryField().type('9876543')
    cy.lookupSap()
    tags.sapModalItemEntryField().type(tumblerUPC + '{enter}')
    tags.sapModalItemEntryField().type(gloveUPC + '{enter}')
    cy.addSapItemsToSale()
    tags.scanSubmit().should('have.text', 'Enter')
    cy.addItemOrLoyalty(otherGloveUPC, addNonSapItem)
    tags.descriptionItem1().should('have.text', tumblerDescription)
    tags.sapItem1().should('be.visible')
    tags.descriptionItem2().should('have.text', gloveDescription)
    tags.sapItem2().should('be.visible')
    tags.descriptionItem3().should('have.text', otherGloveDescription)
    tags.sapItem3().should('not.exist')
  })
})