/// <reference types="cypress" />
import elements from "../../../support/pageElements"

let familynightSale

const tags = new elements()
const crossStoreAssociateID = "1010101"
const dollarOff = 10
const shoes = Cypress.env().runningShoesUPC
const yeti = Cypress.env().yetiTumblerUPC
const items = [shoes, yeti]
const managerNumber = Cypress.env().warrantySellingAssociateNum
const managerPIN = Cypress.env().warrantySellingAssociatePIN

const reasons = [
    { label: 'Manager Discount', value: '0' },
    { label: 'Coupon Discount', value: '1' },
    { label: 'Package Price Discount', value: '2' }
]

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

Cypress.Commands.add('applyTransactionDiscount', (thresholdAmount, currentReason,) => {
    if (currentReason.label === 'Manager Discount') {
        cy.intercept('**/Discount/**').as('managerPendingResp')
        tags.transactionDiscountApplyButton().click()
        cy.wait('@managerPendingResp')
        tags.managerOverrideAssociateId().should('be.visible')
        tags.managerOverrideAssociatePin().should('be.visible')
        cy.managerApprovalForDiscount()

    } else if (thresholdAmount < 20) {
        cy.intercept('**/Discount/**').as('discountAppliedResp')
        tags.transactionDiscountApplyButton().click()
        cy.wait('@discountAppliedResp')
        tags.complete().should('be.visible')
    } else {
        cy.intercept('**/Discount/**').as('managerPendingResp')
        tags.transactionDiscountApplyButton().click()
        cy.wait('@managerPendingResp')
        tags.managerOverrideAssociateId().should('be.visible')
        tags.managerOverrideAssociatePin().should('be.visible')
        cy.managerApprovalForDiscount()

    }
})

Cypress.Commands.add('managerApprovalForDiscount', () => {
    tags.managerOverrideAssociateId().click()
        .type(managerNumber, { force: true })
    tags.managerOverrideAssociatePin().type(managerPIN, { force: true })
    tags.managerOverrideDeclineButton().should('be.visible')
    cy.intercept('**/Discount/Transaction').as('managerApprovedDiscount')
    tags.managerOverrideApplyButton().click()
    cy.wait('@managerApprovedDiscount')
})

Cypress.Commands.add('addDisocuntOnItems', () => {
    cy.get('@managerApprovedDiscount').its('response').then((res) => {
        let totalDiscount = 0
        for (let i = 0; i < (res.body.items.length); i++) {
            let discountOnItem = res.body.items[i].appliedDiscounts[0].discountAmount
            totalDiscount = totalDiscount + discountOnItem
        }
        cy.wrap(totalDiscount).as('discountValue')
    })
})

