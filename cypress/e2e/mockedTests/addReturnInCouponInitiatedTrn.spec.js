/// <reference types="cypress" />
import elements from '../../support/pageElements'
import couponFromInitialScanPageResp from '../../fixtures/coupon/couponFromInitialScanPageResp'
import couponAddedInTrnCardRes from '../../fixtures/coupon/couponAddedInTrnInitiatedByCouponRes'

const tags = new elements()
const coupon = Cypress.env().coupon20off100
const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum

const inStoreOneItemReturn = '{"customerOrderNumber":"20230201048891040949","chain":"Store","originalSaleInfo":{"register":"104","transactionNumber":949,"transactionDate":"2023-02-01T00:00:00","storeNumber":"04889","storeName":"NON-PROD STORE","tenders":[{"tenderType":"Mastercard","adyenMerchantReferenceNumber":"20230201048891040949","adyenPspNumber":"adyenPSP"}]},"orderUnits":[{"sku":"19522728","description":"Brooks Womens Addiction 13 Running Shoes","upc":"190340371394","state":"fulfilled","returnEligibility":["ELIGIBLE"],"style":"1202532A070","returnPrice":129.99,"taxInfo":{"returnTax":0.0,"vertexProductTaxId":"61375","vertexPhysicalOriginId":"390030000","vertexDestinationId":"390030000","vertexAdminOriginId":"390030000","vertexAdminDestinationId":"390030000"},"lineNumber":1,"sequenceNumber":0,"release":1,"fulfillmentDetails":{"distributionOrderNumber":"20230201048891040949","fulfillmentLocationId":"4889","fulfillmentDate":"2023-02-01T21:04:21"}}],"returnOriginationType":0,"returnOriginationTypeDescription":"Receipted"}'
const addReturnItemsInCart = '{"header":{"timestamp":1675363828347,"signature":"LbGMjUP4EgrlPspOdPVwpgVk2s+flOMS35HDoKCoOfg=","transactionKey":"20230202008793010124","tenderIdentifier":"1-20230202008793010124","eReceiptKey":"5008793010124020223044","storeNumber":879,"registerNumber":301,"transactionNumber":124,"startDateTime":"2023-02-02T18:49:12.604985Z","transactionDate":"2023-02-02T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"storeNumber":4889,"registerNumber":104,"transactionNumber":949,"customerOrderNumber":"20230201048891040949","transactionDate":"2023-02-01T00:00:00+00:00","returnOriginationType":0,"returnOriginationTypeDescription":"Receipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"20230201048891040949","upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Womens Addiction 13 Running Shoes","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","returnPrice":-129.99,"damaged":false,"totalItemTax":0.0}],"originalTenders":[{"tenderType":"Mastercard"}]}],"items":[],"tenders":[],"coupons":[{"couponCode":"P00043608","description":"$20 off $100","couponState":2,"couponStateDescription":"Applied","couponPromotionStatus":2,"couponPromotionStatusDescription":"ExpiredPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":-129.99,"tax":0.0,"grandTotal":-129.99,"changeDue":0.0,"remainingBalance":-129.99},"isTaxExempt":false}'
const addItemsInCart = '{"header":{"timestamp":1673837399446,"signature":"GolYIKqe0LoWZ+0vh88kNogIcheZazrGBnpPlZA5a9w=","transactionKey":"20230115008793010090","tenderIdentifier":"1-20230115008793010090","eReceiptKey":"5008793010090011623042","storeNumber":879,"registerNumber":301,"transactionNumber":90,"startDateTime":"2023-01-16T02:49:26.710429Z","transactionDate":"2023-01-15T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[],"tenders":[],"coupons":[{"couponCode":"P00043608","description":"$20 off $100","couponState":1,"couponStateDescription":"NotApplied","couponPromotionStatus":2,"couponPromotionStatusDescription":"ExpiredPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":-50.1,"tax":0.0,"grandTotal":-50.1,"changeDue":0.0,"remainingBalance":-50.1},"isTaxExempt":false}'

context('Return in transaction initiated by entering coupon', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch', {body: couponFromInitialScanPageResp}).as('couponCodeResponse')
        tags.omniScan().type(coupon + '{enter}')
        cy.wait('@couponCodeResponse')
        cy.intercept('**/Coupon', {body : couponAddedInTrnCardRes}).as('couponAdded')
        tags.couponOverrideButton().click()
        cy.wait('@couponAdded')
        tags.couponIcon().should('have.text', 'Coupon Accepted')
        tags.returnsFooterButton().should('be.visible')
            .click()
    })
    it('Test 1: Validate return under footer menu is enabled, clickable & No Receipt Return button is available on return item modal',()=>{
        tags.noReceiptReturnLink().should('be.visible')
        tags.returnModalCloseButton().click()
        tags.complete().should('have.css','background-color', 'rgba(216, 216, 216, 0.85)') //disabled
    })
    it('Test 2: Return footer menu will be disabled once return item is added', () => {
        cy.performNoReceiptReturn('Null', 'No') //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')  //enabled
    })
    it('Test 3: Validate no receipt items can be scanned & added, turn return button disabled',()=>{
        cy.performNoReceiptReturn('true','No') //steps to add no receipt return items by scanning on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
        tags.priceItem1().should('be.visible')
        tags.priceItem2().should('be.visible')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
    })
    it('Test 4: Validate return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().click()
        cy.lookupReturn(inStoreOneItemReturn, inStoreReturnReceiptNum, 'true' )
        tags.returnItem1().should('be.visible').click()
        cy.addReturnItems(addReturnItemsInCart)
        tags.priceItem1().should('have.text', '-129.99')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
    })
})
context('Return in transaction initiated by scanning coupon', () => {
    
    beforeEach(() => {
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch', {body: couponFromInitialScanPageResp}).as('couponCodeResponse')
        cy.window().then((w) => {
            w.scanEvent(Cypress.env().coupon20off100)
          })
        cy.wait('@couponCodeResponse')
        cy.intercept('**/Coupon', {body : couponAddedInTrnCardRes}).as('couponAdded')
        tags.couponOverrideButton().click()
        cy.wait('@couponAdded')
        tags.couponIcon().should('have.text', 'Coupon Accepted')
        tags.returnsFooterButton().should('be.visible').click()
    })
    it('Test 5: Validate return under footer menu is enabled, clickable & No Receipt Return button is available on return item modal',()=>{
        tags.noReceiptReturnLink().should('be.visible')
        tags.returnModalCloseButton().should('be.visible')
            .click({force: true})
        tags.complete().should('have.css','background-color', 'rgba(216, 216, 216, 0.85)')
    })
    it('Test 6: Validate return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().should('be.visible')
            .click({force: true})
        cy.lookupReturn(inStoreOneItemReturn, inStoreReturnReceiptNum, 'true' )
        tags.returnItem1().click()
        cy.addReturnItems(addReturnItemsInCart)
        tags.priceItem1().should('have.text', '-129.99')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
    })
})

