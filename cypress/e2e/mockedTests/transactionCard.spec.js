/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'
import tumblerResponse from '../../fixtures/items/tumbler.json'
import tumblerGloveClubResponse from '../../fixtures/items/tumblerGloveClub.json'
import tumblerPriceChangeResponse from '../../fixtures/items/tumblerPriceChange.json'
import deleteClubResponse from '../../fixtures/items/deleteThirdItem.json'
import deleteGloveResponse from '../../fixtures/items/deleteSecondItem.json'
import deleteTumblerResponse from '../../fixtures/items/deleteLastItem.json'

context('Transaction Card tests', () => {

    const tags = new elements
    const tumblerUPC = Cypress.env().yetiTumblerUPC
    const tumblerPrice = Cypress.env().yetiTumblerPrice
    const tumblerDescription = Cypress.env().yetiTumblerDescription
    const gloveUPC = Cypress.env().baseballGloveUPC
    const glovePrice = Cypress.env().baseballGlovePrice
    const gloveDescription = Cypress.env().baseballGloveDescription
    const golfClubUPC = Cypress.env().golfClubUPC
    const golfClubPrice = Cypress.env().golfClubPrice
    const golfClubDescription = Cypress.env().golfClubDescription
    const items = [tumblerPrice, glovePrice, golfClubPrice]
    const subtotal = helpers.determinSubtotal(items)
    const tax = helpers.determinTax(subtotal)
    const total = helpers.determinTotal(subtotal, tax)
    
    beforeEach(() => {
        cy.launchPageLoggedIn()
    })

    it('Test 1: Show items scanned in order scanned with description, price, UPC, and totals.', () => { 
        cy.addItemOrLoyalty(golfClubUPC, tumblerGloveClubResponse)
        tags.descriptionItem1().should('have.text', tumblerDescription)
        tags.upcItem1().should('have.text', tumblerUPC)
        tags.priceItem1().should('have.text', tumblerPrice)
        tags.descriptionItem2().should('have.text', gloveDescription)
        tags.upcItem2().should('have.text', gloveUPC)
        tags.priceItem2().should('have.text', glovePrice)
        tags.descriptionItem3().should('have.text', golfClubDescription)
        tags.upcItem3().should('have.text', golfClubUPC)
        tags.priceItem3().should('have.text', golfClubPrice)
        tags.couponsAndDiscounts().should('have.text', '0.00')
        tags.subtotal().should('have.text', (subtotal))
        tags.taxes().should('have.text', tax)
        tags.total().should('have.text', total)
        tags.complete().should('be.visible')
    })

    it('Test 2: Items have dropdown menu to delete or edit amount', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerGloveClubResponse)
        tags.editItem1().should('be.visible')
            .click()
        tags.editItem().should('be.visible')
        tags.deleteItem().should('be.visible')
        cy.get('body').click()
        tags.editItem2().should('be.visible')
            .click()
        tags.editItem().should('be.visible')
        tags.deleteItem().should('be.visible')
        cy.get('body').click()
        tags.editItem3().should('be.visible')
            .click()
        tags.editItem().should('be.visible')
        tags.deleteItem().should('be.visible')
        cy.get('body').click()
    })

    it('Test 3: Selecting edit price highlights item amount and sets it to 0 until new amount entered', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerGloveClubResponse)
        tags.editItem1().click()
        tags.editItem().click()
        tags.itemPriceInput().should('have.value', '0.00')
    })

    it('Test 4: Selecting edit price but not providing a new price resets to last price of item', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerGloveClubResponse)
        tags.editItem1().click()
        tags.editItem().click()
        cy.get('body').click()
        tags.priceItem1().should('have.text', tumblerPrice)
    })

    it('Test 5: The POS should not allow 0.00 to be entered for a price override value.', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerResponse)
        tags.editItem1().click()
        tags.editItem().click()
        tags.itemPrice0EntryField().click()
          .type('000{enter}')
        tags.itemPrice0EntryField().should('have.value', '0.00')
      })

    it('Test 6: Selecting edit price and entering a valid amount changes the items price in the transaction card.', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerResponse)
        tags.editItem1().click()
        tags.editItem().click()
        cy.editItemPrice(1000, tumblerPriceChangeResponse)
        tags.priceItem1().should('have.text', '10.00')
    })

    it('Test 7: Selecting delete item removes item from list and totals are adjusted accordingly', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerGloveClubResponse)
        tags.editItem3().click()
        cy.deleteItem(deleteClubResponse)
        tags.transactionCard().should('not.contain.text', golfClubDescription)
        tags.transactionCard().should('not.contain.text', golfClubPrice)
        tags.transactionCard().should('not.contain.text', golfClubUPC)
        let twoItems = [tumblerPrice, glovePrice]
        let twoSubtotal = helpers.determinSubtotal(twoItems)
        let twoTax = helpers.determinTax(twoSubtotal)
        let twoTotal = helpers.determinTotal(twoSubtotal, twoTax)
        tags.subtotal().should('have.text', twoSubtotal)
        tags.taxes().should('have.text', twoTax)
        tags.total().should('have.text', twoTotal)
    })

    it('Test 8: Selecting delete item and removing last item in list voids transaction', () => {
        cy.addItemOrLoyalty(golfClubUPC, tumblerGloveClubResponse)
        tags.editItem3().click()
        cy.deleteItem(deleteClubResponse)
        tags.editItem2().click()
        cy.deleteItem(deleteGloveResponse)
        tags.editItem1().click()
        cy.deleteItem(deleteTumblerResponse)
        tags.transactionCard().should('not.exist')
    })
})
