/// <reference types="cypress" />
import elements from '../../support/pageElements'
import promptForPriceResponse from '../../fixtures/items/promptForPriceItem.json'
import updateItemPrice100 from '../../fixtures/items/upatePricePromptForPrice100.json'
import tumblerAndPromptForPriceResponse from '../../fixtures/items/tublerAndPromptForPriceResponse.json'
import tumblerAndUpdatedPromptForPriceResponse from '../../fixtures/items/tumblerAndPromptForPrice5000response.json'

context('Omnisearch tests', () => {
  const yetiTumblerResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1618433317540,"signature":"4eD/8OevagKShq1WBMV0Y/B40a95YaA8Hy0x9p3aXcY=","transactionKey":"246200087911304142021","tenderIdentifier":"1-246200087911304142021","eReceiptKey":"5008791130009041421013","storeNumber":879,"registerNumber":113,"transactionNumber":9,"startDateTime":"2021-04-14T20:48:37.383631Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.00,"remainingBalance":32.09}},"upc":"888830050118"}'
  const noCustomerFoundResponseData = '{"type":"LoyaltyAccounts","loyalty":[],"transaction":{"header":{"timestamp":1618506882146,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":0,"transactionTypeDescription":"0","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0}}}'
  const multipleCustomersFoundResponseData = '{"type":"LoyaltyAccounts","loyalty":[{"id":887240,"firstName":"STEVE","lastName":"IRWIN","emailAddress":"STEVE.IRWIN@STINGRAY.COM","street":"36 STINGER ROAD","city":"PITTSBURGH","state":"PA","zip":"15211","homePhone":"4125555555","loyalty":"250000300017","subAccount":"25000030","currentPointBalance":0.0,"rewardAmount":0.0},{"id":889972,"firstName":"walter","lastName":"white","emailAddress":"BREAKINGBAD@WALTERWHITE.COM","street":"6500 BAD BLVD","city":"CORAOPOLIS","state":"PA","zip":"15108","homePhone":"4125555555","loyalty":"250000350012","subAccount":"25000035","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890074,"firstName":"JACK","lastName":"APPROVAL","emailAddress":"JACK.APPROVAL@DCSG.COM","street":"123 APPROVAL ROAD","city":"PITT","state":"PA","zip":"15211","homePhone":"4125555555","loyalty":"250000410013","subAccount":"25000041","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0},{"id":890077,"firstName":"Jane","lastName":"Approval","emailAddress":"JANE.APPROVAL@DCSG.COM","street":"345 Court St","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"4125555555","loyalty":"250000420012","subAccount":"25000042","currentPointBalance":0.0,"rewardAmount":0.0}],"transaction":{"header":{"timestamp":1618514522123,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":0,"transactionTypeDescription":"0","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0}}}'

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  const tags = new elements()

  it('Test 1: The page should show barcode unknown for UPCs less than 10 numeric characters', () => {
    cy.intercept('**/OmniSearch', { statusCode: 422,
        body: '{"type":"Error","error":{"statusCode":422,"reasonCode":0,"message":"Query didn\'t match any supported omnisearch pattern","originatingService":"PosCoordinator"},"upc":"123456789"}'
      }).as('omnisearch')
    cy.omniSearch('123456789')
    cy.wait('@omnisearch')
    tags.scanPanel().should('contain.text', 'Barcode unknown')
    tags.transactionCard().should('not.exist')
  })

  it('Test 2: The page should show barcode unknown for UPCs over 12 numeric digits.', () => {
    cy.intercept('**/OmniSearch', { statusCode: 422,
        body: '{"type":"Error","error":{"statusCode":422,"reasonCode":0,"message":"Query didn\'t match any supported omnisearch pattern","originatingService":"PosCoordinator"},"upc":"123456789"}'
      }).as('omnisearch')
    cy.omniSearch('1234567890123')
    cy.wait('@omnisearch')
    tags.scanPanel().should('contain.text', 'Barcode unknown')
    tags.transactionCard().should('not.exist')
  })

  it('Test 3: The page should add item to transaction card on successful 11-digit lookup', () => {
    cy.addItemOrLoyalty(Cypress.env().yetiTumblerUPC, yetiTumblerResponseData)
    tags.transactionCard().should('be.visible')
      .should('contain.text', Cypress.env().yetiTumblerDescription)
      .should('contain.text', Cypress.env().yetiTumblerUPC)
    tags.productImage().should('be.visible')
    tags.productDetailContainer().should('be.visible')
      .should('contain.text', Cypress.env().yetiTumblerDescription)
      .should('contain.text', Cypress.env().yetiTumblerUPC)
  })

  it('Test 4: The page should update scorecard panel with No accounts found on unsuccessful 10-digit lookup', () => {
    cy.addItemOrLoyalty(Cypress.env().phoneNumberNoResults, noCustomerFoundResponseData)
    tags.loyaltyMiniController().should('be.visible')
      .should('contain.text', 'No Account Found')
    tags.loyaltyAdvancedSearch().should('be.visible')
      .should('contain.text', 'Advanced Search')
      .should('contain.text', 'search by name and zip code')
      .should('contain.text', 'First Name')
      .should('contain.text', 'Last Name')
      .should('contain.text', 'Zip Code')
      .should('contain.text', 'Not a Scorecard Holder?')
      .should('contain.text', 'ENROLL NOW')
      tags.loyaltyClearButton().click()
      tags.signout().should('be.visible')
  })

  it('Test 5: The page should update scorecard panel with Multiple accounts found on successful 10-digit lookup with more than one result', () => {
    cy.addItemOrLoyalty(Cypress.env().phoneNumberMultipleResults, multipleCustomersFoundResponseData)
    tags.loyaltyMiniController().should('be.visible')
      .should('contain.text', 'Multiple Accounts Found')
    cy.get('body').should('contain.text', 'Select Correct Account')
      .should('contain.text', 'NEXT')
      .should('contain.text', 'LAST')
    tags.searchAgainCard().should('be.visible')
      .should('have.text', 'Not This\nAthlete?search again')
    tags.loyaltyInfoCard0().should('be.visible')
      .should('contain.text', 'STEVE IRWIN')
    tags.loyaltyInfoCard1().should('be.visible')
      .should('contain.text', 'walter white')
    tags.loyaltyClearButton().click()
    tags.signout().should('be.visible')
  })

  it('Test 6: The page should update scorecard panel with customer name on successful 10-digit lookup', () => {
    cy.loyaltyNoItems()
    tags.loyaltyMiniController().should('be.visible')
      .should('contain.text', 'Rolyat Nai')
      .should('contain.text', 'Points Balance: 353')
      tags.loyaltyClearButton().click()
      tags.signout().should('be.visible')
  })

  it('Test 7: Manager Override prompt does not appear when first item added is $1.00 prompt for price', () => {
    cy.addItemOrLoyalty(Cypress.env().promptForPriceUPC, promptForPriceResponse)
    tags.itemRow().should('have.css', 'border-color', 'rgb(218, 22, 0)')
    cy.intercept({ method: 'POST', url: '**/Product/PriceChange/1'}, { body: updateItemPrice100 }).as('enterPrice')
    tags.itemPriceInput().type('100{ENTER}')
    tags.managerOverrideModal().should('not.exist')
    tags.managerOverrideAssociateId().should('not.exist')
    tags.managerOverrideAssociatePin().should('not.exist')
    tags.managerOverrideDeclineButton().should('not.exist')
    tags.managerOverrideApplyButton().should('not.exist')
    cy.wait('@enterPrice')
    tags.transactionCard().should('contain.text', Cypress.env().promptForPriceDescription)
    tags.transactionCard().should('contain.text', '1.00')
  })

  it('Test 8: Manager Override prompt does not appear when second item added is $50.00 prompt for price', () => {
    cy.addItemOrLoyalty(Cypress.env().yetiTumblerUPC, yetiTumblerResponseData)
    tags.transactionCard().should('contain.text', Cypress.env().yetiTumblerDescription)
    cy.addItemOrLoyalty(Cypress.env().promptForPriceUPC, tumblerAndPromptForPriceResponse)
    cy.intercept({ method: 'POST', url: '**/Product/PriceChange/2'}, { body: tumblerAndUpdatedPromptForPriceResponse }).as('enterPrice')
    tags.itemPriceInput().type('5000{ENTER}')
    tags.managerOverrideModal().should('not.exist')
    tags.managerOverrideAssociateId().should('not.exist')
    tags.managerOverrideAssociatePin().should('not.exist')
    tags.managerOverrideDeclineButton().should('not.exist')
    tags.managerOverrideApplyButton().should('not.exist')
    cy.wait('@enterPrice')
    tags.transactionCard().should('contain.text', Cypress.env().promptForPriceDescription)
    tags.transactionCard().should('contain.text', '50.00')
  })
})
