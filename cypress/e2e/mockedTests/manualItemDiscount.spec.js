/// < reference types="cypress"/>
import elements from '../../support/pageElements'
import shoeResponse from '../../fixtures/items/brooksRunningShoeResponse.json'
import itemDiscountResponses from '../../fixtures/itemDiscountResponses.json'

let testTitle
const tags = new elements()
const shoeUPC = Cypress.env().runningShoesUPC
const promptForPrice = Cypress.env().promptForPriceUPC
const itemDeleteAfterDiscountResp = JSON.parse(JSON.stringify(itemDiscountResponses.itemDeleteAfterDiscountResp))
const promptForPriceResp = JSON.parse(JSON.stringify(itemDiscountResponses.promptForPriceResp))

const reasons = [
    { label: 'Customer Service', enum: '13' },
    { label: 'Blemished Item', enum: '2' },
    { label: 'As-Is', enum: '11' },
    { label: 'Competitor Price Match', enum: '1' },
    { label: 'Website Match', enum: '14' },
    { label: 'Incorrect Sign', enum: '4' },
    { label: 'Incorrect Ticket', enum: '5' }
]
const methods = [
    { label: 'Percent or Dollar Off', value: '0' },
    { label: 'Coupon Discount', value: '1' },
    { label: 'Manual Price Entry', value: '2' },
]
context('Manual item discount tests', () => {

    beforeEach(() => {
        cy.launchPageLoggedIn()
        cy.addItemOrLoyalty(shoeUPC, shoeResponse)
        tags.editItem0().should('be.visible')
            .click()
        tags.itemDiscount().should('be.visible')
            .click()
    })

    it('Test 1: Validate the number of reasons displaying in the dropdown', () => {
        let reasonCount = 0
        reasons.forEach((currentReason) => {
            cy.selectReason(currentReason)
            reasonCount++
        })
        expect(reasonCount).to.equal(reasons.length)
    })

    // MO Modal Validation for % amount discount for 1 reason and all methods over threshold test from 2 to 3
    let groupOneTestNumber = 2
    methods.forEach((method, index) => {
        if (index === 0 | index === 1) {
            const percentDiscount = 25
            const percentDifference = 25.00
            const price = 97.49
            const threshold = 'over'
            const currentReason = reasons[0]
            let originalRequest
            let discountDescription
            // generated the response to intercept the call in each iteration

            if (method.label === 'Percent or Dollar Off') {
                originalRequest = { "reason": Number(reasons[0].enum), "type": Number(1), "amount": Number(percentDiscount) }
                discountDescription = reasons[0].label + '( 25% Off)'
            } else if (method.label === 'Coupon Discount') {
                originalRequest = { "reason": Number(reasons[0].enum), "type": Number(1), "amount": Number(percentDiscount), "additionalDetail": "C123456" }
                discountDescription = 'Coupon#: C123456'
            }
            testTitle = 'Test ' + groupOneTestNumber + ': Add % amount (over threshold) in input box for reason ' + currentReason.label + ' and method ' + method.label
            it(testTitle, () => {
                cy.selectReason(currentReason)
                tags.itemDiscountModalNextButton().click()
                cy.selectMethod(method)
                cy.applyItemDiscountForMethod(method, percentDiscount, null, null, discountDescription, originalRequest, threshold, currentReason, price, percentDifference)
                tags.itemDiscountDescription().should('contains.text', discountDescription)
                tags.priceItem1().should('have.text', '97.49')
                tags.editItem0().should('be.visible')
                    .click()
                tags.editItem().should('have.text', 'Not Eligible for Edit Price')
            })
            groupOneTestNumber++
        }
    })

    // Group 2 - under threshold - Validating % discount applying for reasons and methods tests ranging from test# 4 to test 6
    let groupTwoTestNumbers = 4
    methods.forEach((method, index) => {
        const percentDiscount = 15
        let discountDescription
        const currentReason = reasons[1]
        if (method.label === 'Coupon Discount') {
            discountDescription = 'Coupon#: C123456'
        } else {
            discountDescription = currentReason.label + '(15% Off)'
        }
        if ((index + 1) % 3 === 0) {
            testTitle = 'Test ' + groupTwoTestNumbers + ': % input box disabled for method ' + method.label + ' when reason is ' + currentReason.label
        } else {
            testTitle = 'Test ' + groupTwoTestNumbers + ': Apply %(under threshold) discount for reason ' + currentReason.label + ' and method ' + method.label
        }
        it(testTitle, () => {
            cy.selectReason(currentReason)
            tags.itemDiscountModalNextButton().click()
            cy.selectMethod(method)
            cy.applyItemDiscountForMethod(method, percentDiscount, null, null, discountDescription, null, 'under', currentReason, null, null)
            if (method.label === 'Manual Price Entry') {
                tags.itemDiscountPercentButton().should('have.attr', 'aria-disabled', 'true')
                tags.itemDiscountDollarButton().should('have.text', 'DOLLAR')
                tags.backButton().should('be.visible')
            } else {
                tags.itemDiscountDescription().should('contains.text', discountDescription)
                tags.priceItem1().should('have.text', '110.49')
                tags.editItem0().should('be.visible')
                    .click()
                tags.editItem().should('have.text', 'Not Eligible for Edit Price')
            }
        })
        groupTwoTestNumbers++
    })

    // Group 3 - Over threshold - MO Modal Validation for $ amount discount for 1 reason and all methods over threshold test from 7 to test# 9
    let groupThreeTestNumbers = 7
    methods.forEach((method) => {
        const dollarDiscount = 40.0
        const percentDifference = 30.7715
        const price = 89.99
        const setToPrice = 8999  // set subtotal to price $89.99
        const currentReason = reasons[2]
        // generated the response to intercept the call in each iteration
        let originalRequest
        let discountDescription
        if (method.label === 'Percent or Dollar Off') {
            originalRequest = { "reason": Number(currentReason.enum), "type": Number(0), "amount": Number(dollarDiscount) }
            discountDescription = currentReason.label + ' ($40 Off)'
        } else if (method.label === 'Coupon Discount') {
            originalRequest = { "reason": Number(currentReason.enum), "type": Number(0), "amount": 40.0, "additionalDetail": "C123456" }
            discountDescription = 'Coupon#: C123456'
        } else {
            originalRequest = { "reason": Number(currentReason.enum), "type": Number(2), "amount": 89.99 }
            discountDescription = currentReason.label + ' Current $129.99'
        }
        testTitle = 'Test ' + groupThreeTestNumbers + ': Add $ amount (Over threshold) in input box for reason ' + currentReason.label + ' and method ' + method.label
        it(testTitle, () => {
            cy.selectReason(currentReason)
            tags.itemDiscountModalNextButton().click()
            cy.selectMethod(method)
            cy.applyItemDiscountForMethod(method, null, dollarDiscount, setToPrice, discountDescription, originalRequest, 'over', currentReason, price, percentDifference)
            tags.itemDiscountDescription().should('contains.text', discountDescription)
            tags.priceItem1().should('have.text', '89.99')
            tags.editItem0().should('be.visible')
                .click()
            tags.editItem().should('have.text', 'Not Eligible for Edit Price')
        })
        groupThreeTestNumbers++
    })
    // Validating MO is not prompting for $ amount under threshold & is applying discount for all methods, only any 1 reason test# 10 to test# 12 
    // Second part is validating that after discount, item can be deleted
    let groupFourTestNumbers = 10
    methods.forEach((method) => {
        const dollarDiscount = 15
        const setToPrice = 114.99  // set subtotal to price $114.99
        let discountDescription
        let currentReason = reasons[3]
        // generated the response to intercept the call in each iteration
        if (method.label === 'Manual Price Entry') {
            discountDescription = currentReason.label + 'Current $129.99'
        } else if (method.label === 'Coupon Discount') {
            discountDescription = 'Coupon#: C123456'
        } else {
            discountDescription = currentReason.label + '($15 Off)'
        }
        testTitle = 'Test ' + groupFourTestNumbers + ': Add $ amount (under threshold) in input box for reason ' + currentReason.label + ' and method ' + method.label
        it(testTitle, () => {
            cy.selectReason(currentReason)
            tags.itemDiscountModalNextButton().click()
            cy.selectMethod(method)
            cy.applyItemDiscountForMethod(method, null, dollarDiscount, setToPrice, discountDescription, null, 'under', currentReason, null, null)
            tags.itemDiscountDescription().should('contains.text', discountDescription)
            tags.priceItem1().should('have.text', '114.99')
            tags.editItem0().should('be.visible')
                .click()
            tags.editItem().should('have.text', 'Not Eligible for Edit Price')
            cy.intercept('**/Product/**', { body: itemDeleteAfterDiscountResp }).as('itemDeleted')
            tags.deleteItem().click()
            cy.wait('@itemDeleted')
            tags.omniScan().should('be.visible')
        })
        groupFourTestNumbers++
    })
    it('Test 13: Validate Discount button would open item discount modal and page 1 has correct verbiage ', () => {
        tags.itemDiscountModalTitle().should('contain.text', 'REASON FOR DISCOUNTING?')
        tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
        tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.breadcrumb(3).should('have.css', 'background-color', 'rgb(196, 196, 196)')
        tags.itemDiscountModalReasonPicker().should('be.visible')
            .should('contain.text', 'Select Reason Why')
        tags.itemDiscountModalNextButton().should('be.visible')
            .should('have.css', 'background-color', 'rgb(200, 200, 200)')
            .should('have.text', 'NEXT')
        tags.itemDiscountModalCloseButton().should('be.visible')
            .click()
    })
    it('Test 14: Validate verbiage & all reasons appearing on clicking - select reason why ', () => {
        reasons.forEach((currentReason) => {
            cy.selectReason(currentReason).should('have.value', currentReason.enum)
            tags.itemDiscountModalNextButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
            tags.itemDiscountModalCloseButton().should('be.visible')
        })
    })
    it('Test 15: Validate verbiage on modal page 2', () => {
        tags.itemDiscountModalReasonPicker().select('Customer Service')
        tags.itemDiscountModalNextButton().click()
        methods.forEach((method) => {
            cy.selectMethod(method).should('have.value', method.value)
            tags.itemDiscountModalCloseButton().should('be.visible')
            tags.itemDiscountModalTitle().should('have.text', 'DISCOUNT ITEM METHOD')
            tags.breadcrumb(1).should('have.css', 'background-color', 'rgb(0, 141, 117)')
            tags.breadcrumb(2).should('have.css', 'background-color', 'rgb(0, 141, 117)')
            tags.breadcrumb(3).should('have.css', 'background-color', 'rgb(196, 196, 196)')
            tags.itemDiscountModalPage2NextButton().should('be.visible')
                .should('have.text', 'NEXT')
            tags.itemDiscountModalCloseButton().should('be.visible')
            tags.backButton().should('be.visible')
        })
    })
    it('Test 16: item discount is not enabled for items that prompt for price', () => {
        tags.itemDiscountModalCloseButton().click()
        cy.addItemOrLoyalty(promptForPrice, promptForPriceResp)
        tags.itemPriceInput().type('50.00 {enter}')
        tags.editItem0().should('be.visible')
            .click()
        tags.itemDiscount().should('have.text', 'Not Eligible For Discount')
    })
})