/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'

context('Register Totals', () => {
  //  Variable declarations
  const tags = new elements()
  let registerTotals

  beforeEach(() => {
    //  Launch the page.
    cy.intercept('**/Configuration/Settings**').as('flagsAndSettings')
    cy.onlineLoadPage()
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
  })

  afterEach(() => {
    cy.onlineCloseRegister(registerTotals)
  })

  it('Test 1: One sale with a single item with donation round up.', () => {
    //  Add item.
    const items = [Cypress.env().yetiTumblerUPC]
    const itemPrices = [Cypress.env().yetiTumblerPrice]
    let exactAmountDue = helpers.tenderExactAmountDue(itemPrices)
    cy.onlineOmniSearch(items)
    let exactAmountDueRoundup = Math.ceil(exactAmountDue)
    cy.intercept('**/OmniSearch').as('donationRoundUp')
    cy.pressComplete('online').then((isSMCampaignOn) => {
      cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup, exactAmountDue)
      if (isSMCampaignOn === true) {
        registerTotals = exactAmountDueRoundup
      } else {
        registerTotals = exactAmountDue
      }
    })
  })

  it('Test 2: One sale with 2 items, one of them deleted, no donation.', () => {
    //  Add item.
    const items = [Cypress.env().yetiTumblerUPC, Cypress.env().golfClubUPC]
    const itemPrices = [Cypress.env().yetiTumblerPrice]
    const exactAmountDue = helpers.tenderExactAmountDue(itemPrices)
    let exactAmountDueRoundup = Math.ceil(exactAmountDue)
    cy.onlineOmniSearch(items)
    tags.editItem2().should('be.visible').click()
    cy.intercept({
      url: '**/Product/Item/**',
      method: 'DELETE'
    }).as('deleteItem')
    tags.deleteItem().click()
    cy.wait('@deleteItem')
    tags.complete().should('be.visible')
    cy.pressComplete('online').then((isSMCampaignOn) => {
      cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup, exactAmountDue)
      if(isSMCampaignOn === true) {
        registerTotals = exactAmountDueRoundup
      } else {
        registerTotals = exactAmountDue
      }
    })
  })

  it('Test 3: One multi-item sale & one voided transaction.', () => {
    //  Multi item sale.
    const items = [Cypress.env().yetiTumblerUPC, Cypress.env().golfClubUPC]
    const itemPrices = [Cypress.env().yetiTumblerPrice, Cypress.env().golfClubPrice]
    const exactAmountDue = helpers.tenderExactAmountDue(itemPrices)
    let exactAmountDueRoundup = Math.ceil(exactAmountDue)
    cy.onlineOmniSearch(items)
    cy.pressComplete('online').then((isSMCampaignOn) => {
      cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup, exactAmountDue)
      if(isSMCampaignOn === true) {
        registerTotals = exactAmountDueRoundup
      } else {
        registerTotals = exactAmountDue
      }
      
    })
    //  Multi item sale 2 voided.
    cy.onlineOmniSearch(items)
    cy.onlineVoidTransaction()
    //  Validate the register totals
    const isSMCampaignOn =  Cypress.env('SMCampaign')
    if (isSMCampaignOn === true) {
     registerTotals = exactAmountDueRoundup
    } else {
      registerTotals = exactAmountDue
    }
  })

  it('Test 4: One multi-item sale & one suspend transaction.', () => {
    //  Multi item sale.
    const items = [Cypress.env().yetiTumblerUPC, Cypress.env().golfClubUPC]
    const itemPrices = [Cypress.env().yetiTumblerPrice, Cypress.env().golfClubPrice]
    const exactAmountDue = helpers.tenderExactAmountDue(itemPrices)
    const isSMCampaignOn =  Cypress.env('SMCampaign')
    let exactAmountDueRoundup = Math.ceil(exactAmountDue)
    cy.onlineOmniSearch(items)
    cy.pressComplete('online')
    cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup, exactAmountDue)
    if(isSMCampaignOn === true) {
      registerTotals = exactAmountDueRoundup
     } else {
       registerTotals = exactAmountDue
     }
    //  Multi item sale 2 suspended.
    cy.onlineOmniSearch(items)
    cy.onlineSuspendTransaction()
    if(isSMCampaignOn === true) {
      registerTotals = exactAmountDueRoundup
     } else {
       registerTotals = exactAmountDue
     }
  })

  it('Test 5: Two multiple item sale transactions.', () => {
    //  Multi item sale.
    const items = [Cypress.env().yetiTumblerUPC, Cypress.env().golfClubUPC]
    const itemPrices = [Cypress.env().yetiTumblerPrice, Cypress.env().golfClubPrice]
    const exactAmountDue = helpers.tenderExactAmountDue(itemPrices)
    const isSMCampaignOn =  Cypress.env('SMCampaign')
    let exactAmountDueRoundup = Math.ceil(exactAmountDue)
    cy.onlineOmniSearch(items)
    cy.pressComplete('online')
    cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup, exactAmountDue)
    if(isSMCampaignOn === true) {
      registerTotals = exactAmountDueRoundup
     } else {
       registerTotals = exactAmountDue
     }
    //  Multi item sale 2 suspended.
    const items2 = [Cypress.env().baseballGloveUPC, Cypress.env().recumbantBikeUPC]
    const itemPrices2 = [Cypress.env().baseballGlovePrice, Cypress.env().recumbantBikePrice]
    const exactAmountDue2 = helpers.tenderExactAmountDue(itemPrices2)
    let exactAmountDueRoundup2 = Math.ceil(exactAmountDue2)
    cy.onlineOmniSearch(items2)
    cy.pressComplete('online')
    cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup2, exactAmountDue2)
    if(isSMCampaignOn === true) {
      registerTotals = Number(exactAmountDueRoundup2) + Number(exactAmountDueRoundup)
     } else {
       registerTotals = Number(exactAmountDue) + Number(exactAmountDue2)
     }
  })

  it('Test 6: Tax exempt sale transaction.', () => {
    //  Add item.
    const items = [Cypress.env().runningShoesUPC]
    const itemPrices = [Cypress.env().runningShoesPrice]
    const isSMCampaignOn =  Cypress.env('SMCampaign')
    let exactAmountDue = helpers.determinSubtotal(itemPrices)
    let exactAmountDueRoundup = Math.ceil(exactAmountDue)
    cy.onlineOmniSearch(items)
    tags.registerFunctions().click()
    tags.taxExemptButton().click()
    cy.intercept('**/TaxExempt').as('validCustomerResponseData')
    tags.taxExemptCustomerInputBox().type('cc00013287 {enter}')
    cy.wait('@validCustomerResponseData')
    cy.pressComplete('online')
    cy.sportsMatterRoundUpTotalDue(exactAmountDueRoundup, exactAmountDue)
    if(isSMCampaignOn === true) {
      registerTotals = exactAmountDueRoundup
    } else {
      registerTotals = exactAmountDue
    }
    
  })

  //  This test will need to be turned on after the fix for bug 9341 is merged into Dev/Stage.
  it.skip('Test 7: Discovered a scenario where the close register button is not available', () => {
    cy.intercept('**/OmniSearch').as('couponCodeResponse')
    tags.omniScan().type(Cypress.env().coupon20off100 + '{enter}')
    cy.wait('@couponCodeResponse')
    tags.complete().should('be.visible')
    cy.intercept('**/Transaction/ActiveTransaction').as('activeTransaction')
    cy.reload()
    cy.wait(1000)
    cy.wait('@activeTransaction')
    cy.get('@activeTransaction').its('response.statusCode').should('eq', 204)
    tags.registerFunctions().click()
    tags.closeRegister().should('be.visible')
  })
})
