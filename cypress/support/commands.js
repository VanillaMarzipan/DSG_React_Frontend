import elements from './pageElements.js'
import returnApproved from '../fixtures/returnAuthResponses/approved.json'
import returnWarned from '../fixtures/returnAuthResponses/warned.json'
import returnDenied from '../fixtures/returnAuthResponses/denied.json'
import configurationResponse from '../fixtures/configurationResponse.json'
import authenticateResponse from '../fixtures/authenticateResponse.json'
import featureFlagResponse from '../fixtures/featureFlagResponse.json'
import featureFlagFamilyNightResponse from '../fixtures/featureFlagFamilyNightResponse.json'
import suspendResponse from '../fixtures/suspendResponse.json'
import closeRegisterResponse from '../fixtures/closeRegisterResponse.json'
import returnAuthApprove from '../fixtures/returnAuthResponses/approved.json'
import loyaltyLookupWrongZipResponse from '../fixtures/loyalty/loyaltyLookupWrongZip'
import yetiWithCouponOverrideResponseData from'../fixtures/coupon/yetiWithCouponOverrideResponse'
import featureFlagVoidFeedback from '../fixtures/feeatureFlagVoidFeedback.json'
import lookUpByPhone from '../fixtures/saleByPhoneLookup/phoneLookupOnInitialScanPage'
import transactionCustomerResponse from '../fixtures/saleByPhoneLookup/transactionCustomerResponse'
import loyaltyDetails from '../fixtures/saleByPhoneLookup/loyaltyDetails'
import lookupByPhoneMultipleAccounts from '../fixtures/saleByPhoneLookup/lookupByPhoneMultipleAccounts'
import loyaltyMulyipleAccountsLookup from '../fixtures/saleByPhoneLookup/loyaltyMulyipleAccountsLookup'
import itemDiscountResponses from '../fixtures/itemDiscountResponses.json'


const tags = new elements()
const DevRegId = Cypress.env().devRegisterIdMacAddress
const StageRegId = Cypress.env().stageRegisterIdMacAddress
const DevRegNum = Cypress.env().devRegisterNumber
const StageRegNum = Cypress.env().stageRegisterNumber
const DevStoreNum = Cypress.env().devStoreNumber
const StageStoreNum = Cypress.env().stageStoreNumber
const phone = Cypress.env().phoneAbeLincoln
const street = Cypress.env().AbeLincolnStreetAddress

let registerId = ''
let regNum = 0
let storeNum = 0
let flags = ''
let managerOverride = ''
let voidFeedbackModal = ''
let donationCampaign = ''
let sportsMatterCampaign = ''
let familynightSale = ''

//  General Commands (launch page, login, add item, void, suspend, and close register)
//* *********************************************************************************************************

//  Determining the environment, and setting the register and store numbers
before(() => {
  if (Cypress.config().baseUrl === 'http://localhost:3000' || Cypress.config().baseUrl === 'http://127.0.0.1:3000' || Cypress.config().baseUrl === 'https://pointofsale-dev.dcsg.com') {
    registerId = DevRegId
    regNum = DevRegNum
    storeNum = DevStoreNum
  }
  if (Cypress.config().baseUrl === 'https://pointofsale-stg.dcsg.com') {
    registerId = StageRegId
    regNum = StageRegNum
    storeNum = StageStoreNum
  }
  return registerId, regNum, storeNum
})

//  Wait for page to load - Online
Cypress.Commands.add('onlineLoadPage', () => {
  let settings = ''
  let settingsArrayLength = ''
  localStorage.setItem('registerId', registerId)
  cy.intercept('**/configuration').as('configuration')
  cy.intercept('**/Register/RegisterNumber/**').as('registerNumber')
  cy.intercept('**/Configuration/Settings**').as('featureFlagsAndSettings')
  cy.visit('/')
  cy.wait('@configuration').its('response.statusCode').should('eq', 200)
  cy.wait('@registerNumber').its('response.statusCode').should('eq', 200)
  cy.get('@registerNumber').its('response.body.registerNumber').should('eq', Number(regNum))
  cy.wait('@featureFlagsAndSettings').its('response').then((response) => {
    flags = response.body.features.data
    donationCampaign = flags.includes('UseSportsMatterCampaignModal')
    settings = response.body.settings.data
    settingsArrayLength = settings.length
    for (let i = 0; i < Number(settingsArrayLength); i ++) {
      if (response.body.settings.data[i].name == 'voidfeedback') {
        voidFeedbackModal = response.body.settings.data[i].value.doNotPrompt
      } 
      if (response.body.settings.data[i].name == 'sportsmattercampaign') {
        sportsMatterCampaign = response.body.settings.data[i].value.campaignActive
        Cypress.env('SMCampaign', sportsMatterCampaign )
      } 
      if (response.body.settings.data[i].name == 'familynight') {
        familynightSale = response.body.settings.data[i].value.familyNight
      }
    }
  })
  cy.get('@registerNumber').its('response').then((res) => {
    if (res.body.state != 0) {
      cy.log('THE REGISTER WAS NOT IN A CLOSED STATE, TRYING TO CLOSE THE REGISTER HERE.')
      cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
      cy.wait(2000)
      cy.get('body').then($body => {
        if ($body.find('[data-testid="remaining-balance"]').length > 0) {
          cy.log('Entering the block of code that shows there was a remaining balance due.')
          tags.tenderMenuCashButton().click()
          tags.cashInputEnter().click()
          tags.newTransactionButton().click()
        }
        if ($body.find('[data-testid="void-button"]').length > 0) {
          cy.log('Entering the block of code that shows the void button.')
          cy.onlineVoidTransaction()
        }
      })
      cy.onlineCloseRegister()
    }
  })
})

//  Wait for page to load - Offline
Cypress.Commands.add('launchPage', (shouldWaitForConfiguration = true) => {
  localStorage.setItem('registerId', registerId)
  cy.intercept('**/configuration', { body: configurationResponse }).as('configuration')
  cy.intercept('**/Register/RegisterNumber/**', {
    body: '{"macAddress":"' + registerId + '","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"state":0,"stateDescription":"Closed"}'
  }).as('registerNumber')
  cy.intercept('**/Configuration/Settings?chain=**', { body: featureFlagResponse }).as('featureFlags')
  cy.visit('/')
  if (shouldWaitForConfiguration) {
    cy.wait('@configuration')
  }
  cy.wait('@registerNumber')
})

