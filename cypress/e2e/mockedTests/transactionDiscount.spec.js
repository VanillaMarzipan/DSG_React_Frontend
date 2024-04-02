/// < reference types="cypress"/>
import elements from '../../support/pageElements'
import shoeResponse from '../../fixtures/items/brooksRunningShoeResponse.json'
import transactionDiscountResponses from '../../fixtures/transactionDiscountResponses.json'

const tags = new elements()
const shoeUPC = Cypress.env().runningShoesUPC
const managerNumber = Cypress.env().warrantySellingAssociateNum
const managerPIN = Cypress.env().warrantySellingAssociatePIN

const reasons = [
    { label: 'Manager Discount', value: '0' },
    { label: 'Coupon Discount', value: '1' },
    { label: 'Package Price Discount', value: '2' }
]

//responses defined below 
const percentDollarDiscountResp = JSON.parse(JSON.stringify(transactionDiscountResponses.percentDollarDiscountResp))
const managerApprovalResp = JSON.parse(JSON.stringify(transactionDiscountResponses.managerApprovalResp))
const managerLoginPercentDollarDiscountResp = JSON.parse(JSON.stringify(transactionDiscountResponses.managerLoginPercentDollarDiscountResp))

// generate dynamic responses
Cypress.Commands.add('generateDynamicResponses', (originalRequest, percentDifference, appliedDiscounts, total, returnPrice, setTwoAppliedDiscounts, setTwoReturnPrice, setTwoTotal) => {
    percentDollarDiscountResp.originalRequest = originalRequest
    percentDollarDiscountResp.thresholdExceededDetails.percentDifference = percentDifference

    managerApprovalResp.items[0].appliedDiscounts = appliedDiscounts
    managerApprovalResp.items[0].returnPrice = returnPrice
    managerApprovalResp.total = total

    managerLoginPercentDollarDiscountResp.items[0].appliedDiscounts = setTwoAppliedDiscounts
    managerLoginPercentDollarDiscountResp.items[0].returnPrice = setTwoReturnPrice
    managerLoginPercentDollarDiscountResp.total = setTwoTotal

    cy.wrap(percentDollarDiscountResp).as('percentDollarDiscountResp')
    cy.wrap(managerApprovalResp).as('managerApprovalResp')
    cy.wrap(managerLoginPercentDollarDiscountResp).as('managerLoginPercentDollarDiscountResp')
})

Cypress.Commands.add('inputTransactionDiscount', (percent, dollar, setToPrice, currentReason) => {
    if (percent !== null) {
        tags.transactionDiscountAmountInputBox().click()
            .type(percent)
    } else if (currentReason.label !== 'Package Price Discount') {
        tags.transactionDiscountDollarButton().click()
        tags.transactionDiscountAmountInputBox().click()
            .type(dollar)
    } else {
        tags.transactionDiscountAmountInputBox().click()
            .type(setToPrice)
    }
})

Cypress.Commands.add('applyTransactionDiscount', (originalRequest, percentDifference, associate, appliedDiscounts, total, returnPrice, setTwoAppliedDiscounts, setTwoReturnPrice, setTwoTotal) => {
    cy.generateDynamicResponses(originalRequest, percentDifference, appliedDiscounts, total, returnPrice, setTwoAppliedDiscounts, setTwoReturnPrice, setTwoTotal)
    if (associate === 'cashier') {
        cy.intercept('**/Discount/**', { statusCode: 428, body: percentDollarDiscountResp }).as('managerPendingResp')
        tags.transactionDiscountApplyButton().click()
        cy.wait('@managerPendingResp')
    } else {
        cy.intercept('**/Discount/**', { body: managerLoginPercentDollarDiscountResp }).as('discountAppliedResp')
        tags.transactionDiscountApplyButton().click()
        cy.wait('@discountAppliedResp')
    }
})

Cypress.Commands.add('managerApproval', (appliedDiscounts, total, returnPrice,) => {
    cy.generateDynamicResponses(null, null, appliedDiscounts, total, returnPrice, null, null, null)
    tags.managerOverrideAssociateId().click()
        .type(managerNumber, { force: true })
    tags.managerOverrideAssociatePin().type(managerPIN, { force: true }).then(() => {
        tags.managerOverrideDeclineButton().should('be.visible')
        tags.managerOverrideApplyButton().waitForMOApplyButtonColorChangeThenClick('**/Discount/Transaction/', managerApprovalResp)
    })
})

