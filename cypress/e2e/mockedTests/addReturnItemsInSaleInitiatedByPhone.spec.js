/// <reference types="cypress" />
import elements from '../../support/pageElements'

const tags = new elements()
const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum

const addItemsInCart = '{"header":{"timestamp":1674444104107,"signature":"YayBAmlPqMksde4yxwDzgC6i70ZI/yvcbeJATk4XiIA=","transactionKey":"20230122008793010097","tenderIdentifier":"1-20230122008793010097","eReceiptKey":"5008793010097012323048","storeNumber":879,"registerNumber":301,"transactionNumber":97,"startDateTime":"2023-01-23T02:46:55.661359Z","transactionDate":"2023-01-22T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"200000030018"},"total":{"subTotal":-50.1,"tax":0.0,"grandTotal":-50.1,"changeDue":0.0,"remainingBalance":-50.1},"isTaxExempt":false}'
const addItems = '{"type":"Transaction","transaction":{"header":{"timestamp":1674852734861,"signature":"0yKq26ph2K91YYV/6vSMH+H9aNFHajPDR3gZ6hvG+Hk=","transactionKey":"20230127008793010101","tenderIdentifier":"1-20230127008793010101","eReceiptKey":"5008793010101012723040","storeNumber":879,"registerNumber":301,"transactionNumber":101,"startDateTime":"2023-01-27T20:52:07.10584Z","transactionDate":"2023-01-27T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":79.89,"tax":0.0,"grandTotal":79.89,"changeDue":0.0,"remainingBalance":79.89},"isTaxExempt":false},"upc":"190340371394"}'
const addReturnByBarcode = '{"header":{"timestamp":1675314106886,"signature":"xylnVB/Bdxe1nxiSVcfWEymUXJ23Gn6zUZ0YmbsGjFA=","transactionKey":"20230201008793010121","tenderIdentifier":"1-20230201008793010121","eReceiptKey":"5008793010121020223044","storeNumber":879,"registerNumber":301,"transactionNumber":121,"startDateTime":"2023-02-02T05:00:04.253393Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"storeNumber":4889,"registerNumber":104,"transactionNumber":949,"customerOrderNumber":"20230201048891040949","transactionDate":"2023-02-01T00:00:00+00:00","returnOriginationType":0,"returnOriginationTypeDescription":"Receipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"20230201048891040949","upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Womens Addiction 13 Running Shoes","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","returnPrice":-129.99,"damaged":false,"totalItemTax":0.0}],"originalTenders":[{"tenderType":"Mastercard"}]}],"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"200000030018"},"total":{"subTotal":-129.99,"tax":0.0,"grandTotal":-129.99,"changeDue":0.0,"remainingBalance":-129.99},"isTaxExempt":false}'
const loyaltyAccountLookup = '[{"id":15,"firstName":"Abraham","lastName":"Lincoln","emailAddress":"test@tester.com","street":"1600 Pennsylvania Ave NW","apartment":"","city":"Washington","state":"DC","zip":"20500","homePhone":"7241234321","loyalty":"200000030018","subAccount":"20000003","currentPointBalance":0.0,"rewardAmount":0.0}]'
const loyaltyLevelDetails = '{"rewards":[{"rewardCertificateNumber":"R8888872520000003","onlineCertificateNumber":"RWD5BCVUYSE","status":1,"statusDescription":"Available","rewardType":0,"rewardTypeDescription":"RewardCertificate","rewardAmount":10.00,"expirationDate":"2025-12-31T23:59:59","graceExpirationDate":"2026-03-31T23:59:59","activeDate":"2023-01-19T00:00:00"},{"rewardCertificateNumber":"R8888879820000003","onlineCertificateNumber":"RWD2SD7WWUD","status":1,"statusDescription":"Available","rewardType":0,"rewardTypeDescription":"RewardCertificate","rewardAmount":10.00,"expirationDate":"2025-12-31T23:59:59","graceExpirationDate":"2026-03-31T23:59:59","activeDate":"2022-12-22T00:00:00"},{"rewardCertificateNumber":"R8888888820000003","onlineCertificateNumber":"RWDPUB8N6UX","status":1,"statusDescription":"Available","rewardType":0,"rewardTypeDescription":"RewardCertificate","rewardAmount":10.00,"expirationDate":"2025-12-31T23:59:59","graceExpirationDate":"2026-03-31T23:59:59","activeDate":"2022-12-01T00:00:00"}],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":107.0,"rewardAmount":0.00,"pointsToNextReward":193.0,"currentRewardTier":0.0,"nextRewardTier":10.0},"partyAttributes":{"attributes":{}}}'
const returnLookup = '{"customerOrderNumber":"20230201048891040949","chain":"Store","originalSaleInfo":{"register":"104","transactionNumber":949,"transactionDate":"2023-02-01T00:00:00","storeNumber":"04889","storeName":"NON-PROD STORE","tenders":[{"tenderType":"Mastercard","adyenMerchantReferenceNumber":"20230201048891040949","adyenPspNumber":"adyenPSP"}]},"orderUnits":[{"sku":"19522728","description":"Brooks Womens Addiction 13 Running Shoes","upc":"190340371394","state":"fulfilled","returnEligibility":["ELIGIBLE"],"style":"1202532A070","returnPrice":129.99,"taxInfo":{"returnTax":0.0,"vertexProductTaxId":"61375","vertexPhysicalOriginId":"390030000","vertexDestinationId":"390030000","vertexAdminOriginId":"390030000","vertexAdminDestinationId":"390030000"},"lineNumber":1,"sequenceNumber":0,"release":1,"fulfillmentDetails":{"distributionOrderNumber":"20230201048891040949","fulfillmentLocationId":"4889","fulfillmentDate":"2023-02-01T21:04:21"}}],"returnOriginationType":0,"returnOriginationTypeDescription":"Receipted"}'

