/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

const tags = new elements()
const inalidCustomerNumber = 'cc0001328757588'
const validCustomerNumber = 'cc00013287'
const yetiUPC = Cypress.env().yetiTumblerUPC

context('Tax exempt sale applied from initial scan page', () => {
    
    const invalidCustomerResonse = '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'
    const validCustomerResponse = '{"header":{"timestamp":1671401794028,"signature":"G3Yjzg4GUzzkstfn00RlCc4lMEYu2w+sCoP0hRX/0Vk=","transactionKey":"20221218008884470151","tenderIdentifier":"1-20221218008884470151","eReceiptKey":"5008884470151121822012","storeNumber":888,"registerNumber":447,"transactionNumber":151,"startDateTime":"2022-12-18T22:16:33.849252Z","transactionDate":"2022-12-18T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'
    const caseSensitiveCustomerResponse = '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'
    const validAfterErrorResponse = '{"header":{"timestamp":1671407723210,"signature":"0bDY83VwXCR96BWTvpHLzadyJsmpzrzZ4jblabhMWOg=","transactionKey":"20221218008884470153","tenderIdentifier":"1-20221218008884470153","eReceiptKey":"5008884470153121822016","storeNumber":888,"registerNumber":447,"transactionNumber":153,"startDateTime":"2022-12-18T23:55:23.064567Z","transactionDate":"2022-12-18T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'
    const itemInTaxExemptSale = '{"type":"Transaction","transaction":{"header":{"timestamp":1671409219634,"signature":"O+ZUkyS37AYhAxLcmSg2CIPrErCScPTyyqqwbE0W71o=","transactionKey":"20221218008884470153","tenderIdentifier":"1-20221218008884470153","eReceiptKey":"5008884470153121822016","storeNumber":888,"registerNumber":447,"transactionNumber":153,"startDateTime":"2022-12-18T23:55:23.064567Z","transactionDate":"2022-12-18T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":35.0,"tax":0.0,"grandTotal":35.0,"changeDue":0.0,"remainingBalance":35.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}},"upc":"888830050118"}'

    beforeEach(() => {
        cy.launchPageLoggedIn()
    })
    
    it('Test 1: Validate Tax exempt is visible under Functions footer menu on Initial scan page', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().should('be.visible')
        .should('not.be.disabled')
        tags.registerFunctions().click()
    })

    it('Test 2: Validate enter button is disabled in Tax exempt modal', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalEnterButton().should('be.visible')
        .should('not.be.enabled')
    })

    it('Test 3: Validate Tax exempt modal has correct buttons', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalTitle().should('contain.text', 'Tax Exempt Sale')
        tags.taxExemptModalCloseButton().should('be.visible').and('have.text', 'Close')
        cy.get('[data-testid="undefined-border"]').should('have.css', 'border-color', 'rgba(0, 0, 0, 0.54)')
        tags.taxExemptModalDisclaimer().should('be.visible')
        tags.taxExemptQRCodeDisclaimer().should('have.text', 'Scan the QR Code')
        
    })

    it('Test 4: Validate Enter button enabled when customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().should('be.visible').and('have.css','background-color','rgb(197, 113, 53)' )//enabled
        
    })

    it('Test 5: Validate Enter button deactivated when invalid customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        
    })

    it('Test 6: Validate customer number field is case sensitive', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: caseSensitiveCustomerResponse}).as('caseSensitiveResponse')
        tags.taxExemptCustomerInputBox().type('CC00013287{enter}')
        cy.wait('@caseSensitiveResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
    })

    it('Test 7: Validate system throws error message for inalid customer number', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: caseSensitiveCustomerResponse}).as('caseSensitiveResponse')
        tags.taxExemptCustomerInputBox().type('CC00013287{enter}')
        cy.wait('@caseSensitiveResponse')
        tags.taxExemptErrorMessage().should('be.visible')
    })

    it('Test 8: Validate click on close button closes tax exempt modal', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalCloseButton().click()
        tags.omniScan().should('be.visible')
    })

    it('Test 9: Validate system throws error message for inalid customer number when submitted with enter button', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptCustomerInputBox().type('CC00013287')
        cy.intercept('**/TaxExempt', {body: caseSensitiveCustomerResponse}).as('caseSensitiveResponse')
        tags.taxExemptModalEnterButton().click()
        cy.wait('@caseSensitiveResponse')
        tags.taxExemptErrorMessage().should('be.visible')
    })

    it('Test 10: Validate sale transaction initiated with valid customer number entry ', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber + '{enter}')
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
    })

    it('Test 11: Validate sale transaction initiated with valid customer number submitted with enter button ', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().click()
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
    })

    it('Test 12: Validate sale transaction initiated with valid customer number scan', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
    })

    it('Test 13: Validate Enter button deactivated when invalid customer number is scanned', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        cy.window().then((w) => {
            w.scanEvent(inalidCustomerNumber)
        })
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
    })

    it('Test 14: Validate valid customer number scan initiates sale transaction after error', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        cy.window().then((w) => {
            w.scanEvent(inalidCustomerNumber)
        })
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
    })

    it('Test 15: Validate valid customer number scan initiates sale transaction after invalid cust entry', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
    })

    it('Test 16: Validate valid customer number entry initiates sale transaction after invalid cust entry', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        tags.taxExemptCustomerInputBox().clear().type(validCustomerNumber +'{Enter}')
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
    })

    it('Test 17: Validate sale transaction initiated with valid customer number can be voided', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().click()
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        cy.voidTransaction()
    })

    it('Test 18: Add an iem in the sale transaction initiated with valid customer number', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().click()
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        cy.intercept('**/OmniSearch', {body: itemInTaxExemptSale}).as('itemAdded')
        cy.window().then((w) => {
            w.scanEvent(yetiUPC)
        })
        cy.wait('@itemAdded')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 19: Add an iem in the sale transaction initiated with valid customer number', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().click()
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        cy.intercept('**/OmniSearch', {body: itemInTaxExemptSale}).as('itemAdded')
        tags.omniScan().type(yetiUPC + '{Enter}')
        cy.wait('@itemAdded')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 20: Validate all footer menus are enabled after tax exmpted applied in sale', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
        tags.complete().should('not.be.disabled')
        tags.registerFunctions().should('not.be.disabled')
        tags.productLookupFooterButton().should('not.be.disabled')
        tags.returnsFooterButton().should('not.be.disabled')
        tags.teammateButton().should('not.be.disabled')
        tags.feedback().should('not.be.disabled')
        tags.receiptOptions().should('not.be.disabled')
        tags.giftCardFooterButton().should('not.be.disabled')
    })

})

