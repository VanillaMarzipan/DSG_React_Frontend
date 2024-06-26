/// < reference types="cypress"/>
import elements from '../../support/pageElements'

const giftCardAmount = 25
const tags = new elements()
const managerNumber = Cypress.env().warrantySellingAssociateNum
const managerPIN = Cypress.env().warrantySellingAssociatePIN

// Create command for MO validation to use in different tests in this file
Cypress.Commands.add('complementaryGiftCardManagerOverrideValidation', () => {
    tags.managerOverrideAssociateId().click()
        .type(managerNumber)
    tags.managerOverrideAssociatePin().type(managerPIN)
    cy.intercept('**/Security/**', { statusCode: 204 }).as('managerOverrideResp')
    tags.managerOverrideApplyButton().click()
    cy.wait('@managerOverrideResp')
})

context('Customer Service & High Five Gift Card Creation Tests', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
        tags.giftCardFooterButton().click()
        tags.activateGiftCardButton().should('be.visible')
            .click()
    })
    it('Test 1: validate activate gift card modal page 1 has 3 reasons and correct verbiage', () => {
        tags.giftCardSaleButton().should('be.visible')
            .and('have.text', 'SELL GIFT CARD')
        tags.giftCardCustomerServiceButton().should('be.visible')
            .and('have.text', 'CUSTOMER SERVICE')
        tags.giftCardHighFiveButton().should('be.visible')
            .and('have.text', 'HIGH FIVE CARD')
        tags.activateGiftCardModalTitle().should('have.text', 'ACTIVATE GIFT CARD')
        tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.activateGiftCardModalCloseButton().should('be.visible')
            .click()
    })
    it('Test 2: validate customer srvice GC activation success flow', () => {
        tags.giftCardCustomerServiceButton().click()
        cy.complementaryGiftCardManagerOverrideValidation()
        tags.activateGiftCardAmountPageCustomerServiceText().should('be.visible')
        tags.activateGiftCardAmountInput().type(giftCardAmount)
        cy.window().then((w) => {
            w.getMsrDataEvent('{"IsValid":true,"AccountNumber":"1234567890123456","Expiration":"10/25"}')
        })
        cy.intercept('**/Transaction/**', { statusCode: 200, body: '1451' }).as('confirmResp')
        tags.activateGiftCardConfirmButton().should('be.visible')
            .click()
        cy.wait('@confirmResp')
        tags.complementaryGiftCardCompletePageSubHeader().should('have.text', 'Customer Service')
        tags.complementaryGiftCardSuccessPageAmount().should('have.text', '$' + giftCardAmount.toFixed(2))
        tags.activateGiftCardCompleteButton().should('be.visible')
        tags.backButton().should('not.exist')
        tags.activateGiftCardModalCloseButton().should('be.visible')
            .click()
        tags.omniScan().should('be.visible')
    })
    it('Test 3: validate High Five GC activation success flow', () => {
        tags.giftCardHighFiveButton().click()
        cy.complementaryGiftCardManagerOverrideValidation()
        tags.activateGiftCardAmountPageHighFiveText().should('be.visible')
        tags.activateGiftCardAmountInput().type(giftCardAmount)
        cy.window().then((w) => {
            w.getMsrDataEvent('{"IsValid":true,"AccountNumber":"1234567890123456","Expiration":"10/25"}')
        })
        cy.intercept('**/Transaction/**', { statusCode: 200, body: '1451' }).as('confirmResp')
        tags.activateGiftCardConfirmButton().should('be.visible')
            .click()
        cy.wait('@confirmResp')
        tags.complementartGiftCardSuccessMessage().should('be.visible')
        tags.complementaryGiftCardCompletePageSubHeader().should('have.text', 'High Five Card')
        tags.complementaryGiftCardSuccessPageAmount().should('have.text', '$' + giftCardAmount.toFixed(2))
        tags.activateGiftCardCompleteButton().should('be.visible')
        tags.backButton().should('not.exist')
        tags.activateGiftCardModalCloseButton().should('be.visible')
            .click()
        tags.omniScan().should('be.visible')
    })
    it('Test 4: validate error message on complementary GC flow', () => {
        tags.giftCardHighFiveButton().click()
        cy.complementaryGiftCardManagerOverrideValidation()
        tags.activateGiftCardAmountPageHighFiveText().should('be.visible')
        tags.activateGiftCardAmountInput().type(giftCardAmount)
        cy.window().then((w) => {
            w.getMsrDataEvent('{"IsValid":false,"AccountNumber":"1234567890123456","Expiration":"10/25"}')
        })
        tags.complementartGiftCardErrorMessage().should('be.visible')
        tags.backButton().should('be.visible')
    })
    it('Test 5: validate back button is working', () => {
        tags.giftCardHighFiveButton().click()
        cy.complementaryGiftCardManagerOverrideValidation()
        tags.backButton().should('be.visible')
            .click()
        tags.giftCardSaleButton().should('be.visible')
            .and('have.text', 'SELL GIFT CARD')
        tags.giftCardCustomerServiceButton().should('be.visible')
            .and('have.text', 'CUSTOMER SERVICE')
        tags.giftCardHighFiveButton().should('be.visible')
            .and('have.text', 'HIGH FIVE CARD')
        tags.activateGiftCardModalTitle().should('have.text', 'ACTIVATE GIFT CARD')
        tags.giftCardCustomerServiceButton().click()
        cy.complementaryGiftCardManagerOverrideValidation()
        tags.backButton().should('be.visible')
        tags.activateGiftCardAmountPageCustomerServiceText().should('be.visible')
            .and('have.text', 'Customer Service')
        tags.activateGiftCardAmountInput().type(giftCardAmount)
        cy.window().then((w) => {
            w.getMsrDataEvent('{"IsValid":true,"AccountNumber":"1234567890123456","Expiration":"10/25"}')
        })
        tags.activateGiftCardConfirmButton().should('be.visible')
        //back button working on confirm screen
        tags.backButton().should('be.visible')
            .click()
    })
})
context('MO does not prompt if manager is logged in', () => {

    beforeEach(() => {
        cy.launchPage()
        cy.login(managerNumber, managerPIN, null, true)
        tags.giftCardFooterButton().click()
        tags.activateGiftCardButton().should('be.be.visible')
            .click()
    })

    it('Test 6: validate if manager has logged in, MO prompt should not be triggerred', () => {
        tags.giftCardHighFiveButton().click()
        tags.activateGiftCardModalTitle().should('have.text', 'ACTIVATE GIFT CARD')
        tags.backButton().should('be.visible')
        tags.activateGiftCardAmountPageHighFiveText().should('be.visible')
            .and('have.text', 'High Five Card')
        tags.activateGiftCardAmountInput().type(giftCardAmount)
        cy.window().then((w) => {
            w.getMsrDataEvent('{"IsValid":true,"AccountNumber":"1234567890123456","Expiration":"10/25"}')
        })
        cy.intercept('**/Transaction/**', { statusCode: 200, body: '1451' }).as('confirmResp')
        tags.activateGiftCardConfirmButton().should('be.visible')
            .click()
        cy.wait('@confirmResp')
        tags.complementartGiftCardSuccessMessage().should('be.visible')
        tags.complementaryGiftCardCompletePageSubHeader().should('have.text', 'High Five Card')
        tags.complementaryGiftCardSuccessPageAmount().should('have.text', '$' + giftCardAmount.toFixed(2))
        tags.activateGiftCardCompleteButton().should('be.visible')
        tags.backButton().should('not.exist')
        tags.activateGiftCardModalCloseButton().should('be.visible')
            .click()
        tags.omniScan().should('be.visible')
    })
})
