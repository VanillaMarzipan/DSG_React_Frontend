/// <reference types="cypress" />

import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'
import loyaltyLookupWrongZipResponse from '../../fixtures/loyalty/loyaltyLookupWrongZip'
import loyaltyLookupWrongFirstNameResponse from '../../fixtures/loyalty/loyaltyLookupWrongFirstName'
import loyaltyLookupWrongLasttNameResponse from '../../fixtures/loyalty/loyaltyLookupWrongLastName'

const tags = new elements()
const firstName = Cypress.env().AbeLincolnFirstName
const lastName = Cypress.env().AbeLincolnLastName
const zipCode = Cypress.env().AbeLincolnZip

context('Loyalty lookup by Name from Initial Scan page tests', () => {

    beforeEach(() => {

        cy.launchPageLoggedIn()
        tags.productLookupFooterButton().click()
        tags.loyaltyLookupByName().click()
    })

    it('Test 1: Validate lookup by wrong zipcode 20501, navigates to the enrollment page with entered info auto populated', () => {
        tags.loyaltyAdvancedSearchFirstName().type(firstName)
        tags.loyaltyAdvancedSearchLastName().click().type(lastName)
        tags.loyaltyAdvancedSearchZipCode().click().type('20501')
        cy.intercept('**/Loyalty/name/Abraham/Lincoln/**', {body: '[]' }). as ('emptyResponse')
        cy.intercept('**/Loyalty/zip/**', {body: loyaltyLookupWrongZipResponse}).as ('loyaltyWrongZip')
        tags.loyaltyAdvancedSearchSearchAgain().click()
        cy.wait(['@emptyResponse', '@loyaltyWrongZip'])
        tags.loyaltyMiniController().should('be.visible').and('contains.text', 'No Account Found for Abraham Lincoln')
        tags.loyaltyAdvancedSearchFirstName().should('have.value','Abraham')
        tags.loyaltyAdvancedSearchLastName().should('have.value','Lincoln')
        tags.loyaltyAdvancedSearchZipCode().should('have.value','20501')
    })

    it('Test 2: Validate lookup by wrong first name, navigates to the enrollment page with entered info auto populated', () => {
        tags.loyaltyAdvancedSearchFirstName().type('Abrahm')
        tags.loyaltyAdvancedSearchLastName().click().type(lastName)
        tags.loyaltyAdvancedSearchZipCode().click().type(zipCode)
        cy.intercept('**/Loyalty/name/Abrahm/Lincoln/**', {body: '[]' }). as ('emptyResponse')
        cy.intercept('**/Loyalty/zip/**', {body: loyaltyLookupWrongFirstNameResponse}).as ('loyaltyWrongFirstName')
        tags.loyaltyAdvancedSearchSearchAgain().click()
        cy.wait(['@emptyResponse', '@loyaltyWrongFirstName'])
        tags.loyaltyMiniController().should('be.visible').and('contains.text', 'No Account Found for Abrahm Lincoln')
        tags.loyaltyAdvancedSearchFirstName().should('have.value','Abrahm')
        tags.loyaltyAdvancedSearchLastName().should('have.value','Lincoln')
        tags.loyaltyAdvancedSearchZipCode().should('have.value','20500')
    })  

    it('Test 3: Validate lookup by wrong last name, navigates to the enrollment page with entered info auto populated', () => {
        tags.loyaltyAdvancedSearchFirstName().type(firstName)
        tags.loyaltyAdvancedSearchLastName().click().type('Lincn')
        tags.loyaltyAdvancedSearchZipCode().click().type(zipCode)
        cy.intercept('**/Loyalty/name/Abraham/Lincn/**', {body: '[]' }). as ('emptyResponse')
        cy.intercept('**/Loyalty/zip/**', {body: loyaltyLookupWrongLasttNameResponse}).as ('loyaltyWrongLastName')
        tags.loyaltyAdvancedSearchSearchAgain().click()
        cy.wait(['@emptyResponse', '@loyaltyWrongLastName'])
        tags.loyaltyMiniController().should('be.visible').and('contains.text', 'No Account Found for Abraham Lincn')
        tags.loyaltyAdvancedSearchFirstName().should('have.value','Abraham')
        tags.loyaltyAdvancedSearchLastName().should('have.value','Lincn')
        tags.loyaltyAdvancedSearchZipCode().should('have.value','20500')
    })  

    it('Test 4: Validate X button click before No Account Found message navigates to Initial scan page', () => {
        tags.loyaltyAdvancedSearchFirstName().type(firstName)
        tags.loyaltyAdvancedSearchLastName().click().type('Lincn')
        tags.loyaltyAdvancedSearchZipCode().click().type(zipCode)
        cy.intercept('**/Loyalty/name/Abraham/Lincn/**', {body: '[]' }). as ('emptyResponse')
        cy.intercept('**/Loyalty/zip/**', {body: loyaltyLookupWrongLasttNameResponse}).as ('loyaltyWrongLastName')
        tags.loyaltyAdvancedSearchSearchAgain().click()
        cy.wait(['@emptyResponse', '@loyaltyWrongLastName'])
        cy.get('[data-testid="loyalty-clear-button"]').click()
        tags.omniScan().should('be.visible')
    })

    it('Test 5: Lookup by wrong zipcode, enroll successfully', () => {
        tags.loyaltyAdvancedSearchFirstName().type(firstName)
        tags.loyaltyAdvancedSearchLastName().click().type(lastName)
        tags.loyaltyAdvancedSearchZipCode().click().type('20501')
        cy.wrongZipLoyaltyAdvancedSearchToEnroll()
        cy.get('[style="height: 250px; justify-content: space-around; margin-top: 40px; -webkit-box-pack: justify;"]').contains('ScoreCard Enrollment Successful')
    })
})

