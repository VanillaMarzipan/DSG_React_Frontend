/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Loyalty Multiple Customers tests', () => {

  const tags = new elements()
  const phoneNumberMultipleResults = Cypress.env().phoneNumberMultipleResults
  const multipleCustomersFoundResponseData = '{"type":"LoyaltyAccounts","loyalty":[{"id":887240,"firstName":"STEVE","lastName":"IRWIN","emailAddress":"STEVE.IRWIN@STINGRAY.COM","street":"36 STINGER ROAD","city":"PITTSBURGH","state":"PA","zip":"15211","homePhone":"4125555555","loyalty":"250000300017","subAccount":"25000030","currentPointBalance":0.0,"rewardAmount":0.0},{"id":889972,"firstName":"walter","lastName":"white","emailAddress":"BREAKINGBAD@WALTERWHITE.COM","street":"6500 BAD BLVD","city":"CORAOPOLIS","state":"PA","zip":"15108","homePhone":"4125555555","loyalty":"250000350012","subAccount":"25000035","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890074,"firstName":"JACK","lastName":"APPROVAL","emailAddress":"JACK.APPROVAL@DCSG.COM","street":"123 APPROVAL ROAD","city":"PITT","state":"PA","zip":"15211","homePhone":"4125555555","loyalty":"250000410013","subAccount":"25000041","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0}],"transaction":{"header":{"timestamp":1618514522123,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":0,"transactionTypeDescription":"0","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0}}}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.addItemOrLoyalty(phoneNumberMultipleResults, multipleCustomersFoundResponseData)
  })

  it('Test 1:  The page shows not this athlete / search again box', () => {
    tags.searchAgainCard().should('be.visible')
    tags.numberOfPagesOfResults().should('be.visible')
      .should('have.text', '1/4')
    tags.loyaltyAdvancedSearchNextArrow().should('be.visible')
  })

  it('Test 2: The next arrow advances to next page of results.', () => {
    tags.loyaltyAdvancedSearchNextArrow().click()
    tags.numberOfPagesOfResults().should('be.visible')
      .should('have.text', '2/4')
  })

  it('Test 3: If viewing beyond page one of results, previous arrow should be present', () => {
    tags.loyaltyAdvancedSearchNextArrow().click()
    tags.loyaltyAdvancedSearchPreviousArrow().should('be.visible')
  })

  it('Test 4: The previous arrow goes back to previous page of results.', () => {
    tags.loyaltyAdvancedSearchNextArrow().click()
    tags.loyaltyAdvancedSearchPreviousArrow().click()
    tags.numberOfPagesOfResults().should('have.text', '1/4')
  })

  it('Test 5: The last page arrow should go to the last page of results.', () => {
    tags.loyaltyAdvancedSearchLastArrow().click()
    tags.numberOfPagesOfResults().should('have.text', '4/4')
  })

  it('Test 6: The first page arrow should go back to the first page of results.', () => {
    tags.loyaltyAdvancedSearchLastArrow().click()
    tags.loyaltyAdvancedSearchFirstArrow().click()
    tags.numberOfPagesOfResults().should('have.text', '1/4')
  })
})
