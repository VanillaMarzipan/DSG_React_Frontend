/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Post Void tests', () => {

  const getLastTransactionGoodResponseData= '{"transaction":{"header":{"timestamp":1646141027350,"signature":"KMo2KJbuh1u3za0ilo4AL1ki9oMi3PYK0UKgtECbLGM=","transactionKey":"372620087910703012022","tenderIdentifier":"2-372620087910703012022","eReceiptKey":"5008791072261030122014","storeNumber":879,"registerNumber":107,"transactionNumber":2261,"startDateTime":"2022-03-01T13:23:18.341275Z","endDateTime":"2022-03-01T13:23:45.100867Z","timezoneOffset":-300,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"totalItemTax":2.45,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":40.0}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":35.0,"tax":2.45,"grandTotal":37.45,"changeDue":2.55,"remainingBalance":-2.55}},"associate":{"associateId":"1234567","firstName":"Johnny","lastName":"Cashier"}}'
  const receiptBarcodeScanResp = '{"header":{"timestamp":1684715486603,"signature":"JAMbTjiyRlx7+qdnR5BLbmovZHaKSqv3HYs4QWrnFNY=","transactionKey":"20230521008884470624","tenderIdentifier":"2-20230521008884470624","eReceiptKey":"5008884470624052123019","storeNumber":888,"registerNumber":447,"transactionNumber":624,"startDateTime":"2023-05-22T00:21:59.266332Z","endDateTime":"2023-05-22T00:22:17.117061Z","transactionDate":"2023-05-21T00:00:00","timezoneOffset":-300,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":103.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[{"discountId":"34143151","discountDescription":"","discountAmount":-26.0,"discountBasePrice":1}],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":150.0}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":103.99,"tax":0.0,"grandTotal":103.99,"changeDue":46.01,"remainingBalance":-46.01,"taxSummaries":[]},"isTaxExempt":false}'

  const tags = new elements()
  const managerNumber = Cypress.env().warrantySellingAssociateNum
  const managerPIN = Cypress.env().warrantySellingAssociatePIN
  const associateNum = Cypress.env().associateNum
  const associatePIN = Cypress.env().associatePIN
  
  beforeEach(() => {
    cy.launchPage()
  })

  it('Test 1: The Post Void button appears on the POS Footer, and is active.', () => {
    cy.login(associateNum, associatePIN)
    tags.registerFunctions().should('be.visible')
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
    tags.postVoid().children().eq(0).children().eq(0).should('have.css', 'fill', 'rgb(245, 122, 25)')
    tags.postVoid().click()
    tags.yesPostVoidButton().should('not.exist')
    tags.noCancelPostVoidButton().should('not.exist')
  })

  it('Test 2: Post void can be initiated by post void last transaction & can navigate back on previous screen', () => {
    cy.login(associateNum, associatePIN, getLastTransactionGoodResponseData)
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
      .click()
    tags.postVoidModalTitle().should('have.text', 'Post Void')
    tags.postVoidModalCloseButton().should('be.visible')
    tags.postVoidModalReceiptLookup().should('be.visible')
    tags.postVoidLastTransaction().should('be.visible')
      .click()
    tags.postVoidEnhancedCancel().should('be.visible')
      .click()
    tags.postVoidLastTransaction().should('be.visible')
  })

  it('Test 3: post void can be initiated by scanneing a receipt & can navigate back on previous screen', () => {
    cy.login(associateNum, associatePIN, getLastTransactionGoodResponseData)
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
      .click()
    tags.postVoidModalTitle().should('have.text', 'Post Void')
    tags.postVoidLastTransaction().should('be.visible')
    cy.intercept('**/Transaction/TransactionByBarcode?**', {body: receiptBarcodeScanResp}).as('receiptBarcodeScan')
    cy.window().then((w) => {
      w.scanEvent('1008884470624052123019')
    })
    cy.wait('@receiptBarcodeScan')
    tags.postVoidEnhancedCancel().should('be.visible')
      .click()
    tags.postVoidLastTransaction().should('be.visible')
  })

  it('Test 4: Clicking Decline on the post void screen takes the associate back to the Omni-Scan screen', () => {
    cy.login(associateNum, associatePIN, getLastTransactionGoodResponseData)
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
    tags.postVoid().children().eq(0).children().eq(0).should('have.css', 'fill', 'rgb(245, 122, 25)')
    tags.postVoid().click()
    tags.postVoidLastTransaction().should('be.visible')
      .click()
    tags.postVoidEnhancedConfirmButton().click()  
    tags.managerOverrideModalTitle().should('be.visible')
      .and('have.text', 'Manager Override')
    tags.managerOverrideDeclineButton().should('be.visible')
      .click()
    tags.omniScan().should('be.visible')
    tags.yesPostVoidButton().should('not.exist')
    tags.noCancelPostVoidButton().should('not.exist')
    tags.transactionCard().should('not.exist')
  })

  it('Test 5: Validate verbiage on MO modal', () => {
    cy.login(associateNum, associatePIN, getLastTransactionGoodResponseData)
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
    tags.postVoid().children().eq(0).children().eq(0).should('have.css', 'fill', 'rgb(245, 122, 25)')
    tags.postVoid().click()
    tags.postVoidLastTransaction().should('be.visible')
      .click()
    tags.postVoidEnhancedConfirmButton().click()  
    tags.managerOverrideModalTitle().should('be.visible')
      .and('have.text', 'Manager Override')
    tags.managerOverrideModal().contains('Post-Void')
    tags.managerOverrideModal().contains('This transaction is being post-voided and needs manager approval.')
  })

  it('Test 6: Manager credentials enabled Apply button ', () => {
    cy.login(associateNum, associatePIN, getLastTransactionGoodResponseData)
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
    tags.postVoid().children().eq(0).children().eq(0).should('have.css', 'fill', 'rgb(245, 122, 25)')
    tags.postVoid().click()
    tags.postVoidLastTransaction().should('be.visible')
      .click()
    tags.postVoidEnhancedConfirmButton().click()  
    tags.managerOverrideModalTitle().should('be.visible')
      .and('have.text', 'Manager Override')
    tags.managerOverrideAssociateId().click()
      .type(managerNumber, { force: true })
    tags.managerOverrideAssociatePin().type(managerPIN, { force: true })
    tags.managerOverrideDeclineButton().should('be.visible')
    tags.managerOverrideApplyButton().should('be.visible')
      .invoke('css', 'background-color')
      .should('eq', 'rgb(0, 101, 84)')
  
  })

  //  Clicking the post void button in the web-client does nothing.
  it.skip('Test 6: Clicking YES, POST-VOID, does in fact post void the transaction', () => {
    cy.login(associateNum, associatePIN, getLastTransactionGoodResponseData)
    tags.registerFunctions().click()
    tags.postVoid().should('be.visible')
    tags.postVoid().children().eq(0).children().eq(0).children().eq(0).should('have.css', 'fill', 'rgb(0, 0, 0)')
    tags.postVoid().click()
    tags.yesPostVoidButton().click()
    tags.yesPostVoidButton().should('not.exist')
    tags.noCancelPostVoidButton().should('not.exist')
    tags.omniScan().should('be.visible')
  })
})
