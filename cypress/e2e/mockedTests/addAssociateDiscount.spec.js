/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

const tags = new elements()

context('Add associate discount on initial scan page', () => {

    const shoePrice = Cypress.env().runningShoesPrice
    const price = Number(shoePrice).toFixed(2)
    const tax = 0
    const total = helpers.determinTotal(price, tax)
    const amountDueCashTenderResponse = '{"header":{"timestamp":1664591858951,"signature":"GS3mjMMiQJVtH+TBBbmSAIVf8LkqkRz9veupvTkEeV8=","transactionKey":"98490088844710012022","tenderIdentifier":"2-98490088844710012022","eReceiptKey":"5008884470062100122011","storeNumber":888,"registerNumber":447,"transactionNumber":62,"startDateTime":"2022-10-01T02:36:59.198839Z","transactionDate":"2022-09-30T00:00:00","timezoneOffset":-300,"associateId":"1234567","associateDiscountId":"9999999","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":97.49,"promptForPrice":false,"unitPrice":97.49,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":97.49,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[{"discountId":"33802892","discountDescription":"25% Assoc Disc 9999999","discountAmount":-32.5,"discountBasePrice":1}],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":97.49}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":97.49,"tax":0.0,"grandTotal":97.49,"changeDue":0.0,"remainingBalance":0.0}}'
    const amountDueFinalizeTransactionResponse = '{"header":{"timestamp":1664591859269,"signature":"2BD+9AwtKh7wqPYqoUktF71A6lCqsawKACVFKHE+Ros=","transactionKey":"98490088844710012022","tenderIdentifier":"2-98490088844710012022","eReceiptKey":"5008884470062100122011","storeNumber":888,"registerNumber":447,"transactionNumber":62,"startDateTime":"2022-10-01T02:36:59.198839Z","endDateTime":"2022-10-01T02:37:39.2582748Z","transactionDate":"2022-09-30T00:00:00","timezoneOffset":-300,"associateId":"1234567","associateDiscountId":"9999999","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":97.49,"promptForPrice":false,"unitPrice":97.49,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":97.49,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[{"discountId":"33802892","discountDescription":"25% Assoc Disc 9999999","discountAmount":-32.5,"discountBasePrice":1}],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":97.49}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":97.49,"tax":0.0,"grandTotal":97.49,"changeDue":0.0,"remainingBalance":0.0}}'
    
    beforeEach(() => {
        cy.launchPageLoggedIn()
    })

    it('Test 1: Teammate footer menu has correct sub menus on initial scan page', () => {
        tags.teammateButton().click()
        tags.addTeammateToSaleButton().should('be.visible')
        tags.addAssociateDiscountButton().should('be.visible').click()
    })

    it('Test 2: Associate discount modal has correct items and buttons', () => {
        cy.addAssociateDiscountModalOpen()
        tags.addAssociateDiscountModal().should('contain.text', 'ADD ASSOCIATE DISCOUNT')
        tags.addAssociateDiscountInputBox().should('be.visible')
        tags.addAssociateDiscountModalCloseButton().should('be.visible').and('have.text','Close').click()
    }) 

    it('Test 3: Validate on entering Associate ID eligible for discount, applies discount in the cart & navigates to active transaction ', () => {
        cy.addAssociateDiscountModalOpen()
        cy.intercept('**/OmniSearch', {fixture: 'addAssociateDiscount/associateDiscount'}).as('associateDiscountResponse')
        tags.addAssociateDiscountInputBox().should('be.visible').type('9999999')
        tags.addAssociateDiscountSubmitButton().click()
        cy.wait('@associateDiscountResponse')
        tags.addAssociateDiscountPanel().should('contain.text', 'Associate discount is successfully applied.')
        tags.scanPanel().should('be.visible')
    })

    it('Test 4: Validate error on entering associate ID with which associate is logged in ', () => {
        cy.addAssociateDiscountModalOpen()
        cy.intercept('**/OmniSearch', {statusCode: 400, fixture: 'addAssociateDiscount/associateDiscountError'}).as('associateDiscountErrorResponse')
        tags.addAssociateDiscountInputBox().should('be.visible').type('1234567')
        tags.addAssociateDiscountSubmitButton().click()
        cy.wait('@associateDiscountErrorResponse')
        tags.addAssociateDiscountModal().should('be.visible')
        tags.teammateButton().should('be.visible')
        tags.addAssociateDiscountPanel().should('not.exist')
    })

    it('Test 5: Validate error on entering wrong associate ID ', () => {
        cy.addAssociateDiscountModalOpen()
        cy.intercept('**/OmniSearch', {statusCode: 401, fixture: 'addAssociateDiscount/addAssociateDiscountWrongID'}).as('assocDiscountWrongID')
        tags.addAssociateDiscountInputBox().type('1234{enter}')
        cy.wait('@assocDiscountWrongID')
        tags.addAssociateDiscountModal().should('be.visible')
        tags.teammateButton().should('be.visible')
        tags.addAssociateDiscountPanel().should('not.exist')
    })

    it('Test 6: Add an item in the cart where assoicate discount is already applied ', () => {
        cy.addAssociateDiscountTransaction()
        cy.addAssociateDiscountOnItem()
        tags.addAssociateDiscountDesription().should('have.text', '25% Assoc Disc 9876543')
    })

    it('Test 7: Ring Associate Discount Transaction ', () => {
        cy.addAssociateDiscountTransaction()
        cy.addAssociateDiscountOnItem()
        cy.pressComplete()
        tags.sportsMatterCampaignNoThanksButton().click()
        tags.tenderMenuCashButton().click()
        cy.intercept('**/Tender/NewCashTender', { body: amountDueCashTenderResponse }).as('cashAmountDue')
        tags.cashInput().click().type(total)
        cy.intercept('**/Transaction/FinalizeTransaction', { body: amountDueFinalizeTransactionResponse }).as('finalizeTransaction') 
        tags.cashInputEnter().click()
        cy.wait(['@cashAmountDue', '@finalizeTransaction' ])
        cy.get('body').should('contain.text', 'Cash Tendered: $97.49')
        tags.changeDue().should('have.text', '0')
        tags.newTransactionButton().should('be.visible')
    })

    it('Test 8: Add associate discount from OmniSearch on initial scan page ', () => {
        cy.intercept('**/OmniSearch', {fixture: 'addAssociateDiscount/assocDiscountOmniSearch'}).as('AssocDiscountApplied')
        tags.omniScan().should('be.visible')
            .focus()
            .type('9999999{enter}')
        cy.wait('@AssocDiscountApplied')
        cy.addAssociateDiscountOnItem()
        tags.addAssociateDiscountDesription().should('have.text', '25% Assoc Disc 9876543')
    })
})