context('Tax exempt applied in an active transaction', () => {

    const invalidCustomerResonse = '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'
    const validCustomerResponse = '{"header":{"timestamp":1671411118781,"signature":"s1zL7rxub91wGa8HYqP8mfb12VQoPjHOYl3o9WfRolk=","transactionKey":"20221218008884470155","tenderIdentifier":"1-20221218008884470155","eReceiptKey":"5008884470155121922016","storeNumber":888,"registerNumber":447,"transactionNumber":155,"startDateTime":"2022-12-19T00:51:39.438814Z","transactionDate":"2022-12-18T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":35.0,"tax":0.0,"grandTotal":35.0,"changeDue":0.0,"remainingBalance":35.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'
    const caseSensitiveCustomerResponse = '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'
    const validAfterErrorResponse = '{"header":{"timestamp":1671416476814,"signature":"crSgXEQUYJvnW64CzCpD7beluS1WEZHfrtJH3t+XkGs=","transactionKey":"20221218008884470157","tenderIdentifier":"1-20221218008884470157","eReceiptKey":"5008884470157121922019","storeNumber":888,"registerNumber":447,"transactionNumber":157,"startDateTime":"2022-12-19T02:02:36.475924Z","transactionDate":"2022-12-18T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":35.0,"tax":0.0,"grandTotal":35.0,"changeDue":0.0,"remainingBalance":35.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'

    beforeEach(()=>{
        cy.launchPageLoggedIn(activeTransaction)
    }) 

    it('Test 21: Add an iem in the sale transaction initiated with valid customer number', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().should('be.visible')
        .should('not.be.disabled')
        tags.registerFunctions().click()
    })

    it('Test 22: Validate enter button is disabled in Tax exempt modal', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalEnterButton().should('be.visible')
        .should('not.be.enabled')
    })

    it('Test 23: Validate Tax exempt modal has correct buttons', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalTitle().should('contain.text', 'Tax Exempt Sale')
        tags.taxExemptModalCloseButton().should('be.visible').and('have.text', 'Close')
        cy.get('[data-testid="undefined-border"]').should('have.css', 'border-color', 'rgba(0, 0, 0, 0.54)')
        tags.taxExemptModalDisclaimer().should('be.visible')
        tags.taxExemptQRCodeDisclaimer().should('have.text', 'Scan the QR Code')
        
    })

    it('Test 24: Validate Enter button enabled when customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().should('be.visible').and('have.css','background-color','rgb(197, 113, 53)' )//enabled
    })

    it('Test 25: Validate Enter button deactivated when invalid customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
    })

    it('Test 26: Validate customer number field is case sensitive', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: caseSensitiveCustomerResponse}).as('caseSensitiveResponse')
        tags.taxExemptCustomerInputBox().type('CC00013287{enter}')
        cy.wait('@caseSensitiveResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
    })

    it('Test 27: Validate system throws error message for inalid customer number', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: caseSensitiveCustomerResponse}).as('caseSensitiveResponse')
        tags.taxExemptCustomerInputBox().type('CC00013287{enter}')
        cy.wait('@caseSensitiveResponse')
        tags.taxExemptErrorMessage().should('be.visible')
    })

    it('Test 28: Validate click on close button closes tax exempt modal', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalCloseButton().click()
        tags.omniScan().should('be.visible')
    })

    it('Test 29: Validate system throws error message for inalid customer number when submitted with enter button', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptCustomerInputBox().type('CC00013287')
        cy.intercept('**/TaxExempt', {body: caseSensitiveCustomerResponse}).as('caseSensitiveResponse')
        tags.taxExemptModalEnterButton().click()
        cy.wait('@caseSensitiveResponse')
        tags.taxExemptErrorMessage().should('be.visible')
    })

    it('Test 30: Validate tax exempt applied in sale transaction with valid customer number entry ', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber + '{enter}')
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
        tags.complete().should('not.be.disabled')
    })

    it('Test 31: Validate tax exempt applied with valid customer number submitted with enter button ', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber)
        tags.taxExemptModalEnterButton().click()
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 32: Validate tax exempt applied in sale transactio with valid customer number scan', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validCustomerResponse}).as('validCustomerResponseData')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
        tags.complete().should('not.be.disabled')

    })

    it('Test 33: Validate Enter button deactivated when invalid customer number is scanned', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        cy.window().then((w) => {
            w.scanEvent(inalidCustomerNumber)
        })
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
    })

    it('Test 34: Validate tax exempt applied in sale with valid customer number scan after error', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        cy.window().then((w) => {
            w.scanEvent(inalidCustomerNumber)
        })
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')

    })

    it('Test 35: Validate tax exempt applied with valid customer number scan after invalid cust entry', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: invalidCustomerResonse}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
        tags.taxExemptErrorMessage().should('be.visible')
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 36: Validate tax exmpted sale can be voided', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
        cy.voidTransaction()
    })

    it('Test 37: Validate item can be scanned after tax exempt applied in sale', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        cy.intercept('**/OmniSearch', {body: '{"type":"Transaction","transaction":{"header":{"timestamp":1671419134006,"signature":"xBoEi0SevHUp//7NCFMg6Zw74PQGCakw9tRXGjTJIyA=","transactionKey":"20221218008884470158","tenderIdentifier":"1-20221218008884470158","eReceiptKey":"5008884470158121922016","storeNumber":888,"registerNumber":447,"transactionNumber":158,"startDateTime":"2022-12-19T03:04:45.139539Z","transactionDate":"2022-12-18T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false},{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":2,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":70.0,"tax":0.0,"grandTotal":70.0,"changeDue":0.0,"remainingBalance":70.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}},"upc":"888830050118"}'}).as('secondItemAdded')
        cy.window().then((w) => {
            w.scanEvent(yetiUPC)
        })
        cy.wait('@secondItemAdded')
        tags.taxes().should('contain.text', 'Exempt')
        tags.complete().should('not.be.disabled')

    })

    it('Test 38: Validate all footer menus are enabled after tax exempt applied in sale', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: validAfterErrorResponse}).as('validAfterError')
        cy.window().then((w) => {
            w.scanEvent(validCustomerNumber)
        })
        cy.wait('@validAfterError')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.taxes().should('contain.text', 'Exempt')
        tags.complete().should('not.be.disabled')
        tags.registerFunctions().should('not.be.disabled')
        tags.productLookupFooterButton().should('not.be.disabled')
        tags.returnsFooterButton().should('not.be.disabled')
        tags.teammateButton().should('not.be.disabled')
        tags.feedback().should('not.be.disabled')
        tags.receiptOptions().should('not.be.disabled')
        tags.giftCardFooterButton().should('not.be.disabled')
    })
})

