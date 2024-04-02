/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'

context('Open Register tests', () => {

  const associateNum = Cypress.env().associateNum
  const associatePIN = Cypress.env().associatePIN
  const tumblerUPC = Cypress.env().yetiTumblerUPC
  const tumblerPrice = Cypress.env().yetiTumblerPrice
  const yetiTumblerResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1618433317540,"signature":"4eD/8OevagKShq1WBMV0Y/B40a95YaA8Hy0x9p3aXcY=","transactionKey":"246200087911304142021","tenderIdentifier":"1-246200087911304142021","eReceiptKey":"5008791130009041421013","storeNumber":879,"registerNumber":317,"transactionNumber":9,"startDateTime":"2021-04-14T20:48:37.383631Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.00,"remainingBalance":32.09}},"upc":"888830050118"}'
  const amountDueCashTenderResponseData = '{"header":{"timestamp":1620411017169,"signature":"Oskxw1OQRu1dLhoIx4yAAK2erTbtbAsEIBjfOjspVPY=","transactionKey":"250660087931705072021","tenderIdentifier":"2-250660087931705072021","eReceiptKey":"5008793170011050721016","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-05-07T18:09:44.2628Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":32.09}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":0.0}}'
  const amountDueFinalizeTransactionResponseData = '{"header":{"timestamp":1620411017608,"signature":"a4vB6CkX6uYJOLvL1JxqVrsqcMd+ZNegJzYWo8r2iDE=","transactionKey":"250660087931705072021","tenderIdentifier":"2-250660087931705072021","eReceiptKey":"5008793170011050721016","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-05-07T18:09:44.2628Z","endDateTime":"2021-05-07T18:10:17.5586964Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":2,"transactionStatusDescription":"Complete"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[{"tenderType":1,"tenderTypeDescription":"Cash","amount":32.09}],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":29.99,"tax":2.1,"grandTotal":32.09,"changeDue":0.0,"remainingBalance":0.0}}'
  const tags = new elements()
  let openDrawerCount

  beforeEach(() => {
    cy.activatePeripherals()
  })

  it('Test 1: The cash drawer should pop on a register open.', () => {
    openDrawerCount = 0
    cy.launchPage(false)
    cy.login(associateNum, associatePIN)
    tags.cashDrawerOpenModal().should('be.visible')
      .should('contain.text', 'The cash drawer is open')
      .should('contain.text', 'CLOSE THE CASH DRAWER TO CONTINUE')
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(1)
    })
    tags.omniScan().should('be.visible')
  })

  it('Test 2: After a cash sale, the cash drawer pops open again.', () => {
    openDrawerCount = 0
    cy.launchPage(false)
    cy.login(associateNum, associatePIN)
    tags.cashDrawerOpenModal().should('be.visible')
      .should('contain.text', 'The cash drawer is open')
      .should('contain.text', 'CLOSE THE CASH DRAWER TO CONTINUE')
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(1)
    })
    tags.omniScan().should('be.visible')
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerResponseData)
    const price = Number(tumblerPrice).toFixed(2)
    const tax = helpers.determinTax(price)
    const total = helpers.determinTotal(price, tax)
    cy.pressComplete()
    tags.sportsMatterCampaignNoThanksButton().click()
    tags.tenderMenuCashButton().click()
    cy.intercept('**/Tender/NewCashTender', { body: amountDueCashTenderResponseData }).as('cashAmountDue')
    cy.intercept('**/Transaction/FinalizeTransaction', { body: amountDueFinalizeTransactionResponseData }).as('finalizeTransaction')
    tags.cashInput().click()
      .type(total)
      .type('{enter}')
    cy.wait([ '@cashAmountDue', '@finalizeTransaction' ])
    tags.newTransactionButton().should('not.exist')
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(2)
    })
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
  })

  it('Test 3: On close the cash drawer pops again, and a the cash total is printed.', () => {
    openDrawerCount = 0
    cy.launchPage(false)
    cy.login(associateNum, associatePIN)
    tags.cashDrawerOpenModal().should('be.visible')
      .should('contain.text', 'The cash drawer is open')
      .should('contain.text', 'CLOSE THE CASH DRAWER TO CONTINUE')
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(1)
    })
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerResponseData)
    const price = Number(tumblerPrice).toFixed(2)
    const tax = helpers.determinTax(price)
    const total = helpers.determinTotal(price, tax)
    cy.pressComplete()
    tags.sportsMatterCampaignNoThanksButton().click()
    tags.tenderMenuCashButton().click()
    cy.intercept('**/Tender/NewCashTender', { body: amountDueCashTenderResponseData }).as('cashAmountDue')
    cy.intercept('**/Transaction/FinalizeTransaction', { body: amountDueFinalizeTransactionResponseData }).as('finalizeTransaction')
    tags.cashInput().click()
      .type(total)
      .type('{enter}')
    cy.wait([ '@cashAmountDue', '@finalizeTransaction' ])
    tags.newTransactionButton().should('not.exist')
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(2)
    })
    tags.omniScan().should('be.visible')
    cy.closeRegister()
    tags.cashDrawerOpenModal().should('be.visible')
      .should('contain.text', 'The cash drawer is open')
      .should('contain.text', 'CLOSE THE CASH DRAWER TO CONTINUE')
    cy.window().then((w) => {
      w.closeDrawer = true
      openDrawerCount++
    }).then(() => {
      expect(openDrawerCount).to.eq(3)
    })
    tags.closeRegister().should('not.exist')
    tags.omniScan().should('not.exist')
  })
})