context('Add associate discount in an active transaction', () => {

    const tumblerPrice = Cypress.env().yetiTumblerPrice
    const price = Number(tumblerPrice).toFixed(2)
    const tax = helpers.determinTax(price)
    const total = helpers.determinTotal(price, tax)
    const amountDueCashTenderResponseData = '{"header":{"timestamp":1620411017169,"signature":"Oskxw1OQRu1dLhoIx4yAAK2erTbtbAsEIBjfOjspVPY=","transactionKey":"250660087931705072021","tenderIdentifier":"2-250660087931705072021","eReceiptKey":"5008793170011050721016","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-05-07T18:09:44.2628Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":32.09}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":0.0}}'
    const amountDueFinalizeTransactionResponseData = '{"header":{"timestamp":1620411017608,"signature":"a4vB6CkX6uYJOLvL1JxqVrsqcMd+ZNegJzYWo8r2iDE=","transactionKey":"250660087931705072021","tenderIdentifier":"2-250660087931705072021","eReceiptKey":"5008793170011050721016","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-05-07T18:09:44.2628Z","endDateTime":"2021-05-07T18:10:17.5586964Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":32.09}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":0.0}}'
    

    beforeEach(()=>{
        cy.launchPageLoggedIn(activeTransaction)
    })

    it('Test 9: Add associate discount in an active transaction', () => {
        cy.addAssociateDiscountModalOpen()
        cy.intercept('**/OmniSearch', {fixture: 'associateDiscountActiveTrans/associateDiscountElligibleID'}).as('assocDiscountElligibleID')
        tags.addAssociateDiscountSubmitButton().should('have.attr', 'aria-disabled', 'true')
        tags.addAssociateDiscountInputBox().should('be.visible').type('9999999')
        tags.addAssociateDiscountSubmitButton().should('not.have.attr', 'aria-disabled', 'true')
        tags.addAssociateDiscountInputBox().should('be.visible').type('{enter}')
        cy.wait('@assocDiscountElligibleID')
        tags.addAssociateDiscountDesription().should('have.text', '25% Assoc Disc 9999999')
    })

    it('Test 10: Add associate discount in an active transaction & complete the transaction', () => {
        cy.addAssociateDiscountModalOpen()
        cy.intercept('**/OmniSearch', {fixture: 'associateDiscountActiveTrans/associateDiscountElligibleID'}).as('assocDiscountElligibleID')
        tags.addAssociateDiscountSubmitButton().should('have.attr', 'aria-disabled', 'true')
        tags.addAssociateDiscountInputBox().should('be.visible').type('9999999')
        tags.addAssociateDiscountSubmitButton().should('not.have.attr', 'aria-disabled', 'true')
        tags.addAssociateDiscountSubmitButton().click()
        cy.wait('@assocDiscountElligibleID')
        tags.omniScan().should('be.visible')
        tags.associateDiscountAddedIcon().should('be.visible')
        tags.transactionCard().should('be.visible')
        cy.pressComplete()
        tags.sportsMatterCampaignNoThanksButton().click()
        tags.tenderMenuCashButton().click()
        cy.intercept('**/Tender/NewCashTender', { body: amountDueCashTenderResponseData }).as('cashAmountDue')
        tags.cashInput().click().type(total)
        cy.intercept('**/Transaction/FinalizeTransaction', { body: amountDueFinalizeTransactionResponseData }).as('finalizeTransaction')
        tags.cashInputEnter().click()
        cy.wait(['@cashAmountDue', '@finalizeTransaction' ])
        cy.get('body').should('contain.text', 'Cash Tendered: $32.09')
        tags.changeDue().should('have.text', '0')
        tags.newTransactionButton().should('be.visible')
    })

    it('Test 11: Add associate discount from OmniSearch in an active transaction', () => {
        cy.intercept('**/OmniSearch', {fixture: 'associateDiscountActiveTrans/assocDiscountActiveTranOmniScan'}).as('AssocDiscActiveOmni')
        tags.omniScan().type('9999999{enter}')
        cy.wait('@AssocDiscActiveOmni')
        tags.addAssociateDiscountDesription().should('have.text', '25% Assoc Disc 9999999')
    })

})