context('Add return items in sale where sale initiated by loyalty phone number', ()=>{
    
    beforeEach(()=>{
        cy.saleInitiatedByPhone('single')
        tags.returnsFooterButton().should('be.visible').click()
    })
    it('Test 1 : no receipt return in sale initiated by loyalty phone number', ()=>{
        tags.noReceiptReturnLink().should('be.visible')
        tags.returnModalCloseButton().click()
        tags.complete().should('have.css','background-color', 'rgba(216, 216, 216, 0.85)') //disabled
    })
    it('Test 2: Validate return under footer menu is enabled, clickable & No Receipt Return button is available on return item modal',()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')  //enabled
    })
    it('Test 3: Return footer menu will be disabled once return item is added', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
    })
    it('Test 4: Validate return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().click().focused()
        cy.lookupReturn(returnLookup, inStoreReturnReceiptNum, 'true' )
        tags.returnItem1().should('be.visible').click()
        cy.intercept('**/Returns/AddReturnItems', { body: addReturnByBarcode }).as('addReturnItems')
        cy.intercept('**/Loyalty/account/**', {body: loyaltyAccountLookup}).as('resp1')
        cy.intercept('**/Loyalty/AccountLevelDetails/**', {body: loyaltyLevelDetails}).as('resp2')
        tags.confirmReturnsButton().click()
        cy.wait(['@addReturnItems', '@resp1', '@resp2'])
        tags.priceItem1().should('have.text', '-129.99')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
    })
    it('Test 5: Validate no receipt items can be scanned & added in the transaction',()=>{
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
})
context('Add return items in sale where sale initiated by loyalty phone number having multiple accounts', ()=>{

    beforeEach(()=>{
        cy.saleInitiatedByPhone()
        tags.returnsFooterButton().should('be.visible').click()
    })
    it('Test 6: Validate no receipt items can be scanned & added transaction',()=>{
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
    it('Test 7: Validate an item can be added after adding no receipt items via scanning',()=>{
        cy.performNoReceiptReturn('true','No') //steps to add no receipt return items by scanning on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
        tags.omniScan().should('be.visible').click()
        cy.intercept('**/OmniSearch', {body: addItems}).as('item1')
        cy.window().then((w) => {
            w.scanEvent(Cypress.env().runningShoesUPC)
        })
        cy.wait('@item1')
        tags.couponsAndDiscounts().should('be.visible')
        tags.subtotal().should('be.visible')
        tags.taxes().should('be.visible')
        tags.total().should('be.visible')
        tags.complete().should('be.visible')
    })
})