context('Transaction discount tests', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
        cy.addItemOrLoyalty(shoeUPC, shoeResponse)
        tags.transactionDiscountButton().should('be.visible')
            .click()
    })
    it('Test 1: discount modal has correct verbiage and buttons  ', () => {
        let reasonCount = 0
        reasons.forEach((currentReason) => {
            cy.selectTransactionDiscountReason(currentReason)
            tags.transactionDiscountCloseButton().should('be.visible')
            if (currentReason.label === 'Coupon Discount') {
                tags.transactioDiscountModalNextButton().should('be.visible')
                    .and('not.have.css', 'background-color', 'rgb(197, 113, 53)') // NEXT button disabled
                tags.transactionDiscountCouponInputBox().click()
                    .type('cc123456')
                tags.transactioDiscountModalNextButton().should('be.visible')
                    .and('have.css', 'background-color', 'rgb(197, 113, 53)')
            } else {
                tags.transactioDiscountModalNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
            }
            reasonCount++
        })
        expect(reasonCount).to.eq(reasons.length)
    })
    it('Test 2: validate back button and verbiage on modal page 2', () => {
        reasons.forEach((currentReason) => {
            cy.selectTransactionDiscountReason(currentReason)
            if (currentReason.label === 'Coupon Discount') {
                tags.transactionDiscountCouponInputBox().click()
                    .type('cc123456')
            }
            tags.transactioDiscountModalNextButton().click()
            tags.transactionDiscountModalTitle().should('have.text', ' DISCOUNT ON TRANSACTION')
            tags.backButton().click()
            tags.transactionDiscountModalTitle().should('have.text', 'REASON FOR DISCOUNTING?')
        })
    })

    let groupOneTestNumbers = 3
    reasons.forEach((currentReason, index) => {
        if (index === 0 | index == 1) {
            const associate = 'cashier'
            const percentDisc = 20
            const percentDifference = 20
            const discountAmount = -26.0
            const returnPrice = 103.99
            let additionalDetail
            let discountDescription
            let total
            let appliedDiscounts
            if (currentReason.label === 'Manager Discount') {
                additionalDetail = "pendingManagerID"
                discountDescription = "Manager Discount (20% Off)"
                appliedDiscounts = [{ "discountId": "99999992", "discountDescription": discountDescription, "discountAmount": discountAmount, "discountBasePrice": 1 }]

            } else {
                additionalDetail = "c123456"
                discountDescription = "Coupon Override (20% Off)"
                appliedDiscounts = [{ "discountId": "99999994", "discountDescription": discountDescription, "discountAmount": discountAmount, "couponCode": "PC123456", "discountBasePrice": 1 }]
            }
            total = { "subTotal": Number(103.99), "tax": 0.0, "grandTotal": Number(103.99), "changeDue": 0.0, "remainingBalance": Number(103.99), "taxSummaries": [] }
            let originalRequest = { "reason": Number(currentReason.value), "type": Number(1), "amount": Number(20.0), "additionalDetail": additionalDetail }
            let testTitle = "Test " + groupOneTestNumbers + ': ' + currentReason.label + ' triggers MO if cashier has logged in for % amount'
            it(testTitle, () => {
                cy.selectTransactionDiscountReason(currentReason)
                if (currentReason.label === 'Coupon Discount') {
                    tags.transactionDiscountCouponInputBox().click()
                        .type('cc123456')
                }
                tags.transactioDiscountModalNextButton().click()
                cy.inputTransactionDiscount(percentDisc, null, null, currentReason)
                tags.transactionDiscountApplyButton().should('have.css', 'background-color', 'rgb(187, 88, 17)')
                cy.applyTransactionDiscount(originalRequest, percentDifference, associate)
                tags.managerOverrideModal().should('contains.text', 'Reason Code: ' + currentReason.label)
                tags.managerOverrideModal().should('contains.text', 'Requested discount: 20% off $129.99 = $103.99')
                cy.managerApproval(appliedDiscounts, total, returnPrice)
                tags.itemDiscountDescription().should('have.text', discountDescription)
            })
            groupOneTestNumbers++
        }
    })

    let groupTwoTestNumbers = 5
    reasons.forEach((currentReason) => {
        const associate = 'cashier'
        const dollarDisc = 30
        const setToPrice = 10000
        let returnPrice = 99.99
        let percentDifference = 23.08
        let discountAmount = -30.0
        let type = 0
        let amount = 30.0
        let discountDescription
        let additionalDetail
        let total
        let appliedDiscounts
        if (currentReason.label === 'Manager Discount') {
            additionalDetail = "pendingManagerID"
            discountDescription = "Manager Discount ($30.00 Off)"
            appliedDiscounts = [{ "discountId": '99999991', "discountDescription": discountDescription, "discountAmount": discountAmount, "discountBasePrice": 1 }]
            total = { "subTotal": Number(99.99), "tax": 0.0, "grandTotal": Number(99.99), "changeDue": 0.0, "remainingBalance": Number(99.99), "taxSummaries": [] }
        } if (currentReason.label === 'Coupon Discount') {
            additionalDetail = "c123456"
            discountDescription = "Coupon Override ($30.00 Off)"
            appliedDiscounts = [{ "discountId": '99999993', "discountDescription": discountDescription, "discountAmount": discountAmount, "couponCode": "PC123456", "discountBasePrice": 1 }]
            total = { "subTotal": Number(99.99), "tax": 0.0, "grandTotal": Number(99.99), "changeDue": 0.0, "remainingBalance": Number(99.99), "taxSummaries": [] }
        }
        if (currentReason.label === 'Package Price Discount') {
            discountDescription = "Package Price ($100.00)"
            percentDifference = 23.07
            returnPrice = 100.0
            type = 2
            discountAmount = -29.99
            amount = 100.0
            appliedDiscounts = [{ "discountId": '99999995', "discountDescription": discountDescription, "discountAmount": discountAmount, "discountBasePrice": 1 }]
            total = { "subTotal": Number(100), "tax": 0.0, "grandTotal": Number(100), "changeDue": 0.0, "remainingBalance": Number(100), "taxSummaries": [] }
        }
        let originalRequest = { "reason": Number(currentReason.value), "type": Number(type), "amount": Number(amount), "additionalDetail": additionalDetail }
        let testTitle = "Test " + groupTwoTestNumbers + ': ' + currentReason.label + ' MO flow when cashier has logged in and provides $ amount discount'
        if (currentReason.label === 'Package Price Discount') {
            testTitle = "Test " + groupTwoTestNumbers + ': ' + currentReason.label + ' MO flow when cashier has logged in and set transaction price over the threshold'
        }
        it(testTitle, () => {
            cy.selectTransactionDiscountReason(currentReason)
            if (currentReason.label === 'Coupon Discount') {
                tags.transactionDiscountCouponInputBox().click()
                    .type('cc123456')
            }
            tags.transactioDiscountModalNextButton().click()
            cy.inputTransactionDiscount(null, dollarDisc, setToPrice, currentReason)
            cy.applyTransactionDiscount(originalRequest, percentDifference, associate)
            tags.managerOverrideModal().should('contains.text', 'Reason Code: ' + currentReason.label)
            if (currentReason.label === 'Package Price Discount') {
                tags.managerOverrideModal().should('contains.text', 'Requested discount: $29.99 off $129.99 = $100.00')
            } else {
                tags.managerOverrideModal().should('contains.text', 'Requested discount: $30.00 off $129.99 = $99.99')
            }
            cy.managerApproval(appliedDiscounts, total, returnPrice)
            tags.itemDiscountDescription().should('have.text', discountDescription)
        })
        groupTwoTestNumbers++
    })
})

