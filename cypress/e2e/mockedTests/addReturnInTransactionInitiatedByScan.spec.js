/// <reference types="cypress" />

import elements from '../../support/pageElements'

const tags = new elements()
const shoesUPC = Cypress.env().runningShoesUPC
const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum

const inStoreOneItemReturn = '{"customerOrderNumber":"20230117048891040710","chain":"Store","originalSaleInfo":{"register":"104","transactionNumber":710,"transactionDate":"2023-01-17T00:00:00","storeNumber":"04889","storeName":"NON-PROD STORE","tenders":[{"tenderType":"Cash","adyenMerchantReferenceNumber":"20230117048891040710","adyenPspNumber":"adyenPSP"}]},"orderUnits":[{"sku":"19522728","description":"Brooks Womens Addiction 13 Running Shoes","upc":"190340371394","state":"fulfilled","returnEligibility":["ELIGIBLE"],"style":"1202532A070","returnPrice":129.99,"taxInfo":{"returnTax":0.0,"vertexProductTaxId":"61375","vertexPhysicalOriginId":"390030000","vertexDestinationId":"390030000","vertexAdminOriginId":"390030000","vertexAdminDestinationId":"390030000"},"lineNumber":1,"sequenceNumber":0,"release":1,"fulfillmentDetails":{"distributionOrderNumber":"20230117048891040710","fulfillmentLocationId":"4889","fulfillmentDate":"2023-01-17T15:14:50"}}],"returnOriginationType":0,"returnOriginationTypeDescription":"Receipted"}'
const addReturnItemsInCart = '{"header":{"timestamp":1674185972551,"signature":"qnv+ZTRFWiTVXU2wxpQtahKLWlN4dTYpN2RoqGafRWo=","transactionKey":"20230119008793010092","tenderIdentifier":"1-20230119008793010092","eReceiptKey":"5008793010092012023044","storeNumber":879,"registerNumber":301,"transactionNumber":92,"startDateTime":"2023-01-20T03:37:14.316675Z","transactionDate":"2023-01-19T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"storeNumber":4889,"registerNumber":104,"transactionNumber":710,"customerOrderNumber":"20230117048891040710","transactionDate":"2023-01-17T00:00:00+00:00","returnOriginationType":0,"returnOriginationTypeDescription":"Receipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"20230117048891040710","upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Womens Addiction 13 Running Shoes","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","returnPrice":-129.99,"damaged":false,"totalItemTax":0.0}],"originalTenders":[{"tenderType":"Cash"}]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}'
const addItemFromInitialScanPageResp = '{"type":"Transaction","transaction":{"header":{"timestamp":1674184440461,"signature":"2Wx+wCqS4AgmskMSEc6yozq8QBNfNrU0Q4JqmOabE0Q=","transactionKey":"20230119008793010091","tenderIdentifier":"1-20230119008793010091","eReceiptKey":"5008793010091012023017","storeNumber":879,"registerNumber":301,"transactionNumber":91,"startDateTime":"2023-01-20T03:14:00.268366Z","transactionDate":"2023-01-19T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":129.99,"tax":0.0,"grandTotal":129.99,"changeDue":0.0,"remainingBalance":129.99},"isTaxExempt":false},"upc":"190340371394"}'
const addItemsInCart = '{"header":{"timestamp":1674184584644,"signature":"ASb/uxQWI+ErZfsxvBu6kUDBsulF+hl7hmzr7M+icWw=","transactionKey":"20230119008793010091","tenderIdentifier":"1-20230119008793010091","eReceiptKey":"5008793010091012023047","storeNumber":879,"registerNumber":301,"transactionNumber":91,"startDateTime":"2023-01-20T03:14:00.268366Z","transactionDate":"2023-01-19T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":79.89,"tax":0.0,"grandTotal":79.89,"changeDue":0.0,"remainingBalance":79.89},"isTaxExempt":false}'

context('Return in transaction initiated by scanning UPC', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch', {body: addItemFromInitialScanPageResp } ).as('item1')
        cy.window().then((w) => {
            w.scanEvent(shoesUPC)
        })
        cy.wait('@item1')
        tags.priceItem1().should('be.visible')
        tags.returnsFooterButton().should('be.visible').click()
    })

    it('Test 1: Validate return under footer menu is enabled, clickable & No Receipt Return button is available on return item modal',()=>{
       tags.noReceiptReturnLink().should('be.visible').click()
       tags.returnModalCloseButton().click()
    })
    it('Test 2: Return footer menu will be disabled once return item is added', () => {
        cy.performNoReceiptReturn('Null', 'No') //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
    })
    it('Test 3: Validate if cashier can scan items into no-receipt return modal ', ()=>{
        cy.performNoReceiptReturn('true','No') //steps to add no receipt return items by scanning on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
    })
    it('Test 4: Validate return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().click().focused()
        cy.lookupReturn(inStoreOneItemReturn, inStoreReturnReceiptNum, 'true' )
        tags.returnItem1().click()
        cy.addReturnItems(addReturnItemsInCart)
        tags.priceItem1().should('have.text', '-129.99')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
    })
})