context('Loyalty lookup by Name in active transaction tests', () => {
    
    beforeEach(() => {

        cy.launchPageLoggedIn(activeTransaction)
        tags.productLookupFooterButton().click()
        tags.loyaltyLookupByName().click()
        tags.loyaltyAdvancedSearchFirstName().should('exist').and('be.visible').focus()
        tags.loyaltyAdvancedSearchFirstName().click().type(firstName).focus()
        tags.loyaltyAdvancedSearchLastName().should('exist').click().type(lastName)
        tags.loyaltyAdvancedSearchZipCode().click().type(20501)
    })

    it('Test 6: Lookup by wrong zipcode in active transaction, navigates to the enrollment page with entered info auto populated', () => {
        cy.intercept('**/Loyalty/name/Abraham/Lincoln/**', {body: '[]' }). as ('emptyResponse')
        cy.intercept('**/Loyalty/zip/**', {body: '[{"city":"WASHINGTON","country":"US","fips":"11001","latitude":38.897492,"longitude":-77.037629,"msa":"8872","state":"DC","zip":"20501"},{"city":"WHITE HOUSE OFC OF VICE PRES","country":"US","fips":"11001","latitude":38.897492,"longitude":-77.037629,"msa":"8872","state":"DC","zip":"20501"}]'}).as ('loyaltyWrongZip')
        tags.loyaltyAdvancedSearchSearchAgain().click()
        cy.wait(['@emptyResponse', '@loyaltyWrongZip'])
        tags.loyaltyMiniController().should('be.visible').and('contains.text', 'No Account Found for Abraham Lincoln')
        tags.loyaltyAdvancedSearchFirstName().should('have.value','Abraham')
        tags.loyaltyAdvancedSearchLastName().should('have.value','Lincoln')
        tags.loyaltyAdvancedSearchZipCode().should('have.value','20501')
    })

    it('Test 7: Lookup by wrong zipcode in active transaction, enroll successfully', () => {
        cy.wrongZipLoyaltyAdvancedSearchToEnroll()
        cy.get('[style="height: 250px; justify-content: space-around; margin-top: 40px; -webkit-box-pack: justify;"]').contains('ScoreCard Enrollment Successful')
    })
})