/// <reference types="cypress" />
import elements from '../../support/pageElements'
import shoeResponse from '../../fixtures/items/brooksRunningShoeResponse.json'
import shoeAndCouponResponse from '../../fixtures/items/runningShoesAndExpiredCouponResponse.json'
import couponResponse from '../../fixtures/coupon/expiredCouponResponse.json'
import priceOverrideApproved from '../../fixtures/managerOverride/approvedForShoePriceChange.json'
import couponRemoved from '../../fixtures/managerOverride/couponRemovedResponse.json'
import noReceiptReturnResp from '../../fixtures/return/addNoReceiptReturnItems.json'
import managerOverrideApproved from '../../fixtures/managerOverride/managerOverrideApprovedResp.json'
import managerOverrideDecline from '../../fixtures/managerOverride/managerOverrideDecline.json'
import managerOverrideInvalidPin from '../../fixtures/managerOverride/managerOverrideInvalidPin.json'
import managerOverrideNotManager from '../../fixtures/managerOverride/managerOverrideInvalidPin.json'

const tags = new elements()
const shoeUPC = Cypress.env().runningShoesUPC
const expiredCoupon = Cypress.env().overrideExpiredCoupon
const managerNumber = Cypress.env().warrantySellingAssociateNum
const managerPIN = Cypress.env().warrantySellingAssociatePIN
const associateNumber = Cypress.env().associateNum
const associatePIN = Cypress.env().associatePIN