context ('Tax exempt in active transaction when transaction initiated by loyalty phone number', ()=>{

    beforeEach(()=>{
        cy.launchPageLoggedIn()
        cy.intercept('**/Transaction/Customer/*', {body: '{"header":{"timestamp":1673143024518,"signature":"EojWM2+IJv2zA9NyM/2kKJXntWq2kbh4WuK50jBxDvw=","transactionKey":"20230107008793010077","tenderIdentifier":"1-20230107008793010077","eReceiptKey":"5008793010077010823015","storeNumber":879,"registerNumber":301,"transactionNumber":77,"startDateTime":"2023-01-08T01:57:04.5005217Z","transactionDate":"2023-01-07T00:00:00Z","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"200000030018"},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}'}).as('loyaltyPhoneResponse')
        cy.intercept('**/Loyalty/AccountLevelDetails', {body: '{"rewards":[{"rewardCertificateNumber":"R8888879820000003","onlineCertificateNumber":"RWD2SD7WWUD","status":1,"statusDescription":"Available","rewardType":0,"rewardTypeDescription":"RewardCertificate","rewardAmount":10.00,"expirationDate":"2025-12-31T23:59:59","graceExpirationDate":"2026-03-31T23:59:59","activeDate":"2022-12-22T00:00:00"},{"rewardCertificateNumber":"R8888888820000003","onlineCertificateNumber":"RWDPUB8N6UX","status":1,"statusDescription":"Available","rewardType":0,"rewardTypeDescription":"RewardCertificate","rewardAmount":10.00,"expirationDate":"2025-12-31T23:59:59","graceExpirationDate":"2026-03-31T23:59:59","activeDate":"2022-12-01T00:00:00"},{"rewardCertificateNumber":"R8888876020000003","onlineCertificateNumber":"RWD8KP7SNCC","status":1,"statusDescription":"Available","rewardType":0,"rewardTypeDescription":"RewardCertificate","rewardAmount":10.00,"expirationDate":"2025-12-31T23:59:59","graceExpirationDate":"2026-03-31T23:59:59","activeDate":"2022-05-09T00:00:00"}],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":107.0,"rewardAmount":0.00,"pointsToNextReward":193.0,"currentRewardTier":0.0,"nextRewardTier":10.0}}'}).as('loyaltyAccountResponse')
        tags.omniScan().type(Cypress.env().phoneAbeLincoln + '{enter}')
        cy.wait[('@loyaltyAccountResponse', '@loyaltyPhoneResponse')]
    })

    it('Test 39: Validate tax exempt can be applied when transaction initiated by phone number.', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalEnterButton().should('be.visible')
        .should('not.be.enabled')
        cy.intercept('**/TaxExempt',{body: '{"header":{"timestamp":1673143381007,"signature":"ABo3Fl5zjIULQZujOGGdJqdPmz1F+3HBhZvpuFbzw7o=","transactionKey":"20230107008793010077","tenderIdentifier":"1-20230107008793010077","eReceiptKey":"5008793010077010823015","storeNumber":879,"registerNumber":301,"transactionNumber":77,"startDateTime":"2023-01-08T01:57:04.500521Z","transactionDate":"2023-01-07T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"200000030018"},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber + '{enter}')
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.complete().should('not.be.disabled')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 40: Validate Enter button deactivated when invalid customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
    })
})

context ('Tax exempt in active transaction when transaction initiated by scorecard', ()=>{

    beforeEach(()=>{
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch', {body: '{"type":"LoyaltyAccounts","loyalty":[{"id":26100200,"firstName":"DON","lastName":"PIC","emailAddress":"dp12345@dcsg.com","street":"123 Test Street","apartment":"","city":"New Castle","state":"PA","zip":"16102","homePhone":"7246140016","loyalty":"L01XB23YCLJ1","subAccount":"B23YCLJ1","currentPointBalance":0.0,"rewardAmount":0.0}],"transaction":{"header":{"timestamp":1673155702091,"storeNumber":0,"registerNumber":0,"startDateTime":"0001-01-01T00:00:00","transactionDate":"0001-01-01T00:00:00","timezoneOffset":0,"transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":0,"transactionStatusDescription":"0"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}}'}).as('loyaltySearchResponse')
        cy.intercept('**/Transaction/Customer/*', {body: '{"header":{"timestamp":1673154957803,"signature":"mcL68dsyW9ATYZ3g+jNQf2mC2anSYBFVbjhY1pUtCSg=","transactionKey":"20230107008793010081","tenderIdentifier":"1-20230107008793010081","eReceiptKey":"5008793010081010823014","storeNumber":879,"registerNumber":301,"transactionNumber":81,"startDateTime":"2023-01-08T05:15:57.7818418Z","transactionDate":"2023-01-07T00:00:00Z","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}'}).as('scoreResponse')
        cy.intercept('**/Loyalty/AccountLevelDetails/*', {body: '{"rewards":[],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":0.0,"rewardAmount":0.00,"pointsToNextReward":300.0,"currentRewardTier":0.0,"nextRewardTier":10.0}}'}).as('scoreCardAccount')
        tags.omniScan().type('L01XB23YCLJ1 {enter}')
        cy.wait[('@loyaltySearchResponse,@scoreResponse','@scoreCardAccount')]
        tags.loyaltySelectedAthlete().should('be.visible')
        .should('have.text', 'DON PIC')
    })

    it('Test 41: Validate tax exempt can be applied when transaction initiated by scorecard.', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalEnterButton().should('be.visible')
        .should('not.be.enabled')
        cy.intercept('**/TaxExempt',{body: '{"header":{"timestamp":1673148743969,"signature":"I83NQr41EeNCdsn++eIeeZ1VMpfi/P3YVwayhTBv87c=","transactionKey":"20230107008793010080","tenderIdentifier":"1-20230107008793010080","eReceiptKey":"5008793010080010823017","storeNumber":879,"registerNumber":301,"transactionNumber":80,"startDateTime":"2023-01-08T03:30:21.572284Z","transactionDate":"2023-01-07T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L01XB23YCLJ1"},"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber + '{enter}')
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.complete().should('not.be.disabled')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 42: Validate Enter button deactivated when invalid customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
    })
})

context('Tax exempt applied in sale initiated by entering coupon', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
        cy.intercept('**/OmniSearch',{body: '{"type":"Coupon","transaction":{"header":{"timestamp":1673156119155,"signature":"2uzVhl1C0N/7eYERf02KGwbiEtzVDrKCrlcHTc7w0+o=","transactionKey":"20230107008793010083","tenderIdentifier":"1-20230107008793010083","eReceiptKey":"5008793010083010823018","storeNumber":879,"registerNumber":301,"transactionNumber":83,"startDateTime":"2023-01-08T05:35:18.962618Z","transactionDate":"2023-01-07T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[{"couponCode":"P00043608","description":"$20 off $100","couponState":1,"couponStateDescription":"NotApplied","couponPromotionStatus":2,"couponPromotionStatusDescription":"ExpiredPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false},"couponCode":"P00043608"}'}).as('couponCodeResponse')
        tags.omniScan().type(Cypress.env().coupon20off100 + '{enter}')
        cy.wait('@couponCodeResponse')
    })

    it('Test 43: Validate Tax exempt is applied when sale initited by entering coupon', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        tags.taxExemptModalEnterButton().should('be.visible')
        .should('not.be.enabled')
        cy.intercept('**/TaxExempt', {body: '{"header":{"timestamp":1673156213358,"signature":"tol7k6goXhgJ7SeLdq4NtY329q2tRhOYbffVxXCIyN4=","transactionKey":"20230107008793010083","tenderIdentifier":"1-20230107008793010083","eReceiptKey":"5008793010083010823018","storeNumber":879,"registerNumber":301,"transactionNumber":83,"startDateTime":"2023-01-08T05:35:18.962618Z","transactionDate":"2023-01-07T00:00:00","timezoneOffset":-360,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[{"couponCode":"P00043608","description":"$20 off $100","couponState":1,"couponStateDescription":"NotApplied","couponPromotionStatus":2,"couponPromotionStatusDescription":"ExpiredPromotions"}],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":true,"taxExemptDetail":{"customerNumber":"cc00013287"}}'}).as('validCustomerResponseData')
        tags.taxExemptCustomerInputBox().type(validCustomerNumber + '{enter}')
        cy.wait('@validCustomerResponseData')
        tags.taxExemptAppliedIcon().should('be.visible')
        tags.complete().should('not.be.disabled')
        tags.taxes().should('contain.text', 'Exempt')
    })

    it('Test 44: Validate Enter button deactivated when invalid customer number is entered', ()=>{
        tags.registerFunctions().click()
        tags.taxExemptButton().click()
        cy.intercept('**/TaxExempt', {body: '{"statusCode":422,"reasonCode":601,"message":"Tax exempt customer number is not valid","originatingService":"Coordinator"}'}).as('invalidCustomerResponse')
        tags.taxExemptCustomerInputBox().type(inalidCustomerNumber +'{Enter}')
        cy.wait('@invalidCustomerResponse')
        tags.taxExemptModalEnterButton().should('have.css', 'background-color','rgb(200, 200, 200)') //disabled
    })
})
