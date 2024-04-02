/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Add return items in sale where sale initiated by Scorecard',()=>{

    const tags = new elements()
    const DonPLoyaltyAcct = Cypress.env().loyaltyBarCodeDonP
    const shoesUPC = Cypress.env().runningShoesUPC
    const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum
    const tumblerUPC = Cypress.env().yetiTumblerUPC
    const gloveUPC = Cypress.env().baseballGloveUPC

    const scorecardScan = '{"type":"LoyaltyAccounts","loyalty":[{"id":26100200,"firstName":"DON","lastName":"PIC","emailAddress":"dp12345@dcsg.com","street":"123 Test Street","apartment":"","city":"New Castle","state":"PA","zip":"16102","homePhone":"7246140016","loyalty":"L01XB23YCLJ1","subAccount":"B23YCLJ1","currentPointBalance":0.0,"rewardAmount":0.0}],"transaction":{"header":{"timestamp":1675281721541,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","transactionDate":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}}'
    const customerLookup = '{"header":{"timestamp":1675281722659,"signature":"SHOHd2G4UG8Zn8nHbJfCHmANUo0hSiYCFDlqFfXxj6s=","transactionKey":"20230201008793010106","tenderIdentifier":"1-20230201008793010106","eReceiptKey":"5008793010106020123013","storeNumber":879,"registerNumber":301,"transactionNumber":106,"startDateTime":"2023-02-01T20:02:02.6364363Z","transactionDate":"2023-02-01T00:00:00Z","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}'
    const accountLevelDetails = '{"rewards":[],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":0.0,"rewardAmount":0.00,"pointsToNextReward":300.0,"currentRewardTier":0.0,"nextRewardTier":10.0},"partyAttributes":{"attributes":{}}}'
    const addItemsInCart = '{"header":{"timestamp":1675283565151,"signature":"efBgPcVr4e2GAc+GN0yoWJMgvPrZK3gidvZgm0SpWBg=","transactionKey":"20230201008793010108","tenderIdentifier":"1-20230201008793010108","eReceiptKey":"5008793010108020123046","storeNumber":879,"registerNumber":301,"transactionNumber":108,"startDateTime":"2023-02-01T20:32:10.434686Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":-50.1,"tax":0.0,"grandTotal":-50.1,"changeDue":0.0,"remainingBalance":-50.1},"isTaxExempt":false}'
    const addReturnByBarcode = '{"header":{"timestamp":1675293360361,"signature":"hyeZ+UIxM/DagwAo4VmOXGTO+gODB596rltg0xDge7s=","transactionKey":"20230201008793010112","tenderIdentifier":"1-20230201008793010112","eReceiptKey":"5008793010112020123045","storeNumber":879,"registerNumber":301,"transactionNumber":112,"startDateTime":"2023-02-01T23:11:03.063656Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"storeNumber":4889,"registerNumber":104,"transactionNumber":949,"customerOrderNumber":"20230201048891040949","transactionDate":"2023-02-01T00:00:00+00:00","returnOriginationType":0,"returnOriginationTypeDescription":"Receipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"20230201048891040949","upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Womens Addiction 13 Running Shoes","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","returnPrice":-129.99,"damaged":false,"totalItemTax":0.0}],"originalTenders":[{"tenderType":"Mastercard"}]}],"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":-129.99,"tax":0.0,"grandTotal":-129.99,"changeDue":0.0,"remainingBalance":-129.99},"isTaxExempt":false}'
    const loyaltyAccountLookup = '[{"id":26100200,"firstName":"DON","lastName":"PIC","emailAddress":"dp12345@dcsg.com","street":"123 Test Street","apartment":"","city":"New Castle","state":"PA","zip":"16102","homePhone":"7246140016","loyalty":"L01XB23YCLJ1","subAccount":"B23YCLJ1","currentPointBalance":0.0,"rewardAmount":0.0}]'
    const loyaltyLevelDetails = '{"rewards":[],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":0.0,"rewardAmount":0.00,"pointsToNextReward":300.0,"currentRewardTier":0.0,"nextRewardTier":10.0},"partyAttributes":{"attributes":{}}}'
    const returnLookup = '{"customerOrderNumber":"20230201048891040949","chain":"Store","originalSaleInfo":{"register":"104","transactionNumber":949,"transactionDate":"2023-02-01T00:00:00","storeNumber":"04889","storeName":"NON-PROD STORE","tenders":[{"tenderType":"Mastercard","adyenMerchantReferenceNumber":"20230201048891040949","adyenPspNumber":"adyenPSP"}]},"orderUnits":[{"sku":"19522728","description":"Brooks Womens Addiction 13 Running Shoes","upc":"190340371394","state":"fulfilled","returnEligibility":["ELIGIBLE"],"style":"1202532A070","returnPrice":129.99,"taxInfo":{"returnTax":0.0,"vertexProductTaxId":"61375","vertexPhysicalOriginId":"390030000","vertexDestinationId":"390030000","vertexAdminOriginId":"390030000","vertexAdminDestinationId":"390030000"},"lineNumber":1,"sequenceNumber":0,"release":1,"fulfillmentDetails":{"distributionOrderNumber":"20230201048891040949","fulfillmentLocationId":"4889","fulfillmentDate":"2023-02-01T21:04:21"}}],"returnOriginationType":0,"returnOriginationTypeDescription":"Receipted"}'
    const addItemAfterReturn = '{"type":"Transaction","transaction":{"header":{"timestamp":1675301799587,"signature":"qA7LDiQjM7oQeafM4r806WLb3bEozR0uMVYDAUna5T0=","transactionKey":"20230201008793010114","tenderIdentifier":"1-20230201008793010114","eReceiptKey":"5008793010114020223045","storeNumber":879,"registerNumber":301,"transactionNumber":114,"startDateTime":"2023-02-02T01:35:54.88005Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"storeNumber":4889,"registerNumber":104,"transactionNumber":949,"customerOrderNumber":"20230201048891040949","transactionDate":"2023-02-01T00:00:00+00:00","returnOriginationType":0,"returnOriginationTypeDescription":"Receipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"20230201048891040949","upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Womens Addiction 13 Running Shoes","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","returnPrice":-129.99,"damaged":false,"totalItemTax":0.0}],"originalTenders":[{"tenderType":"Mastercard"}]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[{"promoCode":"34021358","type":1,"typeDescription":"SeperateReceipt","priority":300,"messageText":"\\r\\r\\r\\r------------------------------------\\r------------------------------------\\r------------------------------------\\r\\r\\r\\r~|cA\\r~|cA~|bCTAKE $10 OFF YOUR NEXT PURCHASE \\r~|cA~|bCOF $50 OR MORE OR\\r~|cA~|bC$25 OFF YOUR NEXT PURCHASE OF \\r~|cA~|bC$100 OR MORE\\r\\r~|cA*Limit one coupon per customer. \\r~|cAExcludes: taxes, prior purchases, \\r~|cAgift cards, extended warranties, \\r~|cAsuch as the No Sweat Protection Plan, \\r~|cAlicenses, store credit, services or \\r~|cAexcluded items detailed in-store \\r~|cAor at DICKS.com/Exclusions. Cannot \\r~|cAbe combined with other offers.  \\r~|cANo reproductions or rain checks \\r~|cAaccepted.\\r~|cA\\r~|cAValid on in-store purchases \\r~|cA~|bC~|bConly ~|bC03/20/23 - 04/03/23. \\r~|cAValid at our ~|bCGateway Hanover\\r~|cA~|bClocation only.\\r~|cA\\r~|cA\\r\\r        \\r~|24Rs110h300w2000dP00049238e\\r\\r\\r\\rP00049238\\r\\r\\r"}],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false},"upc":"190340371394"}'
    const itemAddedAfterNoReceiptReturn = '{"type":"Transaction","transaction":{"header":{"timestamp":1675302219306,"signature":"BBHx38BcilCXvpgMsiMeo6aANvkvGjfpQSDtmN7MR+s=","transactionKey":"20230201008793010115","tenderIdentifier":"1-20230201008793010115","eReceiptKey":"5008793010115020223042","storeNumber":879,"registerNumber":301,"transactionNumber":115,"startDateTime":"2023-02-02T01:42:51.551483Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[{"promoCode":"34021358","type":1,"typeDescription":"SeperateReceipt","priority":300,"messageText":"\\r\\r\\r\\r------------------------------------\\r------------------------------------\\r------------------------------------\\r\\r\\r\\r~|cA\\r~|cA~|bCTAKE $10 OFF YOUR NEXT PURCHASE \\r~|cA~|bCOF $50 OR MORE OR\\r~|cA~|bC$25 OFF YOUR NEXT PURCHASE OF \\r~|cA~|bC$100 OR MORE\\r\\r~|cA*Limit one coupon per customer. \\r~|cAExcludes: taxes, prior purchases, \\r~|cAgift cards, extended warranties, \\r~|cAsuch as the No Sweat Protection Plan, \\r~|cAlicenses, store credit, services or \\r~|cAexcluded items detailed in-store \\r~|cAor at DICKS.com/Exclusions. Cannot \\r~|cAbe combined with other offers.  \\r~|cANo reproductions or rain checks \\r~|cAaccepted.\\r~|cA\\r~|cAValid on in-store purchases \\r~|cA~|bC~|bConly ~|bC03/20/23 - 04/03/23. \\r~|cAValid at our ~|bCGateway Hanover\\r~|cA~|bClocation only.\\r~|cA\\r~|cA\\r\\r        \\r~|24Rs110h300w2000dP00049238e\\r\\r\\r\\rP00049238\\r\\r\\r"}],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":79.89,"tax":0.0,"grandTotal":79.89,"changeDue":0.0,"remainingBalance":79.89},"isTaxExempt":false},"upc":"190340371394"}'
    
    beforeEach(()=>{
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch', {body: scorecardScan}).as('scoreCardResp')
        cy.intercept('**/Transaction/Customer/**', {body: customerLookup}).as('scoreResponse')
        cy.intercept('**/AccountLevelDetails/**', {body: accountLevelDetails}).as('scoreCardAccount')
        tags.omniScan().type(DonPLoyaltyAcct + '{enter}')
        cy.wait[('@scoreCardResp, @scoreResponse','@scoreCardAccount')]
        tags.loyaltySelectedAthlete().should('be.visible')
            .should('have.text', 'DON PIC')
        tags.complete().should('have.css','background-color', 'rgba(216, 216, 216, 0.85)')
        tags.giftCardFooterButton().should('be.visible')
        tags.productLookupFooterButton().should('be.visible')
        tags.returnsFooterButton().should('be.visible')
            .click({ force: true })
    })
    it('Test 1: Validate return under footer menu is enabled, clickable & No Receipt Return button is available on return item modal',()=>{
        tags.noReceiptReturnLink().should('be.visible')
        tags.returnModalCloseButton().click()
        tags.complete().should('be.visible')
    })
    it('Test 2: No Barcode Available link should exist in Receipt Return Modal', ()=>{
        tags.noReceiptReturnLink().click()
        tags.noReceiptReturnModalHeader().should('be.visible')
        tags.noReceiptReturnsDisclaimer().should('be.visible')
        tags.barcodeNotAvailableLink().should('be.visible')
        tags.returnModalCloseButton().click()
        tags.complete().should('have.css','background-color', 'rgba(216, 216, 216, 0.85)') //disabled
    })
    it('Test 3: There should be a manual entry field in the no-receipt return modal', () => {
        tags.noReceiptReturnLink().click()
        tags.barcodeNotAvailableLink().click()
        tags.noReceiptReturnModalHeader().should('be.visible')
        tags.noReceiptReturnsDisclaimer().should('be.visible')
        tags.noReceiptManualInputField().should('be.visible')
        tags.returnModalCloseButton().click()
    })
    it('Test 4: Adding no receipt return items in the transaction',()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)') 
    })
    it('Test 5: Validate return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().click()
            .focused()
        cy.lookupReturn(returnLookup, inStoreReturnReceiptNum, 'true' )
        tags.returnItem1().should('be.visible')
            .click()
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
    })
    it('Test 6: Validate if transaction can be voided after scannng items into no-receipt return modal ', ()=>{
        tags.noReceiptReturnLink().should('be.visible')
            .click()
        tags.barcodeNotAvailableLink().click()
        cy.noReceiptReturnAddItem(tumblerUPC, 'true')
        cy.noReceiptReturnAddItem(gloveUPC, 'true')
        tags.loyaltyReturnLookupCloseButton().click()
    })
    it('Test 7: Validate if cashier can add items in the transaction by scanning items into no-receipt return modal ', ()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
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
    it('Test 8: Validate return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().click()
            .focused()
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
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
    })
    it('Test 9: Validate an item can be added after return item added by scanning receipt barcode.', () => {
        tags.returnGenericNumberEntryField().click()
            .focused()
        cy.lookupReturn(returnLookup, inStoreReturnReceiptNum, 'true' )
        tags.returnItem1().should('be.visible')
            .click()
        cy.intercept('**/Returns/AddReturnItems', { body: addReturnByBarcode }).as('addReturnItems')
        cy.intercept('**/Loyalty/account/**', {body: loyaltyAccountLookup}).as('resp1')
        cy.intercept('**/Loyalty/AccountLevelDetails/**', {body: loyaltyLevelDetails}).as('resp2')
        tags.confirmReturnsButton().click()
        cy.wait(['@addReturnItems', '@resp1', '@resp2'])
        tags.priceItem1().should('have.text', '-129.99')
        tags.omniScan().should('be.visible')
            .click()
        cy.intercept('**/OmniSearch', {body: addItemAfterReturn}).as('item1')
        cy.window().then((w) => {
            w.scanEvent(shoesUPC)
        })
        cy.wait('@item1')
        tags.priceItem2().should('be.visible')
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
    })
    it('Test 10: Validate an item can be added by scanning after no recipt return added ', ()=>{
        cy.performNoReceiptReturn('true','No') //steps to add no receipt return items by scanning on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
        tags.priceItem1().should('be.visible')
        tags.priceItem2().should('be.visible')
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)')
        tags.omniScan().should('be.visible')
            .click()
        cy.intercept('**/OmniSearch', {body: itemAddedAfterNoReceiptReturn}).as('item1')
        cy.window().then((w) => {
            w.scanEvent(shoesUPC)
        })
        cy.wait('@item1')
        tags.priceItem3().should('be.visible')
        tags.complete().should('be.visible')
    })
})