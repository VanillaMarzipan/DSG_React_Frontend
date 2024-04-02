/// <reference types="cypress" />
import elements from '../../support/pageElements'

const tags = new elements()

context('family night sale', () => {

    let familyNightSale = 'true'
 
    beforeEach(() => {
        cy.launchPageLoggedIn(null, familyNightSale)
    })

    it('Test 1: Teammate button is visible', ()=>{
        tags.teammateButton().click()
        tags.addAssociateDiscountButton().should('contain.text', 'TEAMMATE AND FAMILY SALE' )
    })

    it('Test 2: Teammate and Family Night Sale happy flow', () =>{
       
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876543')
        tags.familyNightSubmitButton().click()
        cy.intercept('**/Discount/Associate', {body:'{"header":{"timestamp":1672882154647,"signature":"peStPicMuztNF9B0OcgIuWFF7veHKQVsrRqvneLulbY=","transactionKey":"20230104008793450039","tenderIdentifier":"1-20230104008793450039","eReceiptKey":"5008793450039010523016","storeNumber":879,"registerNumber":345,"transactionNumber":39,"startDateTime":"2023-01-05T01:29:14.38672Z","transactionDate":"2023-01-04T00:00:00","timezoneOffset":-360,"associateId":"1234567","associateDiscountId":"9876543","associateDiscountDetails":{"associateId":"9876543","familyNight":true,"percentOff":10.0,"couponCode":"P00046548"},"transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}' }).as('addDiscount')
        tags.familyNightSaleInput().type('P00046548')
        tags.familyNightSubmitButton().click()
        cy.wait('@addDiscount')
        cy.get('[data-testid="associateDiscount-panel"]').should('contain.text', 'Teammate and Family Sale coupon is successfully applied.')
        
    })

    it('Test 3: Validate Teammate  coupon modal has right buttons   ', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876843{Enter}')
        tags.familyNightSaleInput().should('have.css','color', 'rgb(0, 0, 0)')
        tags.familyNightModalTitle().should('have.text', 'TEAMMATE AND FAMILY SALE')
        tags.familyNightNoCouponButton().should('have.text', 'NO COUPON AVAILABLE').and('not.be.disabled')//enabled
        tags.familyNightSubmitButton().should('not.be.enabled').and('have.text', 'ENTER')//disabled
        tags.familyNightSaleInput().type('P00046548')
        tags.familyNightSubmitButton().should('not.be.disabled')//enabled
        tags.familyNightModalSubTitle().should('contain.text', 'Associate ID: 9876843')
    })

    it('Test4: Validate Teammate sale modal has right buttons   ', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSubmitButton().should('not.be.enabled')
        tags.familyNightModalTitle().should('have.text', 'TEAMMATE AND FAMILY SALE')
        tags.familyNightModalCloseButton().should('be.visible').and('have.text', 'Close')
        tags.familyNightSubmitButton().should('have.css', 'background-color','rgb(200, 200, 200)')//disabled
        tags.familyNightSaleInput().type('9876843')
        tags.familyNightSubmitButton().should('not.be.disabled')
    })

    it('Test 5: Validate clicking cross button on modal closes the modal   ', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        cy.get('[data-testid="modal-title-addAssociateDiscount"]').should('have.text', 'TEAMMATE AND FAMILY SALE')
        tags.familyNightModalCloseButton().should('be.visible').click()
        tags.addAssociateDiscountButton().should('be.visible').and('not.be.disabled')
        .should('have.text','TEAMMATE AND FAMILY SALE' )
    })

    it('Test 6: Validate Back button working as expected on modal', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876543{Enter}')
        tags.backButton().should('be.visible').click()
        tags.familyNightSaleInput().should('contain.value', '9876543')
        tags.familyNightModalSubTitle().should('not.be.visible')
    })

    it('Test 7: Validate teammate can go back and forth on modal from associate ID to coupon entry', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876543{Enter}')
        tags.backButton().click()
        tags.familyNightSubmitButton().click()
        tags.familyNightNoCouponButton().should('have.text', 'NO COUPON AVAILABLE').and('not.be.disabled')//enabled
        tags.familyNightSubmitButton().should('not.be.enabled').and('have.text', 'ENTER')//disabled
        tags.backButton().should('be.visible').and('have.text', 'Back')
    })

    it('Test 8: Validate NO COUPON AVAILABLE applies associate discount in the transaction ', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876543{Enter}')
        cy.intercept('**/Discount/Associate', {body:'{"header":{"timestamp":1672883309601,"signature":"5F5osNMSDC1DIdB5YovDMuarF6VAWR9eFY1kQNLmtAA=","transactionKey":"20230104008793450040","tenderIdentifier":"1-20230104008793450040","eReceiptKey":"5008793450040010523014","storeNumber":879,"registerNumber":345,"transactionNumber":40,"startDateTime":"2023-01-05T01:48:29.332685Z","transactionDate":"2023-01-04T00:00:00","timezoneOffset":-360,"associateId":"1234567","associateDiscountId":"9876543","associateDiscountDetails":{"associateId":"9876543","familyNight":false},"transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":0.0,"tax":0.0,"grandTotal":0.0,"changeDue":0.0,"remainingBalance":0.0},"isTaxExempt":false}'}).as('noCoupon')
        tags.familyNightNoCouponButton().click()
        tags.addAssociateDiscountPanel().should('contain.text', 'Associate discount is successfully applied.')
        cy.wait('@noCoupon')
        cy.intercept('**/OmniSearch', {body: '{"type":"Transaction","transaction":{"header":{"timestamp":1672883488161,"signature":"xNVO/0IyGWVRzWG66DY/39pQsyEZjqEMg3N41gvXhJU=","transactionKey":"20230104008793450040","tenderIdentifier":"1-20230104008793450040","eReceiptKey":"5008793450040010523014","storeNumber":879,"registerNumber":345,"transactionNumber":40,"startDateTime":"2023-01-05T01:48:29.332685Z","transactionDate":"2023-01-04T00:00:00","timezoneOffset":-360,"associateId":"1234567","associateDiscountId":"9876543","associateDiscountDetails":{"associateId":"9876543","familyNight":false},"transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"190340371394","sku":"019522728","style":"1202532A070","description":"Brooks Women’s Addiction 13 Running Shoes","quantity":1,"returnPrice":97.49,"promptForPrice":false,"unitPrice":97.49,"referencePrice":129.99,"everydayPrice":129.99,"priceOverridden":false,"originalUnitPrice":97.49,"variants":{"Color":"Black/Pink/Grey","eCom Shoe Size":"8.5","eCom Shoe Width":"Narrow/2A"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1","nonTaxable":true,"totalItemTax":0.0,"hierarchy":"520-001-004-001","attributes":[],"appliedDiscounts":[{"discountId":"33891001","discountDescription":"25% Assoc Disc 9876543","discountAmount":-32.5,"discountBasePrice":1}],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":97.49,"tax":0.0,"grandTotal":97.49,"changeDue":0.0,"remainingBalance":97.49},"isTaxExempt":false},"upc":"190340371394"}'}).as('addItem')
        cy.window().then((w) => {
            w.scanEvent('190340371394')
        })
        cy.wait('@addItem')
        cy.get('[data-testid="discount-description00"]').should('contain.text', '25% Assoc Disc')
    })

    it('Test 9: Validate associate discount is not applied with NO COUPON AVAILABLE if invalid associate ID entered ', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876543{Enter}')
        tags.familyNightNoCouponButton().click()
    })


    it.skip('Test 10: System throws error for invalid associate ID  ', () =>{
        tags.teammateButton().click() 
        tags.addAssociateDiscountButton().click()
        tags.familyNightSaleInput().type('9876843{Enter}')
        cy.get('[data-testid="family-night-discount-input"]').type('P00046548{Enter}')
        cy.get('[style="color: rgb(184, 8, 24); margin-bottom: 33px;"]').should('have.text', 'Sorry, the associate ID was not found. Please check the ID and try again.')
        
    })



})
