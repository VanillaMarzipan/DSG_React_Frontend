/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Loyalty Enrollment tests', () => {

  const tags = new elements()
  const phoneNumberNoResults = Cypress.env().phoneNumberNoResults
  const noCustomerFoundResponseData = '{"type":"LoyaltyAccounts","loyalty":[],"transaction":{"header":{"timestamp":1618506882146,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":0,"transactionTypeDescription":"0","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0}}}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.addItemOrLoyalty(phoneNumberNoResults, noCustomerFoundResponseData)
    tags.loyaltyAdvancedSearchEnrollNowButton().click()
  })

  it('Test 1: Shows form with firstname, lastname, street, zip, phone, and email fields', () => {
    tags.loyaltyAdvancedSearchFirstName().should('be.visible')
    tags.loyaltyAdvancedSearchLastName().should('be.visible')
    tags.loyaltyAdvancedSearchZipCode().should('be.visible')
    tags.loyaltyAdvancedSearchCity().should('be.visible')
    tags.loyaltyAdvancedSearchState().should('be.visible')
    tags.loyaltyAdvancedSearchStreet().should('be.visible')
    tags.loyaltyAdvancedSearchPhone().should('be.visible')
    tags.loyaltyAdvancedSearchEmail().should('be.visible')
    tags.loyaltyAdvancedSearchConfirmChanges().should('be.visible')
  })

  it('Test 2: Fields should auto-populate from search input', () => {
    tags.loyaltyAdvancedSearchPhone().should('have.value', '(000) 000-0001')
  })

  it('Test 3: The first name field should not accept special characters.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('!@#$%^&*()_+[]<>?')
    tags.loyaltyAdvancedSearchFirstName().should('have.value', '')
  })
  it('Test 4: The first name field should not accept any numbers.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('1234567890')
    tags.loyaltyAdvancedSearchFirstName().should('have.value', '')
  })

  it('Test 5: The first name field should be limited to 40 characters.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee')
    tags.loyaltyAdvancedSearchFirstName().should('have.value', 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd')
  })

  it('Test 6: The last name field does not accept any special characters.', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type('!@#$%^&*()_+[]<>?')
    tags.loyaltyAdvancedSearchLastName().should('have.value', '')
  })

  it('Test 7: The last name field does not accept any numbers.', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type('1234567890')
    tags.loyaltyAdvancedSearchLastName().should('have.value', '')
  })

  it('Test 8: The last name field is limited to 40 characters.', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type('aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee')
    tags.loyaltyAdvancedSearchLastName().should('have.value', 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd')
  })

  it('Test 9: Zip code field should not take letters.', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('abcde')
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '')
  })

  it('Test 10: When populated with an invalid zip code an error message is displayed.', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('00000')
    tags.loyaltyAdvancedSearchCity().should('have.value', '')
    tags.loyaltyAdvancedSearchState().should('have.value', '')
  })

  it('Test 11: When a valid zip code is entered, the city and state are populated.', () => {
    cy.intercept({
      method: 'GET',
      url: '**/Loyalty/zip/**'
    }, {
      body: '[{"city":"SEWICKLEY","country":"US","fips":"42003","latitude":40.573314,"longitude":-80.146083,"msa":"6280","state":"PA","zip":"15143"},{"city":"EDGEWORTH","country":"US","fips":"42003","latitude":40.573314,"longitude":-80.146083,"msa":"6280","state":"PA","zip":"15143"}]'
    }).as('zipCodeLookup')
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('15143{enter}')
    cy.wait('@zipCodeLookup')
    cy.get('body').should('contain.text', 'Sewickley')
    tags.loyaltyAdvancedSearchState().should('have.value', 'PA')
  })

  it('Test 12: Phone number does not accept special characters !@#$%^&*_+', () => {
    tags.loyaltyAdvancedSearchPhone().click()
    for (let i = 0; i < 10; i++) {
      tags.loyaltyAdvancedSearchPhone().type('{backspace}')
    }
    tags.loyaltyAdvancedSearchPhone().type('!@#$%^&*_+')
    tags.loyaltyAdvancedSearchPhone().should('have.value', '')
  })

  it('Test 13: Phone number does not accept alpha characters.', () => {
    tags.loyaltyAdvancedSearchPhone().click()
    for (let i = 0; i < 10; i++) {
      tags.loyaltyAdvancedSearchPhone().type('{backspace}')
    }
    tags.loyaltyAdvancedSearchPhone().type('abcdefghij')
    tags.loyaltyAdvancedSearchPhone().should('have.value', '')
  })

  it('Test 14: The phone number field only accepts 10 digits.', () => {
    tags.loyaltyAdvancedSearchPhone().click()
    for (let i = 0; i < 10; i++) {
      tags.loyaltyAdvancedSearchPhone().type('{backspace}')
    }
    tags.loyaltyAdvancedSearchPhone().type('234567890121')
    tags.loyaltyAdvancedSearchPhone().click().should('have.value', '(234) 567-8901')
  })

  it('Test 15: Form does not submit until all fields have been entered.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('Tony')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    tags.loyaltyAdvancedSearchLastName().click()
      .type('Stark')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('15143')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    tags.loyaltyAdvancedSearchStreet().click()
      .type('345 Court Street Street')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    tags.loyaltyAdvancedSearchLastName().click()
      .clear()
    tags.loyaltyAdvancedSearchEmail().click()
      .type('Tony.Stark@dcsg.com')
    tags.loyaltyAdvancedSearchConfirmChanges().click()
    cy.get('body').should('not.contain.text', 'ScoreCard Enrollment Succesful')
  })
})

context('Loyalty Enrollment tests (with loyalty account ID)', () => {

  const tags = new elements()
  const loyaltyAccountNoResults = 'L01XXXXXXXXX'
  const noCustomerFoundResponseData = '{"type":"LoyaltyAccounts","loyalty":[],"transaction":{"header":{"timestamp":1618506882146,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":0,"transactionTypeDescription":"0","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0}}}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.addItemOrLoyalty(loyaltyAccountNoResults, noCustomerFoundResponseData)
    tags.loyaltyAdvancedSearchEnrollNowButton().click()
  })

  it('Test 16: Phone field does not auto-populate if search input is loyalty account ID', () => {
    tags.loyaltyAdvancedSearchPhone().should('have.value', '')
  })
})