Cypress.Commands.add('launchPageLoggedIn', (activeTransaction, familyNightSale, voidFeedbackOn) => {
  let featureFlags = ''
  localStorage.setItem('registerId', registerId)
  localStorage.setItem('authToken', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdG9yZUlkIjoiODc5IiwicmVnaXN0ZXJOdW1iZXIiOiIyMjUiLCJ0aW1lem9uZU9mZnNldCI6Ii0yNDAiLCJhc3NvY2lhdGVJZCI6IjEyMzQ1NjciLCJyb2xlIjoiUG9zIiwibmJmIjoxNjU0MDA3MjkxLCJleHAiOjE2NTQwNTA0OTEsImlhdCI6MTY1NDAwNzI5MX0.Wr_rcPAZtoF4WOa67Tc3y5DsJwNveUiawZrLJ1Qd0ueBgIu-tpeMHdek305QmvKy81FI4p8D6MJiwj_htncyMFUUijqKsqiqQh3Rg6cXUfi_QZ6Z32JZB8yKNrCC7vzzDVKop3waz3HZOrJ6IWh-U9FSLkQ8dtqsA5SScYxxAHuZb7ZYdZ0FsNRQCjdQOPOq_28rr-4rm--xLnHKiCE_rbdyOIQdyXrqtIp0ZjiztvITt82DQvgXFG-53ISLJmyTTJdxaVen6-DFKRQjkrzgwYzYVOZohCQfRB1hnHWHbTDL2k-SyBUP_Y3wPKGZYL9PrX2K8kDrUx_16rxf3ZGKMA')
 localStorage.setItem('associateId', Cypress.env().associateNum)
  localStorage.setItem('lastName', Cypress.env().associateLastName)
  localStorage.setItem('firstName', Cypress.env().associateFirstName)
  localStorage.setItem('authenticated', true)
  localStorage.setItem('registerClosed', false)
  cy.intercept('**/configuration', { body: configurationResponse }).as('configuration')
  cy.intercept('**/Register/RegisterNumber/**', {
    body: '{"macAddress":"' + registerId + '","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"state":1,"stateDescription":"Open"}'
  }).as('registerNumber')
  if (familyNightSale === 'true') {
    featureFlags = featureFlagFamilyNightResponse
  } else if (voidFeedbackOn === 'true') {
    featureFlags = featureFlagVoidFeedback
  } else {
    featureFlags = featureFlagResponse
  }
  cy.intercept('**/Survey/Configuration/', { body: '' }).as('survey')
  cy.intercept('**/Configuration/Settings?chain=**', { body: featureFlags }).as('featureFlags')
  cy.intercept('**/ValidateToken', { responseStatus: 204 }).as('ValidateToken')
  cy.intercept('**/ActiveTransaction', { body: activeTransaction }).as('ActiveTransaction')
  cy.visit('/')
  cy.wait([ '@configuration', '@registerNumber', '@ValidateToken', '@featureFlags', '@survey' ])
  if (activeTransaction != null) {
    cy.wait('@ActiveTransaction')
  }
})

//  Login - Online
Cypress.Commands.add('onlineLogin', (associateNumber, associatePIN) => {
  tags.login().click({ force: true }).focused()
  tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
  tags.login().type(associateNumber, { force: true })
  tags.pin().type(associatePIN, { force: true })
  cy.intercept('**/Register/RegisterNumber/**').as('RegisterNumber')
  cy.intercept('**/Security/Authenticate/').as('authenticate')
  cy.intercept('**/Transaction/ActiveTransaction').as('activeTransaction')
  cy.intercept('**/Register/OpenRegister').as('open')
  tags.loginSubmit().click()
  cy.wait('@RegisterNumber').its('response.statusCode').should('eq', 200)
  cy.wait('@authenticate').its('response.statusCode').should('eq', 200)
  tags.omniScan().should('be.visible')
  tags.registerFunctions().should('be.visible')
  tags.teammateButton().should('be.visible')
  tags.feedback().should('be.visible')
  tags.receiptOptions().should('be.visible')
  tags.giftCardFooterButton().should('be.visible')
  tags.returnsFooterButton().should('be.visible')
})

//  Login - Offline
const cashierAuthenticateResponse = JSON.parse(JSON.stringify(authenticateResponse.cashierAuthenticateResponse))
const managerAuthenticateResponse = JSON.parse(JSON.stringify(authenticateResponse.managerAuthenticateResponse))

Cypress.Commands.add('login', (associateNumber, associatePIN, forPostVoids, Manager) => {
  if (Manager === true) {
    authenticateResponse = managerAuthenticateResponse
  }else {
    authenticateResponse = cashierAuthenticateResponse
  }
  if (forPostVoids === null) {
    forPostVoids = '{"type":"https://tools.ietf.org/html/rfc4918#section-11.2","title":"Unprocessable Entity","status":422,"traceId":"00-b6792ccd032d4642a4473fd4502f1c69-950cd72ca854a149-00"}'
  }
  cy.intercept('**/Register/RegisterNumber/**', {
    body: '{"macAddress":"' + registerId + '","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"state":0,"stateDescription":"Closed"}'
  }).as('registerNumber')
  cy.intercept('**/Register/OpenRegister', {
    body: '{"registerResponse":{"macAddress":"' + registerId + '","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"state":1,"stateDescription":"Open"},"transactionResponse":{"header":{"timestamp":1618424283487,"transactionKey":"245840087911304142021","tenderIdentifier":"1-245840087911304142021","eReceiptKey":"5008791130004041421026","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":14,"startDateTime":"2021-04-14T18:18:03.4049165Z","endDateTime":"2021-04-14T18:18:03.4049165Z","timezoneOffset":-240,"associateId":"1234567","transactionType":2,"transactionTypeDescription":"Open","transactionStatus":2,"transactionStatusDescription":"Complete"}}}'
  }).as('openRegister')
  cy.intercept('**/Security/Authenticate/', { body: authenticateResponse }).as('authenticate')
  cy.intercept('**/Configuration/Settings?chain=**', { body: featureFlagResponse }).as('featureFlags')
  cy.intercept('**/GetLastTransactionDetails', { body: forPostVoids }).as('getLastTrx')
  cy.intercept('**/Transaction/ActiveTransaction', { statusCode: 204 }).as('activeTransaction')
  cy.wait('@featureFlags')
  tags.login().click({ force: true }).focused()
  tags.loginBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
  tags.login().type(associateNumber, { force: true })
  tags.pin().type(associatePIN, { force: true })
  tags.loginSubmit().click()
  cy.wait([ '@registerNumber', '@authenticate', '@openRegister', '@getLastTrx', '@activeTransaction' ])
})

//  online - add items
Cypress.Commands.add('onlineOmniSearch', (items) => {
  const numItems = items.length
  for (let i = 0; i < numItems; i++) {
    cy.intercept('**/OmniSearch**').as('addItem')
    tags.omniScan().click()
      .focused()
    tags.omniScanBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
    tags.omniScan().type(items[i])
      .focused()
    tags.scanSubmit().click()
    cy.wait('@addItem')
    tags.productDetailUPC().should('contain', items[i])
      .should('be.visible')
  }
})

//  Offline - add items
Cypress.Commands.add('omniSearch', (item) => {
  tags.omniScan().click({ force: true }).focused()
  tags.omniScanBorder().should('have.css', 'border-color', 'rgb(0, 101, 84)')
  tags.omniScan().type(item)
  tags.scanSubmit().click()
})

Cypress.Commands.add('sportsMatterModal', () => {
  const isSMCampaignOn = Cypress.env('SMCampaign')
  if (isSMCampaignOn === true) {
    cy.intercept('**/OmniSearch').as('donationRoundUp')
    if (donationCampaign === true) {
      tags.sportsMatterCampaignRoundUpAcceptButton().click()
    } else {
      tags.sportsMatterRoundUpAcceptButton().click()
    }
    cy.wait('@donationRoundUp')
  }
  return cy.wrap(isSMCampaignOn)
})
Cypress.Commands.add('sportsMatterRoundUpTotalDue', (exactAmountDueRoundup, exactAmountDue ) => {
  if(sportsMatterCampaign === true) {
    cy.tenderCash(Number(exactAmountDueRoundup).toFixed(2))
    cy.newTransaction()
  } else {
    cy.tenderCash(exactAmountDue)
    cy.newTransaction()
  } 
})
//  Get through warranties to Tender Menu
Cypress.Commands.add('pressComplete', (online) => {
  if (online === 'online') {
    cy.intercept('GET', '**/Warranty/AvailableWarranties').as('onlineAvailableWarranties')
    tags.complete().click({ force: true })
    cy.wait('@onlineAvailableWarranties').its('response.statusCode').should('eq', 200)
    cy.get('@onlineAvailableWarranties').its('response').then((response) => {
      let warranties = response.body.length
      if (warranties > 0) {
        tags.complete().click()
      }
    })
    cy.sportsMatterModal()
  } else {
    cy.intercept('**/AvailableWarranties', { body: '[]' }).as('offlineAvailableWarranties')
    tags.complete().click({ force: true })
    cy.wait('@offlineAvailableWarranties')
  }
})

//  Online tender cash
Cypress.Commands.add('tenderCash', (cashTenderAmount) => {
  tags.tenderMenuCashButton().click()
  cy.intercept('**/NewCashTender').as('cashTender')
  cy.intercept('**/FinalizeTransaction').as('finalize')
  tags.cashInput().type(cashTenderAmount)
  tags.cashInputEnter().click()
  cy.wait([ '@cashTender', '@finalize' ])
})

//  Online complete transaction
Cypress.Commands.add('newTransaction', () => {
  cy.intercept('**/Configuration/Settings**').as('settings')
  tags.newTransactionButton().click()
  cy.wait('@settings')
})

//  Offline - Void transaction
Cypress.Commands.add('voidTransaction', () => {
  tags.voidButton().click()
  cy.intercept('**/Transaction/VoidTransaction', { body: '' }).as('voided')
  tags.confirmVoidButton().should('be.visible')
  tags.confirmVoidButton().click()
  cy.wait('@voided')
})

//  Online - Void Transaction
Cypress.Commands.add('onlineVoidTransaction', () => {
    tags.voidButton().click()
    cy.intercept('**/Transaction/VoidTransaction').as('voided')
    tags.confirmVoidButton().click()
    cy.wait('@voided')
    if(voidFeedbackModal === false){
       tags.modalCloseButton('void').should('be.visible')
       tags.modalCloseButton('void').click()
    }
    tags.voidModalCloseButton().should('not.exist')
    tags.omniScan().should('be.visible')
    tags.transactionCard().should('not.exist')
})

//  Online - Suspend Transaction
Cypress.Commands.add('onlineSuspendTransaction', () => {
  cy.intercept('**/Transaction/SuspendTransaction').as('suspended')
  tags.suspendButton().click()
  tags.confirmSuspendButton().click()
  cy.wait('@suspended')
  if (voidFeedbackModal === false) {
    tags.modalCloseButton('suspend').click()
  }
  tags.omniScan().should('be.visible')
})

//  Offline Suspend transaction
Cypress.Commands.add('suspendTransaction', () => {
  tags.suspendButton().click()
  cy.intercept('**/Transaction/SuspendTransaction', { body: suspendResponse }).as('suspended')
  tags.confirmSuspendButton().should('be.visible')
  tags.confirmSuspendButton().click()
  cy.wait('@suspended')
})

//  Close Register - Online
Cypress.Commands.add('onlineCloseRegister', (registerTotals) => {
  tags.registerFunctions().click()
  tags.closeRegister().should('be.visible')
  cy.intercept('**/Register/CloseRegister').as('closeRegister')
  tags.closeRegister().click()
  tags.confirmCloseRegister().click()
  cy.wait('@closeRegister').its('response.statusCode').should('eq', 200)
  if (registerTotals != null || registerTotals != undefined) {
    cy.get('@closeRegister')
      .its('response.body.transactionResponse.closeData.expectedCashAmount')
      .should('deep.equal', Number(registerTotals))
  }
  cy.get('@closeRegister').its('response.body.registerResponse.state').should('eq', 0)
})

//  Close Register - Offline
Cypress.Commands.add('closeRegister', () => {
  tags.registerFunctions().click()
  tags.closeRegister().should('be.visible')
  cy.intercept('**/Register/CloseRegister', { body: closeRegisterResponse }).as('closeRegister')
  tags.closeRegister().click()
  tags.confirmCloseRegister().click()
  cy.wait('@closeRegister')
})

//  Offline tender cash
Cypress.Commands.add('cashTenderFullAmount', (amount, responseData) => {
  cy.intercept('**/Tender/NewCashTender', { body: responseData }).as('cashTender')
  tags.cashInput().click()
    .type(amount)
  tags.cashInputEnter().click()
 cy.wait('@cashTender')
})

//  Add item or loyalty function
//* ********************************************************************************************************

Cypress.Commands.add('addItemOrLoyalty', (itemNumOrLoyaltyNum, responseData, responseStatus) => {
  if (responseStatus == null) {
    responseStatus = 200
  }
  cy.intercept('**/OmniSearch', { statusCode: responseStatus, body: responseData }).as('itemOrLoyaltyAdded')
  cy.omniSearch(itemNumOrLoyaltyNum)
  cy.wait('@itemOrLoyaltyAdded')
})

//  Warranty options for baseball glove
Cypress.Commands.add('warrantiesForGlove', () => {
  cy.intercept('**/Warranty/AvailableWarranties', {
    body: '[{"item":{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false},"warranties":[{"sku":"013676762","planDescription":"Replacement Ext","product":{"description":"1 Year Replacement Plan","upc":"400001001066","sku":"013676762","style":"NM REPL 1Y 2","vertexTaxCode":"81000","variants":{},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU1YR2RPLCXTPNMW?req-img&fmt=png&op_sharpen=1","hierarchy":"001-006-240-230","attributes":[],"legacyPluResponse":""},"pricing":{"quantity":0,"everydayPrice":0.0,"referencePrice":0.0,"unitSellingPrice":8.99,"promptForPrice":true}}]}]'
  }).as('baseballGloveWarranties')
  tags.complete().click()
  cy.wait('@baseballGloveWarranties').its('response.statusCode').should('equal', 200)
})

//  Advance to tender with no protection plan for glove
Cypress.Commands.add('noProtectionPlanForGlove', () => {
  cy.intercept('**/Warranty/AddToTransaction', {
    body: '{"header":{"timestamp":1620137289224,"signature":"xSJk80SMKOZe+55LirM6VKa0U5jai1MmpSJnIolci1A=","transactionKey":"249300087931705042021","tenderIdentifier":"1-249300087931705042021","eReceiptKey":"5008793170011050421016","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-05-04T14:07:48.471809Z","timezoneOffset":-240,"associateId":"1234567","warrantySellingAssociateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[6],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.50,"grandTotal":53.49,"changeDue":0.00,"remainingBalance":53.49}}'
  }).as('noProtectionPlanForGlove')
  cy.intercept('**/Associate/WarrantySelling/1234567', {
    body: '{"header":{"timestamp":1620137289139,"signature":"x1eEk8jVKycWfvQNfNg+PjXXoDnpuNPxJaPjwVoI61M=","transactionKey":"249300087931705042021","tenderIdentifier":"1-249300087931705042021","eReceiptKey":"5008793170011050421016","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-05-04T14:07:48.471809Z","timezoneOffset":-240,"associateId":"1234567","warrantySellingAssociateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[6],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.50,"grandTotal":53.49,"changeDue":0.00,"remainingBalance":53.49}}'
  }).as('sellingAssociate')
  tags.complete().click()
  cy.wait([ '@noProtectionPlanForGlove', '@sellingAssociate' ])
})

//  1 Year warranty selected for baseball glove with no selling associate entered.
Cypress.Commands.add('oneYearWarrantyNoSellingAssociate', () => {
  cy.intercept('**/Warranty/AddToTransaction', {
    body: '{"header":{"timestamp":1620138549449,"signature":"mfUx6AcSpTDp1b43wZMP2J9mX6bq/Viun8T/pggIpEk=","transactionKey":"249300087931705042021","tenderIdentifier":"1-249300087931705042021","eReceiptKey":"5008793170011050421016","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-05-04T14:07:48.471809Z","timezoneOffset":-240,"associateId":"1234567","warrantySellingAssociateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[6],"associatedItems":[{"transactionItemIdentifier":2,"upc":"400001001066","sku":"013676762","style":"NM REPL 1Y 2","description":"1 Year Replacement Plan","quantity":1,"returnPrice":8.99,"promptForPrice":false,"unitPrice":8.99,"priceOverridden":false,"originalUnitPrice":8.99,"variants":{},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU1YR2RPLCXTPNMW?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"001-006-240-230","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":58.98,"tax":4.13,"grandTotal":63.11,"changeDue":0.00,"remainingBalance":63.11}}'
  }).as('oneYearWarranty')
  cy.intercept('**/Associate/WarrantySelling/1234567', {
    body: '{"header":{"timestamp":1620138548442,"signature":"aq+pJjSmkTXzd6lN1yE0xKy6Yti060SGrXB0qYDIW5I=","transactionKey":"249300087931705042021","tenderIdentifier":"1-249300087931705042021","eReceiptKey":"5008793170011050421016","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-05-04T14:07:48.471809Z","timezoneOffset":-240,"associateId":"1234567","warrantySellingAssociateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[6],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":46.99,"tax":3.29,"grandTotal":50.28,"changeDue":0.00,"remainingBalance":50.28}}'
  }).as('noSellingAssociate')
  tags.firstProtectionPlanOptionRadioButton1().click()
  tags.complete().click()
  cy.wait([ '@oneYearWarranty', '@noSellingAssociate' ])
})

//  Enter Jane Manager as the selling associate
Cypress.Commands.add('janeManagerSellingAssociate', () => {
  cy.intercept('**/Security/LookupAssociate/9876543', {
    body: '{"associateId":"9876543","firstName":"Jane","lastName":"Manager"}'
  }).as('janeManagerSellingAssociate')
  tags.warrantySellingAssociate().type(Cypress.env().warrantySellingAssociateNum)
  tags.warrantySellingAssociateEnterButton().click()
  cy.wait('@janeManagerSellingAssociate')
})

//  Add 1 year warranty to the transaction with a glove and selling associate
Cypress.Commands.add('oneYearWarrantyGloveSellingAssociate', () => {
  cy.intercept('**/Warranty/AddToTransaction', { fixture: 'warranties/addWarrantyToTransaction' }).as('addWarrantyToTransaction')
  cy.intercept('**/Associate/WarrantySelling/**', { fixture: 'warranties/addAssociateToTransaction'}).as('addAssociateToTransaction')
  tags.complete().click()
  cy.wait([ '@addWarrantyToTransaction', '@addAssociateToTransaction' ])
})

//  Age 18 restricted item after entering an age of 13
Cypress.Commands.add('CO2tankNot18', () => {
  cy.intercept('**/OmniSearch?age=**', {
    statusCode: 451,
    body: '{"type":"RestrictedProduct","restrictedProductAttributes":[{"attribute":0,"description":"RestrictedAge"}],"upc":"400001571002"}'
  }).as('CO2tankNot18')
  tags.ageRestrictedBirthDateEnterButton().click()
  cy.wait('@CO2tankNot18')
})

//  Age 18 restricted item after entering an age of 19
Cypress.Commands.add('CO2tank19', () => {
  cy.intercept('**/OmniSearch?age=**', {
    body: '{"type":"Transaction","transaction":{"header":{"timestamp":1620064238291,"signature":"gSI3WGXL7zSWbahLXTnb0K4FvTXogSWllUbEAfnMWv8=","transactionKey":"2489800879279305032021","tenderIdentifier":"1-2489800879279305032021","eReceiptKey":"50087927930001050321018","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":1,"startDateTime":"2021-05-03T17:50:38.131434Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"400001571002","sku":"019455241","style":"NM-BEVECO2TANKE","description":"BEVERAGE GRADE CO2 TANK EXCHNG","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{},"imageUrl":"","nonTaxable":false,"hierarchy":"001-007-300-300","attributes":[0],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":49.99,"tax":3.5,"grandTotal":53.49,"changeDue":0.00,"remainingBalance":53.49}},"upc":"400001571002"}'
  }).as('CO2tank19')
  tags.ageRestrictedBirthDateEnterButton().click({ force: true })
  cy.wait('@CO2tank19')
})

//  Age 21 Restricted 22 ammo
Cypress.Commands.add('add21AgeRestricted22Ammo', () => {
  cy.intercept('**/OmniSearch?age=**', {
    statusCode: 451,
    body: '{"type":"RestrictedProduct","restrictedProductAttributes":[{"attribute":0,"description":"RestrictedAge"},{"attribute":1,"description":"RestrictedAge21"}],"upc":"076683000279"}'
  }).as('age21Restricted22Ammo')
  cy.omniSearch(Cypress.env().age21Restricted22AmmoUPC)
  cy.wait('@age21Restricted22Ammo')
})

//  After entering an age of 19
Cypress.Commands.add('AmmoNot21', () => {
  cy.intercept('**/OmniSearch?age=**', {
    statusCode: 451,
    body: '{"type":"RestrictedProduct","restrictedProductAttributes":[{"attribute":1,"description":"RestrictedAge21"}],"upc":"076683000279"}'
  }).as('AmmoNot21')
  tags.ageRestrictedBirthDateEnterButton().click()
  cy.wait('@AmmoNot21')
})

//  After entering an age of 21
Cypress.Commands.add('Ammo21', () => {
  cy.intercept('**/OmniSearch?age=**', {
    body: '{"type":"Transaction","transaction":{"header":{"timestamp":1620069582952,"signature":"3UFI1ZhUA263GsUEGbZcACZy/JnvRIlQlLtkfysqt/k=","transactionKey":"249180087931705032021","tenderIdentifier":"1-249180087931705032021","eReceiptKey":"5008793170011050321010","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-05-03T19:19:42.797119Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"076683000279","sku":"020083512","style":"27Y","description":"CCI .22 Short HP Ammo – 100 Rounds","quantity":1,"returnPrice":12.99,"promptForPrice":false,"unitPrice":12.99,"referencePrice":12.99,"everydayPrice":12.99,"priceOverridden":false,"originalUnitPrice":12.99,"variants":{"Ammo Model":".22 Hornet","Bullet Weight":"27 Grain"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/21CCIUCC22SHRT27GAMO?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"205-001-001-001","attributes":[1,0],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":12.99,"tax":0.91,"grandTotal":13.90,"changeDue":0.00,"remainingBalance":13.90}},"upc":"076683000279"}'
  }).as('Ammo21')
  tags.ageRestrictedBirthDateEnterButton().click()
  cy.wait('@Ammo21')
})

//  Both age 18 and 21 restricted items
Cypress.Commands.add('CO2andAmmo', () => {
  cy.intercept('**/OmniSearch?age=**', {
    body: '{"type":"Transaction","transaction":{"header":{"timestamp":1620069813467,"signature":"t/NFdARX7nqvJU0OV2qrJTYg1XIkjYPhiWqIVp/yjdg=","transactionKey":"249190087931705032021","tenderIdentifier":"1-249190087931705032021","eReceiptKey":"5008793170011050321010","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-05-03T19:23:10.700485Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"400001571002","sku":"019455241","style":"NM-BEVECO2TANKE","description":"BEVERAGE GRADE CO2 TANK EXCHNG","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{},"imageUrl":"","nonTaxable":false,"hierarchy":"001-007-300-300","attributes":[0],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":2,"upc":"076683000279","sku":"020083512","style":"27Y","description":"CCI .22 Short HP Ammo – 100 Rounds","quantity":1,"returnPrice":12.99,"promptForPrice":false,"unitPrice":12.99,"referencePrice":12.99,"everydayPrice":12.99,"priceOverridden":false,"originalUnitPrice":12.99,"variants":{"Ammo Model":".22 Hornet","Bullet Weight":"27 Grain"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/21CCIUCC22SHRT27GAMO?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"205-001-001-001","attributes":[1,0],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":62.98,"tax":4.41,"grandTotal":67.39,"changeDue":0.00,"remainingBalance":67.39}},"upc":"076683000279"}'
  }).as('bothAgeRestrictedItems')
  cy.omniSearch(Cypress.env().age21Restricted22AmmoUPC)
  cy.wait('@bothAgeRestrictedItems')
})

//  Loyalty No Items
Cypress.Commands.add('loyaltyNoItems', () => {
  cy.intercept('**/OmniSearch', {fixture: 'items/loyaltyOnly' }).as('omniSearch')
  cy.intercept('**/AccountLevelDetails/L017B23WK6CS', { fixture: 'loyalty/accountLevelDetails' }).as('accountLevelDetails')
  cy.intercept('**/Transaction/Customer/**/**', { fixture: 'loyalty/accountLevelDetails' }).as('addCustomerToTransaction')
  cy.omniSearch(Cypress.env().phoneNumberSingleResult)
  cy.wait([ '@omniSearch', '@addCustomerToTransaction', '@accountLevelDetails' ])
})

//  Loyalty with Baseball Glove
Cypress.Commands.add('addLoyaltyToBaseballGlove', () => {
  cy.intercept('**/Loyalty/phone/4124435568', {
    body: '[{"id":24620242,"firstName":"Rolyat","lastName":"Nai","emailAddress":"it@hotmail.com","street":"3213 John-Wayne Street","city":"Erie","state":"PA","zip":"16508","homePhone":"4124435568","loyalty":"L017B23WK6CS","subAccount":"B23WK6CS","currentPointBalance":0.0,"rewardAmount":0.0}]'
  }).as('loyaltyLookup')
  cy.intercept('**/Loyalty/AccountLevelDetails/L017B23WK6CS', {
    body: '{"rewards":[],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":353.0,"rewardAmount":0.00,"pointsToNextReward":247.0,"currentRewardTier":10.0,"nextRewardTier":20.0}}'
  }).as('accountLevelDetails')
  cy.intercept('**/Transaction/Customer/**', {
    body: '{"header":{"timestamp":1646254093666,"signature":"+IEgUHRMuU4NbBxmzK1CZ1y8RqLAsEzBnvXDTAenmCk=","transactionKey":"373210087910403022022","tenderIdentifier":"1-373210087910403022022","eReceiptKey":"5008791040253030222018","storeNumber":879,"registerNumber":104,"transactionNumber":253,"startDateTime":"2022-03-02T20:47:13.858522Z","timezoneOffset":-300,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":49.99,"promptForPrice":false,"unitPrice":49.99,"referencePrice":49.99,"everydayPrice":49.99,"priceOverridden":false,"originalUnitPrice":49.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"totalItemTax":3.5,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L017B23WK6CS"},"total":{"subTotal":49.99,"tax":3.5,"grandTotal":53.49,"changeDue":0.0,"remainingBalance":53.49}}'
  }).as('addCustomerToTransaction')
  tags.loyaltyLookupField().click().focused()
  tags.loyaltyLookupField().type(Cypress.env().phoneNumberSingleResult)
    .type('{enter}')
  cy.wait([ '@loyaltyLookup', '@addCustomerToTransaction', '@accountLevelDetails' ])
})

//  Remove loyalty from Baseball Glove transaction
Cypress.Commands.add('removeLoyaltyFromBaseballGlove', () => {
  cy.intercept('**/Transaction/Customer', {
    body: '{"header":{"timestamp":1619093485460,"signature":"C/LbFVBk7b9F5Ka4gYruVBHW40VWw4IoJvecrC/Piss=","transactionKey":"246970087931704222021","tenderIdentifier":"1-246970087931704222021","eReceiptKey":"5008793170011042221014","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"transactionNumber":11,"startDateTime":"2021-04-22T12:10:59.998637Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":46.99,"tax":3.29,"grandTotal":50.28,"changeDue":0.00,"remainingBalance":50.28}}'
  }).as('removeLoyalty')
  tags.loyaltyClearButton().click()
  cy.wait('@removeLoyalty')
})

//  Delete an item from the transaction
//* ******************************************************************************************************
Cypress.Commands.add('deleteItem', (responseData) => {
  cy.intercept('**/Product/Item/**', { body: responseData }).as('deleteItem')
  tags.deleteItem().click()
  cy.wait('@deleteItem')
})

//  Edit an item price
//* ********************************************************************************************************
Cypress.Commands.add('editItemPrice', (amount, responseData) => {
  cy.intercept('**/Product/PriceChange/**', {
    body: responseData
  }).as('priceUpdate')
  tags.itemPriceInput().type(amount)
    .type('{enter}')
  cy.intercept('**/ManagerOverride', { body: responseData }).as('managerApproved')
  tags.managerOverrideAssociateId().type(Cypress.env().warrantySellingAssociateNum)
  tags.managerOverrideAssociatePin().type(Cypress.env().warrantySellingAssociatePIN)
  tags.managerOverrideApplyButton().click()
  cy.wait('@managerApproved')
  cy.wait('@priceUpdate')
})

//  *************************************************************************************
//  Gift Receipts
Cypress.Commands.add('giftReceipt', (responseData) => {
  cy.intercept('**/Product/GiftReceipts', { body: responseData }).as('giftReceipt')
  tags.giftReceiptConfirmSingleButton().click()
  cy.wait('@giftReceipt')
})

//  ***************************************************************************************
//  Lookup returns
Cypress.Commands.add('lookupReturn', (responseData, receipt, scanned) => {
  cy.intercept('**/Returns/**', { body: responseData }).as('lookupReturn')
  if(scanned === 'true'){
    cy.window().then((w) => {
      w.scanEvent(receipt)
    })
  } else {
      tags.returnsLookupGenericButton().click({ force: true })
  }
  cy.wait('@lookupReturn')
})

//  Adding a return item
Cypress.Commands.add('addReturnItems', (responseData) => {
  cy.intercept('**/Returns/AddReturnItems', { body: responseData }).as('addReturnItems')
  tags.confirmReturnsButton().click()
  cy.wait('@addReturnItems')
})

//  Return Auth Network Mock
Cypress.Commands.add('returnAuth', (authorized) => {
  switch(authorized){
    case 'approve':
      cy.intercept('**/Authorize', { body: returnApproved}).as('returnAuth')
      break
    case 'deny':
      cy.intercept('**/Authorize', { body: returnDenied}).as('returnAuth')
      break
    case 'warn':
      cy.intercept('**/Authorize', { body: returnWarned}).as('returnAuth')
      break
  }
  cy.pressComplete()
  cy.wait('@returnAuth')
})

//  Return Lookup by Loyalty Phone Number - One Loyalty Account Result
Cypress.Commands.add('loyaltyLookupReturnPhoneOneResult', () => {
  cy.intercept('**/Loyalty/phone/4124435568', { fixture: 'loyalty/loyaltyReturnLookupPhoneOneResultResponse' }).as('loyaltyLookupReturnPhoneOneResult')
  cy.intercept('**/Returns/Loyalty/L017B23WK6CS', { fixture: 'return/loyaltyLookupReturnsResponse' }).as('loyaltyLookupReturnsResults')
  tags.returnsLookupGenericButton().click()
  cy.wait(['@loyaltyLookupReturnPhoneOneResult', '@loyaltyLookupReturnsResults'])
})

//  Return Lookup by Loyalty Phone Number - Multiple Loyalty Accounts Result
Cypress.Commands.add('loyaltyLookupReturnPhoneTwoResults', () => {
  cy.intercept('**/Loyalty/phone/4124435568', { fixture: 'loyalty/loyaltyReturnLookupPhoneTwoResultsResponse' }).as('loyaltyLookupReturnPhoneTwoResults')
  tags.returnsLookupGenericButton().click()
  cy.wait('@loyaltyLookupReturnPhoneTwoResults')
})

//  Add Loyalty Lookup Return items
Cypress.Commands.add('addLoyaltyReturnItems', () => {
  cy.intercept('**/Returns/AddReturnItems', { fixture: 'return/inStoreReturns/addReturnItems/threeBaseballGloves' }).as('LoyaltyReturnItems')
  cy.intercept('**/Loyalty/account/**', { fixture: 'loyalty/loyaltyAccountResponse' }).as('LoyaltyAccountToLoyaltyLookupReturn')
  cy.intercept('**/Loyalty/AccountLevelDetails/L017B23WK6CS', { fixture: 'loyalty/accountLevelDetails' }).as('LoyaltyAccountDetails')
  tags.loyaltyReturnLookupSubmitButton().click()
  cy.wait(['@LoyaltyReturnItems', '@LoyaltyAccountToLoyaltyLookupReturn', '@LoyaltyAccountDetails'])
})

//  Reprint Gift Receipt
Cypress.Commands.add('reprintValidGiftReceipt', () =>{
  cy.intercept('**/Transaction/TransactionByBarcode**', { fixture: 'receipts/reprintReceiptResponse' }).as('reprintGiftReceiptResponse')
  tags.reprintGiftReceiptInputBox().type('5008881900151082522017{enter}')
  cy.wait('@reprintGiftReceiptResponse')
})

//  Activating CEFSharp, and the peripheral mocks.
Cypress.Commands.add('activatePeripherals', () => {
  cy.on('window:before:load', w => {
    w.CefSharp = {
      BindObjectAsync: (arg1, arg2) => {}
    }
    w.cefSharp = true
    w.closeDrawer = false
    w.creditResponse = null
    w.transactionMonitorAsync = {
      BeginTransaction: (...args) => { },
      EndTransaction: (...args) => { }
    }
    w.applicationAsync = {
      GetVersionNumber: (...args) => {
        return new Promise((resolve) => { resolve('TestVersion') })
      },
      ConfigureScanHandler: (...args) => {
      }
    }
    w.printerAsync = {
      OpenCashDrawer: (...args) => {
      },
      PrintSuspendReceipt: (...args) => {
      },
      WaitForCashDrawerToClose: (...args) => {
        return new Promise((resolve, reject) => {
          const start = new Date()
          const check = async () => {
            if (w.closeDrawer) {
              w.closeDrawer = false
              resolve(true)
            } else if (new Date() - start > 10000) {
              reject(new Error('Wait for close timed out'))
            } else {
              setTimeout(check, 200)
            }
          }
          setTimeout(check, 200)
        })
      },
      PrintRegisterCloseReceipt: (...args) => {
      },
      PrintSalesReceipt: (...args) => {
      },
      PrintStoreCopyReceipt: (...args) => {
      },
      IsCashDrawerOpen: (...args) => {
        return Promise.resolve(false)
      }
    }
    w.fipayAsync = {
      SetRegisterNumber: (...args) => {},
      ConnectFipay: (...args) => {
      },
      BeginTender: (...args) => {
        return new Promise((resolve, reject) => {
          const start = new Date()
          const check = async () => {
            if (w.creditResponse !== null) {
              resolve(window.creditResponse)
              w.creditResponse = null
            } else if (new Date() - start > 10000) {
              reject(new Error('Begin tender timed out'))
            } else {
              setTimeout(check, 200)
            }
          }
          setTimeout(check, 200)
        })
      }
    }
    w.storeInformationAsync = {
      GetStoreInformation: (...args) => {
        return Promise.resolve('{"storeInformation": {"number": ' + storeNum + '}}')
      }
    }
    w.healthCheckAsync = {
      PerformExam: (...args) => {
        const j = {
          BarcodeScannerHealthInfo: {
            OverallHealth: 1
          }
        }
        return Promise.resolve(j)
      }
    }
    w.pinPadAsync = {
      ShowScrollingReceipt: (...args) => {
      },
      ShowIdleScreen: (...args) => {
      },
      ShowProcessing: (...args) => {
      },
      GetSurveyResults: (...args) => {},
      EndSurvey: (...args) => {}
    }
    w.registerInformationAsync = {
      GetRegisterMacAddress: (...args) => {
        return registerId
      }
    }
    w.scannerAsync = {
      ScanningEnabled: (...args) => {
      }
    }
  })
})

//  Load the page with CEFSharp, and the peripherals in place.
Cypress.Commands.add('loadPageWithPeripherals', () => {
  localStorage.setItem('registerId', registerId)
  cy.intercept('**/Register/RegisterNumber/**', {
    body: '{"macAddress":"' + registerId + '","storeNumber":' + storeNum + ',"registerNumber":' + regNum + ',"state":0,"stateDescription":"Closed"}'
  }).as('registerNumber')
  cy.visit('/')
  cy.wait('@registerNumber')
})

Cypress.Commands.add('clickEditProfile', () => {
  tags.loyaltyUserProfileCard().click()
})

Cypress.Commands.add('noReceiptReturnAddItem', (item, scanned) => {
  let addItemToReturn = ''
  switch (item) {
    case Cypress.env().yetiTumblerUPC:
      addItemToReturn = 'return/noReceiptReturnItemOne'
    case Cypress.env().baseballGloveUPC:
      addItemToReturn = 'return/noReceiptReturnItemTwo'
  }
  cy.intercept({method: 'GET',url: '**/Returns/NonReceiptedProduct/**'}, { fixture: addItemToReturn }).as('noReceiptReturnAddItem')
   if(scanned === 'true'){
     cy.window().then((w) => {
       w.scanEvent(item)
      })
    } else {
     tags.noReceiptManualInputField().type(item + '{enter}')
    }
  tags.noReceiptReturnItem1().should('be.visible')
  cy.wait('@noReceiptReturnAddItem')
})

// Adding No receipt items to cart for return initiated from initial scan or in active transaction
Cypress.Commands.add('addNoReceiptReturnItemsToTransaction', (responseData) => {
  cy.get('body').then($body => {
    if ($body.find('[data-testid="void-button"]').length > 0) {
      cy.intercept('**/Returns/AddNonReceiptedReturnItems/ ', { body: responseData }).as('addNoReceiptReturnItemsToTrx')
    } else {
      cy.intercept('**/Returns/AddNonReceiptedReturnItems/ ', { fixture: 'return/addNoReceiptReturnItems' }).as('addNoReceiptReturnItemsToTrx')
    }
  })
  tags.confirmReturnsButton().click()
  cy.wait('@addNoReceiptReturnItemsToTrx')
  tags.noReceiptReturnModalCloseButton().should('not.exist')
})

Cypress.Commands.add('performNoReceiptReturn', (scanned, complete) => {
  tags.returnsFooterButton().should('be.visible')
      .click({ force: true })
  tags.noReceiptReturnLink().click()
  tags.barcodeNotAvailableLink().click()
  if(scanned === 'true'){
    cy.noReceiptReturnAddItem(Cypress.env().yetiTumblerUPC, 'true')
    cy.noReceiptReturnAddItem(Cypress.env().baseballGloveUPC, 'true')
  } else{
    cy.noReceiptReturnAddItem(Cypress.env().yetiTumblerUPC)
    cy.noReceiptReturnAddItem(Cypress.env().baseballGloveUPC)
  }
  tags.noReceiptReturnItem1().click()
  tags.noReceiptReturnItem2().click()
  if(complete != 'No'){
     cy.addNoReceiptReturnItemsToTransaction()
     cy.pressComplete()
  }
})

Cypress.Commands.add('lookupSap', () => {
  cy.intercept('**/Security/LookupAssociate/**', { fixture: 'sap/lookupSap'}).as('lookupSap')
  tags.sapModalItemEntrySubmitButton().click()
  cy.wait('@lookupSap')
})

Cypress.Commands.add('addSapItemsToSale', () => {
  cy.intercept('**/OmniSearch', { fixture: 'sap/omniSearchResults'}).as('omniSearchResults')
  tags.sapAddItemToSaleButton().click()
  cy.wait('@omniSearchResults')
})

Cypress.Commands.add('noReceiptReturnApproved', () => {
    cy.pressComplete()
    tags.noReceiptReturnAuthModalNoBarcodeAvailableLink().click()
    tags.returnAuthIdPicker().select("Driver's License")
    tags.nonReceiptedReturnAuthModalIdNumberEntryField().type('1234567890')
    tags.nonReceiptedReturnAuthModalStateEntryField().type('PA')
    tags.nonReceiptedReturnAuthModalExpirationDateField().type('12/31/2050')
    tags.nonReceiptedReturnAuthNextButton().click()
    tags.nonReceiptedReturnAuthModalFirstNameField().type('Test')
    tags.nonReceiptedReturnAuthModalLastNameField().type('Test')
    tags.nonReceiptedReturnAuthModalBirthDateField().type('12/31/1990')
    tags.nonReceiptedReturnAuthNextButton().click()
    tags.nonReceiptedReturnAuthModalAddress1EntryField().type('123 Main St')
    tags.nonReceiptedReturnAuthModalCityAndStateEntryField().type('Pittsburgh, PA')
    tags.nonReceiptedReturnAuthModalZipCodeEntryField().type('15221')
    tags.nonReceiptedReturnAuthNextButton().click()
    cy.intercept('**/Authorize', { body: returnAuthApprove }).as('returnApproved')
    tags.nonReceiptedReturnAuthModalSubmitButton().click()
    cy.wait('@returnApproved')
})
// Add item in the cart after Associate discount is applied from Initial Scan page
Cypress.Commands.add('addAssociateDiscountOnItem', () => {
    cy.intercept('**/OmniSearch', {fixture: 'addAssociateDiscount/associateDiscountOnItem'}).as('associateDiscountOnItem')
    tags.omniScan().should('be.visible')
      .focus()
      .type(Cypress.env().runningShoesUPC + '{enter}') 
    cy.wait('@associateDiscountOnItem')
    tags.descriptionItem1().should('be.visible')
    tags.priceItem1().should('be.visible')
})
//Open Associate Discount Modal to enter associate ID from Teammate footer menu on Initial scan page
Cypress.Commands.add('addAssociateDiscountModalOpen', () =>{
  tags.teammateButton().click()
  tags.addAssociateDiscountButton().click()
  tags.addAssociateDiscountInputBox().should('be.visible')
    .click()
})
//Elligible associate ID initiates active transaction having associate discount applied successfully
Cypress.Commands.add('addAssociateDiscountTransaction', () => {
  cy.addAssociateDiscountModalOpen()
  cy.intercept('**/OmniSearch', {fixture: 'addAssociateDiscount/associateDiscount'}).as('associateDiscountResponse')
  tags.addAssociateDiscountInputBox().type('9999999')
  tags.addAssociateDiscountSubmitButton().should('have.css', 'background-color', 'rgb(197, 113, 53)') // enabled)
  tags.addAssociateDiscountSubmitButton().click()
  cy.wait('@associateDiscountResponse')
  tags.omniScan().should('be.visible')
  tags.transactionCard().should('be.visible')
  tags.associateDiscountAddedIcon().should('be.visible')
})
Cypress.Commands.add('couponOverrideModalOpen', () => {
  cy.addItemOrLoyalty(Cypress.env().couponPercentOrDollarOff, yetiWithCouponOverrideResponseData)
  tags.couponIcon().should('contain.text', 'Coupon declinedCoupon Not FoundOVERRIDE')
  tags.couponOverrideButton().should('be.visible').click()
})
//Add item in the cart for total above $100
Cypress.Commands.add('addItemPriceAbove100', () => {
    cy.intercept('**/OmniSearch', {fixture: 'coupon/addItemAbove100DollarResponseData'}).as('addItemAbove100')
    tags.omniScan().type(Cypress.env().runningShoesUPC + '{enter}') 
    cy.wait('@addItemAbove100')
})
//Wrong zipcode entery in Loyalty Advanced Search moves to Loyalty Enrollment (Abraham Lincoln 200501)
Cypress.Commands.add('wrongZipLoyaltyAdvancedSearchToEnroll', () => {
  cy.intercept('**/Loyalty/name/Abraham/Lincoln/**', {body: '[]' }). as ('emptyResponse')
  cy.intercept('**/Loyalty/zip/**', {body: loyaltyLookupWrongZipResponse}).as ('loyaltyWrongZip')
  cy.get('[data-testid="name-zip-search"]').click()
  cy.wait(['@emptyResponse', '@loyaltyWrongZip'])
  tags.loyaltyAdvancedSearchPhone().type(phone)
  tags.loyaltyAdvancedSearchStreet().type(street)
  tags.loyaltyAdvancedSearchEmail().type('test@email.com')
  cy.intercept('**/Loyalty/account', {body: '{"id":8448819,"firstName":"Test","lastName":"Rc","emailAddress":"test@email.com","street":"345 Court St","apartment":"","city":"Coraopolis","state":"PA","zip":"15108-3817","homePhone":"3111111111","loyalty":"L01BB23SQSVJ","subAccount":"B23SQSVJ","currentPointBalance":0.0,"rewardAmount":0.0}'}).as('customerDetails')
  cy.intercept('**/Transaction/Customer/L01BB23SQSVJ', {body: '{"header":{"timestamp":1665896635343,"signature":"sTouVIipM1xQCIdjxN9dVbQPTBI5aneZESeOxj32Ni8=","transactionKey":"106850088844710162022","tenderIdentifier":"1-106850088844710162022","eReceiptKey":"5008884470108101622017","storeNumber":888,"registerNumber":447,"transactionNumber":108,"startDateTime":"2022-10-16T05:01:38.693747Z","transactionDate":"2022-10-16T00:00:00","timezoneOffset":-300,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":35.0,"promptForPrice":false,"unitPrice":35.0,"referencePrice":35.0,"everydayPrice":35.0,"priceOverridden":false,"originalUnitPrice":35.0,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"totalItemTax":2.45,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"transactionItemIdentifier":1,"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"customer":{"loyaltyNumber":"L01BB23SQSVJ"},"total":{"subTotal":35.0,"tax":2.45,"grandTotal":37.45,"changeDue":0.0,"remainingBalance":37.45}}'}).as('loyaltyEnrollmentResponse')
  cy.intercept('**/Loyalty/AccountLevelDetails/L01BB23SQSVJ', {body: '{"rewards":[],"tier":{"tier":1,"tierDescription":"Basic"},"points":{"currentPointBalance":700.0,"rewardAmount":0.00,"pointsToNextReward":200.0,"currentRewardTier":20.0,"nextRewardTier":30.0}}'}).as('loyaltyEnrollment')
  tags.loyaltyAdvancedSearchConfirmChanges().click()
  cy.wait(['@customerDetails', '@loyaltyEnrollmentResponse', '@loyaltyEnrollment'])
})

//Online : Clear manager override prompt
Cypress.Commands.add('clearManagerOverridePrompt', () => {
  if(managerOverride != true){
    cy.get('body').then($body => {
     if($body.find('[data-testid="decline-manager-override"]').length >= 0){
       cy.get('[data-testid="decline-manager-override"]').click()
       cy.onlineVoidTransaction()
      }
    
    })
  }
})
//Sale initiated by Phone number
Cypress.Commands.add('saleInitiatedByPhone', (account)=>{
  cy.launchPageLoggedIn()
  if(account === 'single'){
    cy.intercept('**/OmniSearch', {body: lookUpByPhone}).as('phoneLookupResponse')
    cy.intercept('**/Transaction/Customer/**', {body: transactionCustomerResponse}).as('loyaltyPhoneResponse')
    cy.intercept('**/AccountLevelDetails/**', {body: loyaltyDetails}).as('loyaltyAccountResponse')
    tags.omniScan().type(Cypress.env().phoneAbeLincoln + '{enter}')
    cy.wait[('@phoneLookupResponse', '@loyaltyPhoneResponse', '@loyaltyAccountResponse')]
    tags.loyaltySelectedAthlete().should('be.visible')
  } else{
      cy.intercept('**/OmniSearch', {body: lookupByPhoneMultipleAccounts}).as('phoneLookupResponse')
      cy.intercept('**/Survey/Configuration/', {body: loyaltyMulyipleAccountsLookup}).as('surveyResp')
      tags.omniScan().type(Cypress.env().phoneNumberMultipleResults + '{enter}')
      cy.wait[('@phoneLookupResponse','@surveyResp')]
      cy.get('[data-testid="loyalty-mini-controller"] ').should('be.visible')
        .should('contain.text', 'Multiple Accounts Found')
  }
})
//Select item discount reason
Cypress.Commands.add('selectReason', (currentReason) => {
  tags.itemDiscountModalReasonPicker().select(currentReason.label)
})
// Item discount method selection
Cypress.Commands.add('selectMethod', (method) => {
  tags.itemDiscountMethodPicker().select(method.label)
})
// Select transactionDiscount reason
Cypress.Commands.add('selectTransactionDiscountReason', (currentReason) => {
  tags.transactionDiscountModalReasonPicker().select(currentReason.label)
})

//Generate dynamic responses for item discount to use for all reasons and methods
 // Step 1- Clone the fixture object to avoid modifying the original
 const appliedDiscountPercentResp = JSON.parse(JSON.stringify(itemDiscountResponses.appliedDiscountPercentResp))
 const appliedDiscountDollarResp = JSON.parse(JSON.stringify(itemDiscountResponses.appliedDiscountDollarResp))
 const appliedDiscountWithManagerOverridePercentResp = JSON.parse(JSON.stringify(itemDiscountResponses.appliedDiscountWithManagerOverridePercentResp))
 const appliedDiscountWithManagerOverrideDollarResp = JSON.parse(JSON.stringify(itemDiscountResponses.appliedDiscountWithManagerOverrideDollarResp))
 const managerOverridePreConditionResp = JSON.parse(JSON.stringify(itemDiscountResponses.managerOverridePreConditionResp))
 // step 2- create command 
Cypress.Commands.add('generateDynamicResponses', (discountDescription, price, percentDifference, originalRequest) => {
  // Modify the cloned objects with the dynamic data    
  appliedDiscountPercentResp.items[0].appliedDiscounts[0].discountDescription = discountDescription

  appliedDiscountDollarResp.items[0].appliedDiscounts[0].discountDescription = discountDescription

  appliedDiscountWithManagerOverridePercentResp.items[0].unitPrice = price
  appliedDiscountWithManagerOverridePercentResp.items[0].appliedDiscounts[0].discountDescription = discountDescription

  appliedDiscountWithManagerOverrideDollarResp.items[0].unitPrice = price
  appliedDiscountWithManagerOverrideDollarResp.items[0].appliedDiscounts[0].discountDescription = discountDescription

  managerOverridePreConditionResp.thresholdExceededDetails.percentDifference = percentDifference
  managerOverridePreConditionResp.originalRequest = originalRequest

 // Step 3 - Set the generated responses as Cypress aliases
  cy.wrap(appliedDiscountPercentResp).as('appliedDiscountPercentResp')
  cy.wrap(appliedDiscountDollarResp).as('appliedDiscountDollarResp')
  cy.wrap(appliedDiscountWithManagerOverridePercentResp).as('appliedDiscountWithManagerOverridePercentResp')
  cy.wrap(appliedDiscountWithManagerOverrideDollarResp).as('appliedDiscountWithManagerOverrideDollarResp')
  cy.wrap(managerOverridePreConditionResp).as('managerOverridePreConditionResp')
})

//Select item discount Method

Cypress.Commands.add('applyItemDiscountForMethod', (method, percentDiscount, dollarDiscount, setToPrice, discountDescription, originalRequest, threshold, currentReason, price, percentDifference) => {
 
  if (method.label === 'Percent or Dollar Off') {
    tags.itemDiscountModalPage2NextButton().click()
    tags.itemDiscountPercentButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
      .should('have.text', 'PERCENT')
    tags.itemDiscountDollarButton().should('have.text', 'DOLLAR')
    tags.backButton().should('be.visible')
    cy.inputItemDiscount(percentDiscount, dollarDiscount, setToPrice, method)
    cy.applyDiscount(percentDiscount,originalRequest,currentReason, method,discountDescription, threshold,price,percentDifference)
  }
  if (method.label === 'Coupon Discount') {
    tags.itemDiscountCouponBox().click().type('C123456')
    tags.itemDiscountModalPage2NextButton().click()
    tags.itemDiscountPercentButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
      .should('have.text', 'PERCENT')
    tags.itemDiscountDollarButton().should('have.text', 'DOLLAR')
    tags.backButton().should('be.visible')
    cy.inputItemDiscount(percentDiscount, dollarDiscount, setToPrice, method)
    cy.applyDiscount(percentDiscount,originalRequest,currentReason, method,discountDescription, threshold, price,percentDifference)
  }
  if (method.label === 'Manual Price Entry') {
    tags.itemDiscountModalPage2NextButton().click()
      if (setToPrice !== null) {
        cy.inputItemDiscount(percentDiscount, dollarDiscount, setToPrice, method)
        cy.applyDiscount(percentDiscount,originalRequest,currentReason, method,discountDescription, threshold, price, percentDifference)
      }
    }
})

// Enter item discount in input box
Cypress.Commands.add('inputItemDiscount', (percentDiscount, dollarDiscount, setToPrice, method) => {
  if (method.label !== 'Manual Price Entry') {
    if (percentDiscount !== null) {
      tags.itemDiscountInputBox().type(percentDiscount)
    } else {
      tags.itemDiscountDollarButton().click()
      tags.itemDiscountInputBox().type(dollarDiscount)
    }
    } else if (setToPrice !== null) {
      tags.itemDiscountInputBox().type(setToPrice)
    }
})
// apply item discount  
Cypress.Commands.add('applyDiscount',(percentDiscount,originalRequest,currentReason, method, discountDescription, threshold, price, percentDifference) => {
  cy.generateDynamicResponses(discountDescription, price, percentDifference, originalRequest)
  // MO will trigger when threshold is met
  if (threshold === 'over') {
    cy.intercept('**/Discount/**', {statusCode:428, body: managerOverridePreConditionResp}).as('managerOverrideResp')
    tags.itemDiscountApplyButton().click()
    cy.wait('@managerOverrideResp')
    tags.managerOverrideModal().should('be.visible')
      .contains('Reason: '+ currentReason.label + ' Method: ' + method.label)
    tags.managerOverrideAssociateId().click()
      .type(Cypress.env().warrantySellingAssociateNum)  
    tags.managerOverrideAssociatePin().type(Cypress.env().warrantySellingAssociatePIN) 
    // Apply discount if manager credentials are valid
    if (percentDiscount !== null) {
      cy.intercept('**/Discount/**', { body:appliedDiscountWithManagerOverridePercentResp}).as('applyDiscountWithMO')
    } else {
      cy.intercept('**/Discount/**', { body: appliedDiscountWithManagerOverrideDollarResp}).as('applyDiscountWithMO')
    }
    tags.managerOverrideApplyButton().click()
    cy.wait('@applyDiscountWithMO')
  } else {
    if (percentDiscount !== null) {
      cy.intercept('**/Discount/**', { body: appliedDiscountPercentResp}).as('applyDiscount')
    } else {
      cy.intercept('**/Discount/**', { body: appliedDiscountDollarResp}).as('applyDiscount')
    }
    tags.itemDiscountApplyButton().click()
    cy.wait('@applyDiscount')
  }
})
Cypress.Commands.add('waitForMOApplyButtonColorChangeThenClick', {prevSubject: true}, ($button, path, response) => {
    cy.wrap($button)
    .should('be.visible')
    .and('have.text', 'Apply')
    .then(() => {
        cy.intercept(path, response).as('overrideApproved')
        cy.wrap($button).click()
        cy.wait('@overrideApproved')
      })
})