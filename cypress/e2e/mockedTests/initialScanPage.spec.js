/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Initial scan page tests', () => {
  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  const tags = new elements()

  it('Test 1: Scan page should show the DSG logo', () => {
    tags.dsgLogo().should('be.visible')
    cy.get('body').should('contain.text', 'Hello, Johnny!')
    tags.registerFunctions().should('be.visible')
    tags.productLookupFooterButton().should('be.visible')
    tags.receiptOptions().should('be.visible')
    tags.feedback().should('be.visible')
    tags.giftCardBalanceInquiryButton().should('be.visible')
    tags.returnsFooterButton().should('be.visible')
    tags.teammateButton().should('be.visible')
    tags.signout().should('be.visible')
    tags.omniScan().should('be.visible')
  })

  it('Test 2: The dsg logo should reveal the register details', () => {
    tags.dsgLogo().click()
    tags.storeNumber().should('be.visible')
    tags.registerNumber().should('be.visible')
    tags.reactBuild().should('be.visible')
    tags.launcherBuild().should('be.visible')
      .should('contain.text', 'web')
    tags.posMode().should('be.visible')
      .should('contain.text', 'Online')
  })
})