context('Discount tests', () => {

    beforeEach(() => {
        //  Launch the page.
        cy.onlineLoadPage()
        cy.intercept('**/Configuration/Settings**').as('flagsAndSettings')
        cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
        cy.wait('@flagsAndSettings')
    })

    it('Test 1: Add associate discount in an active transaction', () => {
        if (familynightSale = 'false') {
            tags.teammateButton().click()
            tags.addTeammateToSaleButton().should('be.visible')
            tags.addAssociateDiscountButton().should('be.visible').click()
            cy.intercept('**/OmniSearch').as('associateDiscountResponse')
            tags.addAssociateDiscountInputBox().should('be.visible')
                .click()
                .type(crossStoreAssociateID)
            tags.addAssociateDiscountSubmitButton().click()
            cy.wait('@associateDiscountResponse')
            tags.addAssociateDiscountIcon().should('be.visible')
                .and('have.text', 'Associate discount is successfully applied.')
            cy.intercept('**/OmniSearch').as('addItemToCard')
            tags.omniScan().type(shoes + '{Enter}')
            cy.wait('@addItemToCard')
            tags.addAssociateDiscountDesription().should('have.text', '25% Assoc Disc 1010101')
            tags.discountAmount().should('have.text', ' (-32.50)')
            cy.intercept('**/OmniSearch').as('donationRoundUp')
            cy.pressComplete('online')
            cy.tenderCash(10000)
        }
    })

    it('Test 2: Validate transaction discount would update when item is deleted', () => {
        cy.onlineOmniSearch(items)
        tags.transactionDiscountButton().click()
        tags.transactionDiscountModalReasonPicker().select("Manager Discount")
        tags.transactioDiscountModalNextButton().should('be.visible').click()
        tags.transactionDiscountDollarButton().click()
        tags.transactionDiscountAmountInputBox().type(dollarOff)
        tags.transactionDiscountApplyButton().click()
        cy.managerApprovalForDiscount()
        cy.addDisocuntOnItems()
        cy.get('@discountValue').then((totalDiscount) => {
            expect(totalDiscount).to.eq(- Number(dollarOff))
        })
        tags.editItem2().click()
        tags.deleteItem().click()
        cy.get('@discountValue').then((totalDiscount) => {
            expect(totalDiscount).to.eq(- Number(dollarOff))
        })
        tags.complete().should('be.visible')
            .and('have.css', 'background-color', 'rgb(0, 101, 84)')
        cy.pressComplete('online')
        cy.tenderCash(13000)
        tags.newTransactionButton().should('be.visible')
    })

    // Validate transaction discount can be applied to the transaction for all 3 reasons, 
    // Also, make sure MO prompts for over threshold and doesn't prompt for under threshold

    const inputDiscount = [
        { dollar: '10' },
        { dollar: '60' },
        { setToPrice: '15000' },
        { setToPrice: '10000' }
    ]
    let groupOneTestNumbers = 1
    inputDiscount.forEach((currentInputDiscount, index) => {
        reasons.forEach((currentReason) => {
            let testTitle
            let cashTender
            let subtotalAfterDiscount
            let thresholdAmount
            let currentDollar = Number(currentInputDiscount.dollar)
            let currentSetToPrice = Number(currentInputDiscount.setToPrice)
            if (currentReason !== 'Package Price Discount') {
                testTitle = "Test " + groupOneTestNumbers + ': ' + currentReason.label + ' applied for dollar off ' + currentDollar
            } else {
                testTitle = "Test " + groupOneTestNumbers + ': ' + currentReason.label + ' set the price to ' + currentSetToPrice
            }
            if ((currentReason.label === 'Manager Discount' || currentReason.label === 'Coupon Discount') && index < 2 ||
                currentReason.label === 'Package Price Discount' && index >= 2) {
                it(testTitle, () => {
                    cy.onlineOmniSearch(items)
                    cy.wait('@addItem').its('response').then((resp) => {
                        const subtotal = resp.body.transaction.total.subTotal
                        if (currentReason.label !== 'Package Price Discount') {
                            thresholdAmount = ((currentDollar) / subtotal) * 100
                            subtotalAfterDiscount = (subtotal - currentDollar).toFixed(2)
                            cashTender = subtotalAfterDiscount * 2
                        }
                        else {
                            thresholdAmount = (subtotal - parseFloat(currentSetToPrice/100).toFixed(2)) / subtotal * 100
                            subtotalAfterDiscount = Number(currentSetToPrice / 100).toFixed(2)
                            cashTender = subtotalAfterDiscount * 200
                        }
                    }).then(() => {
                        tags.transactionDiscountButton().should('be.visible')
                            .click()
                        cy.selectTransactionDiscountReason(currentReason)
                        if (currentReason.label === 'Coupon Discount') {
                            tags.transactionDiscountCouponInputBox().click()
                                .type('cc123456')
                        }
                        tags.transactioDiscountModalNextButton().click()
                        cy.inputTransactionDiscount(null, currentDollar, currentSetToPrice, currentReason)
                        cy.applyTransactionDiscount(thresholdAmount, currentReason)
                        tags.subtotal().should('have.text', subtotalAfterDiscount)
                        tags.complete().should('be.visible')
                            .and('have.css', 'background-color', 'rgb(0, 101, 84)')
                        cy.pressComplete('online')
                        cy.tenderCash(cashTender)
                        tags.newTransactionButton().should('be.visible')
                    })
                })
                groupOneTestNumbers++
            }
        })
    })
})      