// test when manager logged in  - no MO prompt
context('MO does not prompt if manager is logged in', () => {

    beforeEach(() => {
        cy.launchPage()
        cy.login(managerNumber, managerPIN, null, true)
        cy.addItemOrLoyalty(shoeUPC, shoeResponse)
        tags.transactionDiscountButton().should('be.visible')
            .click()
    })

    let groupOneTestNumbers = 8
    reasons.forEach((currentReason, index) => {
        if (index === 0 | index == 1) {
            const associate = 'manager'
            const percentDisc = 20
            const discountAmount = -26.0
            const setTwoReturnPrice = 103.99
            let discountId
            let discountDescription
            let setTwoTotal
            let setTwoAppliedDiscounts
            if (currentReason.label === 'Manager Discount') {
                discountDescription = "Manager Discount (20% Off)"
                discountId = 99999992
                setTwoAppliedDiscounts = [{ "discountId": discountId, "discountDescription": discountDescription, "discountAmount": discountAmount, "discountBasePrice": 1 }]
            } else {
                discountDescription = "Coupon Override (20% Off)"
                discountId = 99999994
                setTwoAppliedDiscounts = [{ "discountId": discountId, "discountDescription": discountDescription, "discountAmount": discountAmount, "couponCode": "PC123456", "discountBasePrice": 1 }]
            }
            setTwoTotal = { "subTotal": Number(103.99), "tax": 0.0, "grandTotal": Number(103.99), "changeDue": 0.0, "remainingBalance": Number(103.99), "taxSummaries": [] }
            let testTitle = "Test " + groupOneTestNumbers + ': ' + currentReason.label + ' flow without MO when manager logged in and enters % amount'
            it(testTitle, () => {
                cy.selectTransactionDiscountReason(currentReason)
                if (currentReason.label === 'Coupon Discount') {
                    tags.transactionDiscountCouponInputBox().click()
                        .type('cc123456')
                }
                tags.transactioDiscountModalNextButton().click()
                cy.inputTransactionDiscount(percentDisc, null, null, currentReason)
                cy.applyTransactionDiscount(null, null, associate, null, null, null, setTwoAppliedDiscounts, setTwoReturnPrice, setTwoTotal)
                tags.itemDiscountDescription().should('have.text', discountDescription)
            })
            groupOneTestNumbers++
        }
    })


    let groupTwoTestNumbers = 10
    reasons.forEach((currentReason) => {
        const associate = 'manager'
        const dollarDisc = 30
        const setToPrice = 10000
        let setTwoReturnPrice = 99.99
        let discountDescription
        let setTwoTotal
        let setTwoAppliedDiscounts

        if (currentReason.label === 'Manager Discount') {
            discountDescription = "Manager Discount ($30.00 Off)"
            setTwoAppliedDiscounts = [{ "discountId": '99999991', "discountDescription": discountDescription, "discountAmount": -30.0, "discountBasePrice": 1 }]
            setTwoTotal = { "subTotal": Number(99.99), "tax": 0.0, "grandTotal": Number(99.99), "changeDue": 0.0, "remainingBalance": Number(99.99), "taxSummaries": [] }

        } if (currentReason.label === 'Coupon Discount') {
            discountDescription = "Coupon Override ($30.00 Off)"
            setTwoAppliedDiscounts = [{ "discountId": '99999993', "discountDescription": discountDescription, "discountAmount": -30.0, "couponCode": "PC123456", "discountBasePrice": 1 }]
            setTwoTotal = { "subTotal": Number(99.99), "tax": 0.0, "grandTotal": Number(99.99), "changeDue": 0.0, "remainingBalance": Number(99.99), "taxSummaries": [] }
        }
        if (currentReason.label === 'Package Price Discount') {
            discountDescription = "Package Price ($100.00)"
            setTwoReturnPrice = 100.0
            setTwoAppliedDiscounts = [{ "discountId": '99999995', "discountDescription": discountDescription, "discountAmount": -29.99, "discountBasePrice": 1 }]
            setTwoTotal = { "subTotal": Number(100), "tax": 0.0, "grandTotal": Number(100), "changeDue": 0.0, "remainingBalance": Number(100), "taxSummaries": [] }
        }
        let testTitle = "Test " + groupTwoTestNumbers + ': ' + currentReason.label + ' flow without MO when manager logged in and enters $ amount'
        if (currentReason.label === 'Package Price Discount') {
            testTitle = "Test " + groupTwoTestNumbers + ': ' + currentReason.label + ' flow without MO when manager logged in and set transaction price under the threshold'
        }
        it(testTitle, () => {
            cy.selectTransactionDiscountReason(currentReason)
            if (currentReason.label === 'Coupon Discount') {
                tags.transactionDiscountCouponInputBox().click()
                    .type('cc123456')
            }
            tags.transactioDiscountModalNextButton().click()
            cy.inputTransactionDiscount(null, dollarDisc, setToPrice, currentReason)
            cy.applyTransactionDiscount(null, null, associate, null, null, null, setTwoAppliedDiscounts, setTwoReturnPrice, setTwoTotal)
            tags.itemDiscountDescription().should('have.text', discountDescription)
        })
        groupTwoTestNumbers++
    })
})
