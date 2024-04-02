/// <reference types="cypress" />
import elements from '../../support/pageElements'
import activeTransaction from '../../fixtures/activeTransactionTumbler.json'

const tags = new elements()

context('Gift Card button on initial scan page', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
    })

    it('Test 1: gift card button has correct sub menus on initial scan page', () => {
        tags.giftCardFooterButton().should('be.visible').click()
        tags.giftCardBalanceInquiryFooterButton().should('be.visible')
        tags.activateGiftCardButton().should('be.visible')
            .click()
        tags.giftCardSaleButton().should('be.visible')
    })

    it('Test 2: gift card balance inquiry modal opens from gift card sub menu', () => {
        tags.giftCardFooterButton().click()
        tags.giftCardBalanceInquiryFooterButton().click()
        tags.giftCardBalanceInquiryModal().should('be.visible').and('have.text', 'GIFT CARD BALANCE INQUIRY')
        tags.giftCardBalanceInquiryModalText().should('be.visible')
        tags.giftCardBalanceInquiryModalCloseButton().should('be.visible').and('have.text', 'Close')
        tags.giftCardBalanceInquiryModalCloseButton().should('be.visible').click()
    })

    it('Test 3: sell a gift card modal opens from gift card sub menu', () => {
        tags.productLookupFooterButton().should('be.visible')
        tags.teammateButton().should('be.visible')
        tags.giftCardFooterButton().click()
        tags.giftCardBalanceInquiryFooterButton().should('be.visible')
        tags.activateGiftCardButton().should('be.visible')
            .click()
        tags.giftCardSaleButton().click()
        tags.activateGiftCardModalTitle().should('be.visible')
            .and('have.text', 'ACTIVATE GIFT CARD')
        tags.sellGiftCardModalText().should('be.visible')
            .and('contain.text', 'Swipe the gift card on the register.')
        tags.backButton().should('be.visible')
        tags.activateGiftCardModalCloseButton().should('be.visible').click()
    })
})
context('Gift Card button in active transaction', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn(activeTransaction)
    })
    it('Test 4: Validate in an active transaction custmer service, high five are disabled and only sell Gc is enabled', () => {
        tags.giftCardFooterButton().should('be.visible').click()
        tags.giftCardBalanceInquiryFooterButton().should('be.visible')
        tags.activateGiftCardButton().should('be.visible')
            .click()
        tags.giftCardSaleButton().should('be.visible')
        tags.giftCardCustomerServiceButton().should('not.be.enabled')
        tags.giftCardHighFiveButton().should('not.be.enabled')
    })
    it('Test 5: gift card balance inquiry modal opens from gift card sub menu in active transaction', () => {
        tags.giftCardFooterButton().click()
        tags.giftCardBalanceInquiryFooterButton().click()
        tags.giftCardBalanceInquiryModal().should('be.visible').and('have.text', 'GIFT CARD BALANCE INQUIRY')
        tags.giftCardBalanceInquiryModalText().should('be.visible')
        tags.giftCardBalanceInquiryModalCloseButton().should('be.visible').and('have.text', 'Close')
        tags.giftCardBalanceInquiryModalCloseButton().should('be.visible').click()
    })
    it('Test 6: sell a gift card modal opens from gift card sub menu in active transaction menu', () => {
        tags.productLookupFooterButton().should('be.visible')
        tags.teammateButton().should('be.visible')
        tags.giftCardFooterButton().click()
        tags.giftCardBalanceInquiryFooterButton().should('be.visible')
        tags.activateGiftCardButton().should('be.visible')
            .click()
        tags.giftCardSaleButton().click()
        tags.activateGiftCardModalTitle().should('be.visible')
            .and('have.text', 'ACTIVATE GIFT CARD')
        tags.sellGiftCardModalText().should('be.visible')
            .and('contain.text', 'Swipe the gift card on the register.')
        tags.backButton().should('be.visible')
        tags.activateGiftCardModalCloseButton().should('be.visible').click()
    })
})
context('Gift Card line item tests', () => {
    const activeTrxWithGiftCard = '{"header":{"timestamp":1670959069447,"signature":"IKDA2NRCPoYS4nFmStcekmYXZdIK6UpshgiaXJ4u1Ew=","transactionKey":"20221213048891021170","tenderIdentifier":"1-20221213048891021170","eReceiptKey":"5048891021170121322016","storeNumber":4889,"registerNumber":102,"transactionNumber":1170,"startDateTime":"2022-12-13T19:05:44.032014Z","transactionDate":"2022-12-13T00:00:00","timezoneOffset":-300,"associateId":"9999999","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"accountNumber":"7777082371268098","amount":25.0,"adyenTransactionId":"CxEp001670958348001.MRN96GJLZBLZNN82","adyenTimestamp":"2022-12-13T19:05:48","transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":25.0,"tax":0.0,"grandTotal":25.0,"changeDue":0.0,"remainingBalance":25.0},"isTaxExempt":false}'

    it('Test 7: Testing that I can not edit a gift card sale', () => {
        cy.launchPageLoggedIn(activeTrxWithGiftCard)
        tags.transactionCard().should('contain', 'Gift Card')
        tags.editItem1().click()
        tags.editItemPrice1().should('not.exist')
    })
})
