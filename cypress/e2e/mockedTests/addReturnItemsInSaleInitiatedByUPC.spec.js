/// <reference types="cypress" />
import elements from '../../support/pageElements'
import returnItemsWithDeletedItemResponse from '../../fixtures/return/inStoreReturns/returnItemsWithDeletedItem.json'
import returnItemsWitPriceOverrideResponse from '../../fixtures/return/inStoreReturns/returnItemsWithPriceOverride.json'

context('Add return items in sale where sale initiated by entering item UPC', () => {

    const tags = new elements()
    const shoesUPC = Cypress.env().runningShoesUPC
    const yetiUPC = Cypress.env().yetiTumblerUPC
    const gloveUPC = Cypress.env().baseballGloveUPC
    const gloveDescription = Cypress.env().baseballGloveDescription
    const inStoreReturnReceiptNum = Cypress.env().inStoreReturnReceiptNum
    const tumblerDescription = Cypress.env().yetiTumblerDescription
    const tumblerUPC = Cypress.env().yetiTumblerUPC
    const returnNoItemEligible = Cypress.env().inStoreReturnNoItemEligible

    const addReturnItemsInCart = '{"header":{"timestamp":1675312788425,"signature":"16ZRCg8ayvj7ZraHSPDhy5JEhQNvv2WHNFFi2SrHhCM=","transactionKey":"20230201008793010120","tenderIdentifier":"1-20230201008793010120","eReceiptKey":"5008793010120020223047","storeNumber":879,"registerNumber":301,"transactionNumber":120,"startDateTime":"2023-02-02T04:38:02.052723Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"storeNumber":4889,"registerNumber":104,"transactionNumber":949,"customerOrderNumber":"20230201048891040949","transactionDate":"2023-02-01T00:00:00+00:00","returnOriginationType":0,"returnOriginationTypeDescription":"Receipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":1,"sequenceNumber":0,"distributionOrderNumber":"20230201048891040949","upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Womens Addiction 13 Running Shoes","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","returnPrice":-129.99,"damaged":false,"totalItemTax":0.0}],"originalTenders":[{"tenderType":"Mastercard"}]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[{"promoCode":"34021358","type":1,"typeDescription":"SeperateReceipt","priority":300,"messageText":"\\r\\r\\r\\r------------------------------------\\r------------------------------------\\r------------------------------------\\r\\r\\r\\r~|cA\\r~|cA~|bCTAKE $10 OFF YOUR NEXT PURCHASE \\r~|cA~|bCOF $50 OR MORE OR\\r~|cA~|bC$25 OFF YOUR NEXT PURCHASE OF \\r~|cA~|bC$100 OR MORE\\r\\r~|cA*Limit one coupon per customer. \\r~|cAExcludes: taxes, prior purchases, \\r~|cAgift cards, extended warranties, \\r~|cAsuch as the No Sweat Protection Plan, \\r~|cAlicenses, store credit, services or \\r~|cAexcluded items detailed in-store \\r~|cAor at DICKS.com/Exclusions. Cannot \\r~|cAbe combined with other offers.  \\r~|cANo reproductions or rain checks \\r~|cAaccepted.\\r~|cA\\r~|cAValid on in-store purchases \\r~|cA~|bC~|bConly ~|bC03/20/23 - 04/03/23. \\r~|cAValid at our ~|bCGateway Hanover\\r~|cA~|bClocation only.\\r~|cA\\r~|cA\\r\\r        \\r~|24Rs110h300w2000dP00049238e\\r\\r\\r\\rP00049238\\r\\r\\r"}],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}'
    const eligibleReturnLookup = '{"customerOrderNumber":"20230201048891040949","chain":"Store","originalSaleInfo":{"register":"104","transactionNumber":949,"transactionDate":"2023-02-01T00:00:00","storeNumber":"04889","storeName":"NON-PROD STORE","tenders":[{"tenderType":"Mastercard","adyenMerchantReferenceNumber":"20230201048891040949","adyenPspNumber":"adyenPSP"}]},"orderUnits":[{"sku":"19522728","description":"Brooks Womens Addiction 13 Running Shoes","upc":"190340371394","state":"fulfilled","returnEligibility":["ELIGIBLE"],"style":"1202532A070","returnPrice":129.99,"taxInfo":{"returnTax":0.0,"vertexProductTaxId":"61375","vertexPhysicalOriginId":"390030000","vertexDestinationId":"390030000","vertexAdminOriginId":"390030000","vertexAdminDestinationId":"390030000"},"lineNumber":1,"sequenceNumber":0,"release":1,"fulfillmentDetails":{"distributionOrderNumber":"20230201048891040949","fulfillmentLocationId":"4889","fulfillmentDate":"2023-02-01T21:04:21"}}],"returnOriginationType":0,"returnOriginationTypeDescription":"Receipted"}'
    const returnLookup = '{"customerOrderNumber":"20220311048891020673","chain":"Store","originalSaleInfo":{"register":"102","transactionNumber":673,"transactionDate":"2022-03-11T00:00:00","storeNumber":"04889","storeName":"NON-PROD STORE","tenders":[{"tenderType":"Cash","adyenMerchantReferenceNumber":"20220311048891020673","adyenPspNumber":"adyenPSP"}]},"orderUnits":[{"sku":"19522728","description":"Brooks Women?s Addiction 13 Running Shoes","upc":"190340371394","state":"returned","returnEligibility":["INELIGIBLE_STATUS","INELIGIBLE_TOO_OLD"],"style":"1202532A070","returnPrice":129.99,"taxInfo":{"returnTax":0.0,"vertexProductTaxId":"61375","vertexPhysicalOriginId":"390030000","vertexDestinationId":"390030000","vertexAdminOriginId":"390030000","vertexAdminDestinationId":"390030000"},"lineNumber":1,"sequenceNumber":0,"release":1,"fulfillmentDetails":{"distributionOrderNumber":"20220311048891020673","fulfillmentLocationId":"4889","fulfillmentDate":"2022-03-11T15:07:49"}}],"returnOriginationType":0,"returnOriginationTypeDescription":"Receipted"}'
    const addItemsInCart = '{"header":{"timestamp":1675306354972,"signature":"oEm3dA+5AKsd/76I2dZ76Ivy5wP9KfuRgA00urtFUYI=","transactionKey":"20230201008793010117","tenderIdentifier":"1-20230201008793010117","eReceiptKey":"5008793010117020223045","storeNumber":879,"registerNumber":301,"transactionNumber":117,"startDateTime":"2023-02-02T02:46:01.661225Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":4,"transactionTypeDescription":"Return","transactionStatus":1,"transactionStatusDescription":"Active"},"originalSaleInformation":[{"returnOriginationType":1,"returnOriginationTypeDescription":"NonReceipted","returnSource":2,"returnSourceDescription":"InStore","returnItems":[{"lineNumber":0,"sequenceNumber":0,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","returnPrice":-35.1,"damaged":false,"totalItemTax":0.0},{"lineNumber":1,"sequenceNumber":0,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","returnPrice":-15.0,"damaged":false,"totalItemTax":0.0}],"originalTenders":[]}],"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[{"promoCode":"34021358","type":1,"typeDescription":"SeperateReceipt","priority":300,"messageText":"\\r\\r\\r\\r------------------------------------\\r------------------------------------\\r------------------------------------\\r\\r\\r\\r~|cA\\r~|cA~|bCTAKE $10 OFF YOUR NEXT PURCHASE \\r~|cA~|bCOF $50 OR MORE OR\\r~|cA~|bC$25 OFF YOUR NEXT PURCHASE OF \\r~|cA~|bC$100 OR MORE\\r\\r~|cA*Limit one coupon per customer. \\r~|cAExcludes: taxes, prior purchases, \\r~|cAgift cards, extended warranties, \\r~|cAsuch as the No Sweat Protection Plan, \\r~|cAlicenses, store credit, services or \\r~|cAexcluded items detailed in-store \\r~|cAor at DICKS.com/Exclusions. Cannot \\r~|cAbe combined with other offers.  \\r~|cANo reproductions or rain checks \\r~|cAaccepted.\\r~|cA\\r~|cAValid on in-store purchases \\r~|cA~|bC~|bConly ~|bC03/20/23 - 04/03/23. \\r~|cAValid at our ~|bCGateway Hanover\\r~|cA~|bClocation only.\\r~|cA\\r~|cA\\r\\r        \\r~|24Rs110h300w2000dP00049238e\\r\\r\\r\\rP00049238\\r\\r\\r"}],"total":{"subTotal":79.89,"tax":0.0,"grandTotal":79.89,"changeDue":0.0,"remainingBalance":79.89},"isTaxExempt":false}'
    const itemAdded = '{"type":"Transaction","transaction":{"header":{"timestamp":1675305961838,"signature":"2u0vta8vjOFw5VALZmavUEh6+azRCbkM0YY8fL7i/+I=","transactionKey":"20230201008793010117","tenderIdentifier":"1-20230201008793010117","eReceiptKey":"5008793010117020223015","storeNumber":879,"registerNumber":301,"transactionNumber":117,"startDateTime":"2023-02-02T02:46:01.661225Z","transactionDate":"2023-02-01T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":129.99,"promptForPrice":false,"unitPrice":129.99,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":129.99,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[{"promoCode":"34021358","type":1,"typeDescription":"SeperateReceipt","priority":300,"messageText":"\\r\\r\\r\\r------------------------------------\\r------------------------------------\\r------------------------------------\\r\\r\\r\\r~|cA\\r~|cA~|bCTAKE $10 OFF YOUR NEXT PURCHASE \\r~|cA~|bCOF $50 OR MORE OR\\r~|cA~|bC$25 OFF YOUR NEXT PURCHASE OF \\r~|cA~|bC$100 OR MORE\\r\\r~|cA*Limit one coupon per customer. \\r~|cAExcludes: taxes, prior purchases, \\r~|cAgift cards, extended warranties, \\r~|cAsuch as the No Sweat Protection Plan, \\r~|cAlicenses, store credit, services or \\r~|cAexcluded items detailed in-store \\r~|cAor at DICKS.com/Exclusions. Cannot \\r~|cAbe combined with other offers.  \\r~|cANo reproductions or rain checks \\r~|cAaccepted.\\r~|cA\\r~|cAValid on in-store purchases \\r~|cA~|bC~|bConly ~|bC03/20/23 - 04/03/23. \\r~|cAValid at our ~|bCGateway Hanover\\r~|cA~|bClocation only.\\r~|cA\\r~|cA\\r\\r        \\r~|24Rs110h300w2000dP00049238e\\r\\r\\r\\rP00049238\\r\\r\\r"}],"total":{"subTotal":129.99,"tax":0.0,"grandTotal":129.99,"changeDue":0.0,"remainingBalance":129.99},"isTaxExempt":false},"upc":"190340371394"}'

    beforeEach(()=>{
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch', {body: itemAdded}).as('item1')
        tags.omniScan().type(shoesUPC + '{enter}')
        cy.wait('@item1')
        tags.omniScan().should('be.visible')
        tags.descriptionItem1().should('be.visible')
        tags.returnsFooterButton().should('be.visible')
            .click({ force: true })
    })
    it('Test 1: Validate return under footer menu is enabled, clickable & No Receipt Return button is available on return item modal',()=>{
        tags.noReceiptReturnLink().should('be.visible')
        tags.returnModalCloseButton().click()
    })
    it('Test 2: Return footer menu will be disabled once return item is added', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)      //adding no receipt items in the cart
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
    })
    it('Test 3: No Barcode Available link should exist in Receipt Return Modal', ()=>{
        tags.noReceiptReturnLink().click()
        tags.noReceiptReturnModalHeader().should('be.visible')
        tags.noReceiptReturnsDisclaimer().should('be.visible')
        tags.barcodeNotAvailableLink().should('be.visible')
        tags.returnModalCloseButton().click()
    })
    it('Test 4: There should be a manual entry field in the no-receipt return modal', () => {
        tags.noReceiptReturnLink().click()
        tags.barcodeNotAvailableLink().click()
        tags.noReceiptReturnModalHeader().should('be.visible')
        tags.noReceiptReturnsDisclaimer().should('be.visible')
        tags.noReceiptManualInputField().should('be.visible')
        tags.returnModalCloseButton().click()
    })
    it('Test 5: Validate if cashier can key items into no-receipt return modal ', ()=>{
        tags.noReceiptReturnLink().should('be.visible')
            .click()
        tags.barcodeNotAvailableLink().click()
        cy.noReceiptReturnAddItem(tumblerUPC)
        cy.noReceiptReturnAddItem(gloveUPC)
        tags.returnSelectedItems().should('be.visible')
            .should('not.be.enabled')
            .should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.loyaltyReturnLookupCloseButton().click()
    })
    it('Test 6: Validate if cashier can select items on the no-receipt return modal', ()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        tags.loyaltyReturnLookupCloseButton().click()
     })
    it('Test 7: Validate if cashier can deselect an item on the no receipt return modal', () => {
        tags.noReceiptReturnLink().click()
        tags.barcodeNotAvailableLink().click()
        cy.noReceiptReturnAddItem(yetiUPC)
        tags.returnItemRow1().eq(1).should('not.have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.noReceiptReturnItem1().click()
        tags.returnItemRow1().eq(1).should('have.css', 'background-color', 'rgb(196, 196, 196)') // checked
        tags.returnSelectedItems().should('be.visible')
          .should('not.be.disabled')
        cy.noReceiptReturnAddItem(gloveUPC)
        tags.returnItemRow1().eq(2).should('not.have.css', 'background-color', 'rgb(196, 196, 196)') // unchecked
        tags.noReceiptReturnItem2().click()
        tags.returnItemRow1().eq(2).should('have.css', 'background-color', 'rgb(196, 196, 196)') // checked
        tags.returnSelectedItems().should('be.visible')
          .should('not.be.disabled')
        tags.noReceiptReturnItem2().click()
        tags.returnItemRow1().eq(2).should('not.have.css', 'background-color', 'rgb(196, 196, 196)') // unchecked
        tags.returnModalCloseButton().click()
    })
    it('Test 8: Clicking next should add the no-receipt return items to the transaction', ()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().should('have.css','background-color', 'rgb(0, 101, 84)') 
        tags.transactionCard().should('contain.text', tumblerDescription)
        tags.transactionCard().should('contain.text', tumblerUPC)
        tags.transactionCard().should('contain.text', gloveDescription)
        tags.transactionCard().should('contain.text', gloveUPC)
    })
    it('Test 9: Validate edit option exist for sale item & does not exist for return item', ()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.returnsFooterButton().should('be.visible')
            .should('have.attr', 'aria-disabled', 'true')
        tags.editItem3().should('contain.text', 'Edit')
        tags.returnRow1().should('not.contain', 'Edit')
        tags.returnRow2().should('not.contain', 'Edit')
    })

    it('Test 10: Validate sale item price can be edited to make the total from positive to negative', ()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.editItem3().click()
        tags.editItemPrice1().should('be.visible')
            .and('have.text', 'Edit Price')
        tags.deleteItem().should('be.visible')
            .and('have.text', 'Delete Item')
        tags.editItemPrice1().click()
        cy.intercept('**/Product/PriceChange/*', { body: returnItemsWitPriceOverrideResponse }).as('priceChangeResponse')
        tags.itemPrice0EntryField().click({ force: true })
            .type('8000, {enter}')
        cy.intercept('POST', '**/ManagerOverride', { body: addItemsInCart }).as('managerApproved')
        tags.managerOverrideAssociateId().type(Cypress.env().warrantySellingAssociateNum)
        tags.managerOverrideAssociatePin().type(Cypress.env().warrantySellingAssociatePIN)
        tags.managerOverrideApplyButton().click()
        cy.wait('@managerApproved')
        tags.overridePriceItem3().should('contain.text', 'Price Override $80.00' )
        cy.wait('@priceChangeResponse')
    })
    it('Test 11: Validate sale item can be deleted', ()=>{
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.editItem3().click()
        cy.intercept('**/Product/Item/**', { body: returnItemsWithDeletedItemResponse }).as('itemDeleteResponse')
        tags.deleteItem().click()
        cy.wait('@itemDeleteResponse')
        tags.upcItem3().should('not.exist')
    })
    it('Test 12: Loyalty Lookup by Phone Number view has correct verbiage and buttons', () => {
        tags.returnsLookupGenericButton().should('be.visible').and('have.text', 'NEXT')
        tags.returnsLookupGenericButton().click()
        tags.loyaltyReturnLookupCloseButton().should('be.visible')
        tags.returnGenericNumberEntryField().should('be.visible')
        tags.noReceiptReturnLink().should('be.visible').and('have.text', 'No Receipt Available')
        tags.returnModalCloseButton().click()
    })
    it('Test 13: Validate rteurn is allowing to key in order number & searching order that has no eligible items for return', () => {
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(returnNoItemEligible)
        cy.lookupReturn(returnLookup)
        tags.noReceiptReturnItem1().should('not.exist')
        cy.get('[data-testid="confirm-returns"]').should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.returnModalCloseButton().click()
    })
    it('Test 14: Validate rteurn is allowing to key in order number & searching order that has eligible items for return', () => {
        tags.returnGenericNumberEntryField().click().focused()
        tags.returnGenericNumberEntryField().type(inStoreReturnReceiptNum)
        cy.lookupReturn(eligibleReturnLookup)
        tags.returnItem1().should('be.visible').click()
        cy.addReturnItems(addReturnItemsInCart)
    })
    it('Test 15: No receipt returns prompt for ID capture', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalLabel().should('be.visible')
        tags.modalCloseButton('returnsAuthorization').should('be.visible')
        tags.noReceiptReturnAuthModalFirstLineOfText().should('be.visible')
        tags.noReceiptReturnAuthModalSecondLineOfText().should('be.visible')
        tags.noReceiptReturnAuthModalThirdLineOfText().should('be.visible')
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
    it('Test 16: Clicking the no bar code available link should advance to the ID type screen', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.noReceiptReturnAuthModalLabel().should('be.visible')
        tags.modalCloseButton('returnsAuthorization').should('be.visible')
        tags.returnAuthIdPicker().should('be.visible')
        tags.nonReceiptedReturnAuthNextButton().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
	it('Test 17: The Next button should not be available till an ID type is selected', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.nonReceiptedReturnAuthModalDescription().should('be.visible')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.noReceiptReturnModalCloseButton().click()
    })
    it('Test 18: Selecting the Drivers License automatically advances to the next screen', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select("Driver's License")
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalStateEntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalExpirationDateField().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
      })
	  it('Test 19: Selecting State ID automatically advances to the next screen', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select('State ID')
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalStateEntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalExpirationDateField().should('be.visible')
        tags.nonReceiptedReturnAuthModalExpirationDateField().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
    it('Test 20: License ID form must be fully filled out to advance to the next screen', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select("Driver's License")
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
        tags.nonReceiptedReturnAuthNextButton().click()
        tags.nonReceiptedReturnAuthModalFirstNameField().should('be.visible')
        tags.nonReceiptedReturnAuthModalLastNameField().should('be.visible')
        tags.nonReceiptedReturnAuthModalBirthDateField().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
	 it('Test 21: State ID form must be fully filled out to advance to the next screen', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select('State ID')
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
        tags.nonReceiptedReturnAuthNextButton().click()
        tags.nonReceiptedReturnAuthModalFirstNameField().should('be.visible')
        tags.nonReceiptedReturnAuthModalLastNameField().should('be.visible')
        tags.nonReceiptedReturnAuthModalBirthDateField().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
    it('Test 22: ID Verification screen does not adavance until all fields are filled out', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select('State ID')
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
        tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
        tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
        tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
        tags.nonReceiptedReturnAuthNextButton().click()
        tags.nonReceiptedReturnAuthModalAddress1EntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalAddress2EntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalCityAndStateEntryField().should('be.visible')
        tags.nonReceiptedReturnAuthModalZipCodeEntryField().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
	it('Test 23: Closing the return auth address verification screen voids the transaction', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select('State ID')
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
        tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
        tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
        tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
        tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
        tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
        cy.intercept('**/Transaction/VoidTransaction',).as('voidNoReceiptReturn')
        tags.modalCloseButton('returnsAuthorization').click()
        cy.wait('@voidNoReceiptReturn')
        tags.noReceiptReturnAuthModalLabel().should('not.exist')
    })
       it('Test 24: All fields on the address verification form must be filled out to activate the Next button', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select('State ID')
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
        tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
        tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
        tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
        tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
        tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
        tags.nonReceiptedReturnAuthModalAddress1EntryField().type('933 Kennedy Drive{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalAddress2EntryField().type('Apt #1{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalCityAndStateEntryField().type('Ambridge, PA{enter}')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
        tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003')
        tags.nonReceiptedReturnAuthNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
        tags.noReceiptReturnModalCloseButton().click()
    })
    it('Test 25: Clicking next on address verification screen loads the final confirmation screen', () => {
        cy.performNoReceiptReturn('Null', 'No')    //steps to add no receipt return items on no receipt return modal before adding them to cart
        cy.addNoReceiptReturnItemsToTransaction(addItemsInCart)
        tags.complete().click()
        tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
        tags.returnAuthIdPicker().select('State ID')
        tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('123456abcdef {enter}')
        tags.nonReceiptedReturnAuthModalStateEntryField().type('PA{enter}')
        tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2040{enter}')
        tags.nonReceiptedReturnAuthModalFirstNameField().type('Eric{enter}')
        tags.nonReceiptedReturnAuthModalLastNameField().type('Groeller{enter}')
        tags.nonReceiptedReturnAuthModalBirthDateField().type('12/25/1974{enter}')
        tags.nonReceiptedReturnAuthModalAddress1EntryField().type('933 Kennedy Drive{enter}')
        tags.nonReceiptedReturnAuthModalCityAndStateEntryField().type('Ambridge, PA{enter}')
        tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15003')
        tags.nonReceiptedReturnAuthNextButton().click()
        cy.get('body').should('contain.text', 'ERIC GROELLERID Number 123456ABCDEF Issuing State PAExpiration 12/31/2040DOB 12/25/1974933 KENNEDY DRIVEAMBRIDGE, PA 15003')
        tags.nonReceiptedReturnAuthModalSubmitButton().should('be.visible')
        tags.noReceiptReturnModalCloseButton().click()
    })
})