context('Omnisearch tests', () => {

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.addItemOrLoyalty(shoeUPC, shoeResponse)
    cy.addItemOrLoyalty(expiredCoupon, shoeAndCouponResponse)
    cy.intercept('PATCH', '**/Coupon', {
      body: couponResponse,
      headers: {
        'Access-Control-Expose-Headers': 'manager-override-info',
        'Manager-Override-Info': '[{"ManagerOverrideType":0,"ManagerOverrideData":"{\\"CouponCode\\":\\"P00045194\\",\\"DiscountAmount\\":10.0}"}]',
      }
    }).as('promptForManagerOverride')
    tags.couponOverrideButton().click()
    cy.wait('@promptForManagerOverride')
  })

  it('Test 1: Validate manager credentials in MO prompt applies expired coupon', () => {
    tags.managerOverrideAssociateId().type(managerNumber)
    tags.managerOverrideAssociatePin().type(managerPIN)
    cy.intercept('POST', '**/ManagerOverride', { body: priceOverrideApproved }).as('overrideApproved')
    tags.managerOverrideApplyButton().click()
    cy.wait('@overrideApproved')
  })

  it('Test 2: Bad manager password displays appropriate error message', () => {
    tags.managerOverrideAssociateId().type(managerNumber)
    tags.managerOverrideAssociatePin().type(associatePIN)
    cy.intercept(
      {
        method: 'POST',
        url: '**/ManagerOverride'
      }, managerOverrideInvalidPin).as('overrideUnapproved')
    tags.managerOverrideApplyButton().click()
    cy.wait('@overrideUnapproved').its('response.statusCode').should('eq', 422)
    tags.managerOverrideModal().should('contain.text', 'Sorry, something went wrong. Please check your Associate ID and PIN and try again.')
  })

  it('Test 3: Bad manager number with good pin displays appropriate message', () => {
    tags.managerOverrideAssociateId().type(associateNumber)
    tags.managerOverrideAssociatePin().type(managerPIN)
    cy.intercept(
      {
        method: 'POST',
        url: '**/ManagerOverride'
      }, managerOverrideNotManager).as('overrideUnapproved')
    tags.managerOverrideApplyButton().click()
    cy.wait('@overrideUnapproved').its('response.statusCode').should('eq', 422)
    tags.managerOverrideModal().should('contain.text', 'Sorry, something went wrong. Please check your Associate ID and PIN and try again.')

  })

  it('Test 4: Declining the manager override does not apply the coupon', () => {
    tags.managerOverrideAssociateId().type(managerNumber)
    tags.managerOverrideAssociatePin().type(managerPIN)
    cy.intercept('DELETE', '**/Coupon/Remove**', { body: couponRemoved }).as('couponRemoved')
    tags.managerOverrideDeclineButton().click()
    cy.wait('@couponRemoved')
    tags.transactionCard().should('contain.text', "Brooks Women’s Addiction 13")
    tags.subtotal().should('have.text', '129.99')
  })
})
// Manager oevrride for no receipt returns
context('Manager Override for no receipt return', () => {

  beforeEach(() => {
    cy.launchPageLoggedIn()
    cy.performNoReceiptReturn(null, 'No')
    cy.intercept('POST', '**/Returns/AddNonReceiptedReturnItems ', {
      body: noReceiptReturnResp,
      headers: {
        'Access-Control-Expose-Headers': 'manager-override-info',
        'Manager-Override-Info': '[{"ManagerOverrideType":1,"ManagerOverrideData":"{\\"ReturnTotal\\":42.8}"}]'
      }
    }).as('addNoReceiptReturnItemsToTrx')
    tags.confirmReturnsButton().click()
    cy.wait('@addNoReceiptReturnItemsToTrx')
  })

  it('Tests 1: Validate no receipt return items added in the transaction with valid Manager credentials', () => {
    tags.managerOverrideAssociateId().click()
      .type(managerNumber, { force: true })
    tags.managerOverrideAssociatePin().type(managerPIN, { force: true }).then(() => {
      tags.managerOverrideApplyButton().waitForMOApplyButtonColorChangeThenClick('**/ManagerOverride', managerOverrideApproved)
    })
    tags.managerOverrideModal().should('not.exist')
    tags.returnItemRow1().eq(0).should('be.visible')
    tags.returnItemRow1().eq(1).should('be.visible')
    tags.omniScan().should('exist')
    tags.voidButton().should('exist')
    tags.complete().should('have.css', 'background-color', 'rgb(0, 101, 84)')
    tags.returnsFooterButton().should('be.visible')
      .should('have.attr', 'aria-disabled', 'true')
  })
  it('Tests 2: Validate no receipt return MO throws error with invalid Manager credentials', () => {
    tags.managerOverrideAssociateId().click()
      .type(managerNumber, { force: true })
    tags.managerOverrideAssociatePin().type(associatePIN, { force: true }).then(() => {
      tags.managerOverrideDeclineButton().should('be.visible')
      tags.managerOverrideApplyButton().should('be.visible').then(($button) => {
        cy.wrap($button)
          .should('be.visible')
          .and('have.text', 'Apply')
          .then(() => {
            cy.intercept('**/ManagerOverride', managerOverrideInvalidPin).as('overrideUnapproved')
            cy.wrap($button).click()
            cy.wait('@overrideUnapproved').its('response.statusCode').should('eq', 422)
            tags.managerOverrideModal().should('contain.text', 'Sorry, something went wrong. Please check your Associate ID and PIN and try again.')
          })

      })
    })

  })
  it('Test 3: Validate cashier Id will throw error on no receipt return MO modal', () => {
    tags.managerOverrideAssociateId().click()
      .type(associateNumber, { force: true })
    tags.managerOverrideAssociatePin().type(associatePIN, { force: true }).then(() => {
      tags.managerOverrideDeclineButton().should('be.visible')
      tags.managerOverrideApplyButton().waitForMOApplyButtonColorChangeThenClick('**/ManagerOverride', managerOverrideNotManager)
    })
    tags.managerOverrideModal().should('contain.text', 'Sorry, something went wrong. Please check your Associate ID and PIN and try again.')
    tags.managerOverrideModal().should('contains.text', 'Sorry, something went wrong. Please check your Associate ID and PIN and try again.')
    tags.managerOverrideApplyButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
  })
  it('Test 4: Decline on Manager Override will void the transaction', () => {
    cy.intercept('**/Transaction/VoidTransaction', { body: managerOverrideDecline }).as('declineTransaction')
    tags.managerOverrideDeclineButton().click()
    cy.wait('@declineTransaction')
    tags.omniScan().should('be.visible')
    tags.voidButton().should('not.exist')
    tags.helpButton().should('be.visible')
  })
  it('Test 5: Validate verbiage on MO modal is correct', () => {
    tags.managerOverrideModalTitle().should('have.text', 'Manager Override')
    tags.managerOverrideModal().contains('Return without Receipt')
    tags.managerOverrideModal().contains('No receipt returns will require a manager override in order to continue.')
    tags.managerOverrideModal().contains('Requested return: -$42.80 (2 items)')
    tags.managerOverrideDeclineButton().should('be.visible')
    tags.managerOverrideApplyButton().should('be.visible')
    tags.managerOverrideAssociateId().should('be.visible')
    tags.managerOverrideAssociatePin().should('be.visible')
  })
  it('Test 6: Validate Decline is only button enabled when MO prompts', () => {
    tags.managerOverrideDeclineButton().should('have.css', 'background-color', 'rgb(187, 88, 17)')
    tags.managerOverrideApplyButton().should('be.visible')
      .and('have.attr', 'aria-disabled', 'true')
  })
  it('Test 7: Validate autofocus is on associate Id input box when MO modal prompts', () => {
    tags.managerOverrideAssociateId().should('have.attr', 'data-focusvisible-polyfill', 'true')
      .and('be.focused')
  })
  it('Test 8 : Validate Apply button enabled when associate id and pin is entered', () => {
    tags.managerOverrideAssociateId().click()
      .type(managerNumber, { force: true })
    tags.managerOverrideAssociatePin().type(managerPIN, { force: true })
    tags.managerOverrideDeclineButton().should('be.visible')
    tags.managerOverrideApplyButton().should('be.visible')
      .invoke('css', 'background-color')
      .should('eq', 'rgb(0, 101, 84)')
  })
})

context('MO does not prompt if manager is logged in', () => {


  beforeEach(() => {
    cy.launchPage()
    cy.login(managerNumber, managerPIN, null, true)
  })

  it('Test 1: Validate MO for expired coupon do not prompt if manager is logged in ', () => {
    cy.addItemOrLoyalty(shoeUPC, shoeResponse)
    cy.addItemOrLoyalty(expiredCoupon, shoeAndCouponResponse)
    cy.intercept('**/Coupon', { body: couponResponse }).as('couponResp')
    tags.couponOverrideButton().click()
    cy.wait('@couponResp')
  })
  it('Validate MO for no receipt return do not prompt if manager is logged in', () => {
    tags.omniScan().should('be.visible')
    cy.performNoReceiptReturn(null, 'No')
    cy.intercept('POST', '**/Returns/AddNonReceiptedReturnItems ', {
      body: noReceiptReturnResp
    }).as('addNoReceiptReturnItemsToTrx')
    tags.confirmReturnsButton().click()
    cy.wait('@addNoReceiptReturnItemsToTrx')
  })
})
