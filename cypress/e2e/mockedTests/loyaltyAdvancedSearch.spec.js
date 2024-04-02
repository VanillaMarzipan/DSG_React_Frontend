/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Loyalty Advanced Search tests', () => {

  const tags = new elements()
  const phoneNumberNoResults = Cypress.env().phoneNumberNoResults
  const noCustomerFoundResponseData = '{"type":"LoyaltyAccounts","loyalty":[],"transaction":{"header":{"timestamp":1618506882146,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":0,"transactionTypeDescription":"0","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0}}}'

  beforeEach(() => {
    
    cy.launchPageLoggedIn()
    cy.addItemOrLoyalty(phoneNumberNoResults, noCustomerFoundResponseData)
  })

  it('Test 1: Show advanced search form with first name, last name, and zip fields', () => {
    tags.transactionCard().should('contain.text', 'No Account Found')
    tags.loyaltyAdvancedSearchFirstName().should('be.visible')
    tags.loyaltyAdvancedSearchLastName().should('be.visible')
    tags.loyaltyAdvancedSearchZipCode().should('be.visible')
    tags.loyaltyAdvancedSearchSearchAgain().should('be.visible')
  })

  it('Test 2: First Name should not accept special characters !@#$%^&*(),./<>;:[|]', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('!@#$%^&*(),./<>;:[|]')
    tags.loyaltyAdvancedSearchFirstName().should('have.value', '')
  })

  it('Test 3: First Name should not accept numbers 1234567890.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('1234567890')
    tags.loyaltyAdvancedSearchFirstName().should('have.value', '')
  })

  it('Test 4: First Name field should be limited to 40 characters.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type('aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee')
    tags.loyaltyAdvancedSearchFirstName().should('have.value', 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd')
  })

  it('Test 5: First Name field should accept alpha characters, spaces, single quotes, and hyphen.', () => {
    tags.loyaltyAdvancedSearchFirstName().click()
      .type("abcd-efgh i j k l'es")
    tags.loyaltyAdvancedSearchFirstName().should('have.value', "abcd-efgh i j k l'es")
  })

  it('Test 6: Last Name should not accept special characters !@#$%^&*(),./<>;:[|]', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type('!@#$%^&*(),./<>;:[|]')
    tags.loyaltyAdvancedSearchLastName().should('have.value', '')
  })

  it('Test 7: Last Name should not accept numbers 1234567890.', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type('1234567890')
    tags.loyaltyAdvancedSearchLastName().should('have.value', '')
  })

  it('Test 8: Last Name field should be limited to 40 characters.', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type('aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee')
    tags.loyaltyAdvancedSearchLastName().should('have.value', 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd')
  })

  it('Test 9: Last Name field should accept alpha characters, spaces, single quotes, and hyphen.', () => {
    tags.loyaltyAdvancedSearchLastName().click()
      .type("abcd-efgh i j k l'es")
    tags.loyaltyAdvancedSearchLastName().should('have.value', "abcd-efgh i j k l'es")
  })

  it('Test 10: Zip should not accept special characters !@#$%', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('!@#$%')
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '')
  })

  it('Test 11: Zip should not accept special characters ^&*()', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('^&*()')
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '')
  })

  it('Test 12: Zip should not accept special characters _+[]|', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('_+[]|')
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '')
  })

  it("Test 13: Zip should not accept special characters <>?/'", () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type("<>?/'")
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '')
  })

  it('Test 14: Zip should not accept letters abcde', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('abcde')
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '')
  })

  it('Test 15: The zip code field should only allow 5 digits.', () => {
    tags.loyaltyAdvancedSearchZipCode().click()
      .type('1234567890')
    tags.loyaltyAdvancedSearchZipCode().should('have.value', '12345')
  })

  it('Test 16: Loyalty Advanced Search has an Enroll Now button.', () => {
    tags.loyaltyAdvancedSearchEnrollNowButton().should('be.visible')
  })

  it('Test 17: Clicking Enroll Now loads enrollment form.', () => {
    tags.loyaltyAdvancedSearchEnrollNowButton().click()
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
})
