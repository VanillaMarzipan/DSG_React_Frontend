/// <reference types="cypress" />

import elements from '../../support/pageElements'
import configurationResponse from '../../fixtures/configurationResponse.json'
import featureFlagResponse from '../../fixtures/featureFlagResponse.json'
import authenticateResponse from '../../fixtures/authenticateResponse.json'

context('Unhandled Exception tests', () => {

    const tags = new elements()
    const registerManagerClosedResponse = '{"macAddress":"B1650037409565","storeNumber":879,"registerNumber":225,"state":0,"stateDescription":"Closed"}'
    const associateID = Cypress.env().associateNum
    const associatePW = Cypress.env().associatePIN

    it('Test 1: No response from configuration service pops unhandled exception modal', () => {
        cy.intercept('**/configuration', { body: '' } ).as('configurationDown')
        cy.visit('/')
        cy.wait('@configurationDown')
        tags.unhandledExceptionModalTitle().should('have.text', 'Unexpected Error')
        tags.unhandledExceptionModalBody().should('contain.text', 'Details: Error fetching store info from coordinator')
            .should('contain.text', 'If this issue persists, please try ringing the transaction on another register.')
        tags.unhandledExceptionModalRefreshButton().should('be.visible')
    })

    it('Test 2: No response from register manager service pops unhandled exception modal', () => {
        cy.intercept('**/configuration', { body: configurationResponse } ).as('configurationWorking')
        cy.intercept('**/Register/RegisterNumber/**', { body: '' } ).as('registerMangerDown')
        cy.visit('/')
        cy.wait(['@configurationWorking', '@registerMangerDown'])
        tags.unhandledExceptionModalTitle().should('have.text', 'Unexpected Error')
        tags.unhandledExceptionModalBody().should('contain.text', 'Details: Error getting register startup data')
            .should('contain.text', 'If this issue persists, please try ringing the transaction on another register.')
        tags.unhandledExceptionModalRefreshButton().should('be.visible')
    })

    it('Test 3: No response from feature flag service pops unhandled exception modal', () => {
        cy.intercept('**/configuration', { body: configurationResponse } ).as('configurationWorking')
        cy.intercept('**/Register/RegisterNumber/**', { body: registerManagerClosedResponse } ).as('registerManagerWorking')
        cy.intercept('**/Configuration/Settings**', { body: '' } ).as('featureFlagsDown')
        cy.visit('/')
        cy.wait(['@configurationWorking', '@registerManagerWorking', '@featureFlagsDown'])
        tags.unhandledExceptionModalTitle().should('have.text', 'Unexpected Error')
        tags.unhandledExceptionModalBody().should('contain.text', 'Details: Feature flags and config / Failure to connect to coordinator')
            .should('contain.text', 'If this issue persists, please try ringing the transaction on another register.')
        tags.unhandledExceptionModalRefreshButton().should('be.visible')
    })

    it('Test 4: Clicking refresh reloads the page, and could clear the unhandled exception modal', () => {
        cy.intercept('**/configuration', { body: configurationResponse } ).as('configurationWorking')
        cy.intercept('**/Register/RegisterNumber/**', { body: registerManagerClosedResponse } ).as('registerManagerWorking')
        cy.intercept('**/Configuration/Settings**', { body: '' } ).as('featureFlagsDown')
        cy.visit('/')
        cy.wait(['@configurationWorking', '@registerManagerWorking', '@featureFlagsDown'])
        tags.unhandledExceptionModalTitle().should('have.text', 'Unexpected Error')
        tags.unhandledExceptionModalBody().should('contain.text', 'Details: Feature flags and config / Failure to connect to coordinator')
            .should('contain.text', 'If this issue persists, please try ringing the transaction on another register.')
        tags.unhandledExceptionModalRefreshButton().should('be.visible')
        cy.intercept('**/configuration', { body: configurationResponse } ).as('configurationWorking')
        cy.intercept('**/Register/RegisterNumber/**', { body: registerManagerClosedResponse } ).as('registerManagerWorking')
        cy.intercept('**/Configuration/Settings**', { body: featureFlagResponse } ).as('featureFlagsWorkingNow')
        tags.unhandledExceptionModalRefreshButton().click()
        cy.wait([ '@configurationWorking', '@registerManagerWorking', '@featureFlagsWorkingNow'])
        tags.login().should('be.visible')
        tags.pin().should('be.visible')
        tags.unhandledExceptionModalTitle().should('not.exist')
        tags.unhandledExceptionModalBody().should('not.exist')
        tags.unhandledExceptionModalRefreshButton().should('not.exist')
    })

    it('Test 5: No response from open register call pops unhandled exception modal', () => {
        cy.intercept('**/configuration', { body: configurationResponse } ).as('configurationWorking')
        cy.intercept('**/Register/RegisterNumber/**', { body: registerManagerClosedResponse } ).as('registerManagerWorking')
        cy.intercept('**/Configuration/Settings**', { body: featureFlagResponse } ).as('featureFlagsWorking')
        cy.visit('/')
        cy.wait(['@configurationWorking', '@registerManagerWorking', '@featureFlagsWorking'])
        cy.intercept('**/Security/Authenticate/', { body: authenticateResponse } ).as('authWorking')
        cy.intercept('**/ActiveTransaction', { body: '' } ).as('noActiveTransaction')
        cy.intercept('**/Register/OpenRegister', { body: '' } ).as('openRegisterDown')
        tags.login().type(associateID)
        tags.pin().type(associatePW)
        tags.loginSubmit().click()
        cy.wait(['@authWorking', '@noActiveTransaction', '@openRegisterDown' ])
        tags.unhandledExceptionModalTitle().should('have.text', 'Unexpected Error')
        tags.unhandledExceptionModalBody().should('contain.text', 'Details: Error opening register')
            .should('contain.text', 'If this issue persists, please try ringing the transaction on another register.')
        tags.unhandledExceptionModalRefreshButton().should('be.visible')
    })
})