/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'
import tumblerResponse from '../../fixtures/items/tumbler.json'

const pifTaxSummary = {
  taxType: 'PIF',
  amount: 1
}

const rsfTaxSummary = {
  taxType: 'RSF',
  amount: 2
}

const taxTaxSummary = {
  taxType: 'TAX',
  amount: 3
}

const funTaxSummary = {
  taxType: 'FUN',
  amount: 7
}

const withTaxSummaries = (taxSummaries) => ({
  ...tumblerResponse,
  transaction: {
    ...tumblerResponse.transaction,
    total: {
      ...tumblerResponse.transaction.total,
      taxSummaries: taxSummaries
    }
  }
})

context('Add a sale item by UPC and verify its taxes', () => {
  const tags = new elements
  const tumblerUPC = Cypress.env().yetiTumblerUPC

  beforeEach(cy.launchPageLoggedIn)

  it(`Test 1: Should show regular tax line when we don't have tax summaries`, () => {
    cy.addItemOrLoyalty(tumblerUPC, tumblerResponse)

    const expectedFormattedTax = helpers.formatCurrency(tumblerResponse.transaction.total.tax)
    tags.taxes().should('have.text', expectedFormattedTax)
  })

  it('Test 2: Should not show regular tax line when we have tax summaries', () => {
    cy.addItemOrLoyalty(tumblerUPC, withTaxSummaries([ pifTaxSummary ]))
    tags.taxes().should('not.exist')
  })

  it('Test 3: Should show PIF', () => {
    const expectedTaxValue = helpers.formatCurrency(pifTaxSummary.amount)

    cy.addItemOrLoyalty(tumblerUPC, withTaxSummaries([ pifTaxSummary ]))
    tags.taxSummaryTypeLabel(0).should('have.text', 'Public Improvement Fee (PIF)')
    tags.taxSummaryValue(0).should('have.text', expectedTaxValue)
  })

  it('Test 4: Should show RSF', () => {
    const expectedTaxValue = helpers.formatCurrency(rsfTaxSummary.amount)

    cy.addItemOrLoyalty(tumblerUPC, withTaxSummaries([ rsfTaxSummary ]))
    tags.taxSummaryTypeLabel(0).should('have.text', 'Retail Service Fee (RSF)')
    tags.taxSummaryValue(0).should('have.text', expectedTaxValue)
  })

  it('Test 5: Should show Tax', () => {
    const expectedTaxValue = helpers.formatCurrency(taxTaxSummary.amount)

    cy.addItemOrLoyalty(tumblerUPC, withTaxSummaries([ taxTaxSummary ]))
    tags.taxSummaryTypeLabel(0).should('have.text', 'Tax')
    tags.taxSummaryValue(0).should('have.text', expectedTaxValue)
  })

  it('Test 6: Should show unexpected types', () => {
    const expectedTaxValue = helpers.formatCurrency(funTaxSummary.amount)

    cy.addItemOrLoyalty(tumblerUPC, withTaxSummaries([ funTaxSummary ]))
    tags.taxSummaryTypeLabel(0).should('have.text', 'FUN')
    tags.taxSummaryValue(0).should('have.text', expectedTaxValue)
  })
})
