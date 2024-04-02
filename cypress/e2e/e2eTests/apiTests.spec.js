/// <reference types="cypress" />
import elements from '../../support/pageElements'
import helpers from '../../support/cypressHelpers'

context('Are all the services up and running', () => {
  //  Constant declarations
  const tags = new elements()
  const DevRegId = Cypress.env().devRegisterIdMacAddress
  const StageRegId = Cypress.env().stageRegisterIdMacAddress
  const DevRegNum = Cypress.env().devRegisterNumber
  const StageRegNum = Cypress.env().stageRegisterNumber
  const DevStoreNum = Cypress.env().devStoreNumber
  const StageStoreNum = Cypress.env().stageStoreNumber
  const yetiImageUrl = Cypress.env().genericYetiTumblerImageUrl
  const recumbantBikeImageUrl = Cypress.env().generalRecumbantBikeImageUrl

  //  Needed for the truncation of decimal places when they are zero in the respons string
  const yetiApiResponsePrice = Number(Cypress.env().yetiTumblerPrice).toFixed(0)

  //  Variable declarations
  let registerId = ''
  let regNum = 0
  let storeNum = 0
  let donationCampaign = ''

  //  Determining if we are in Dev or Stage for this test, and setting variables accordingly.
  before(() => {
    if (Cypress.config().baseUrl === 'http://localhost:3000' || Cypress.config().baseUrl === 'https://pointofsale-dev.dcsg.com') {
      registerId = DevRegId
      regNum = DevRegNum
      storeNum = DevStoreNum
    }
    if (Cypress.config().baseUrl === 'https://pointofsale-stg.dcsg.com') {
      registerId = StageRegId
      regNum = StageRegNum
      storeNum = StageStoreNum
    }
  })

  //  Loading the page, setting the register #, and making sure its closed before we start testing.
  beforeEach(() => {
    cy.intercept('GET', '**/Configuration/Settings**').as('featureFlags')
    cy.onlineLoadPage()
    cy.wait('@featureFlags').its('response.statusCode').should('eq', 200)
    cy.get('@featureFlags').its('response').then((res) => {
      let flags = res.body.features.data
      donationCampaign = flags.includes('UseSportsMatterCampaignModal')
    })
  })

  it('Test 1: Is the configuration service available.', () => {
    cy.intercept('**/configuration').as('configuration')
    cy.visit('/')
    cy.wait('@configuration').its('response.statusCode').should('eq', 200)
    cy.get('@configuration').its('response').then((res) => {
      expect(res.body.storeInformation, 'response body').to.contain({
        chainNumber: Cypress.env().devStoreChain,
        chainDescription: Cypress.env().devStoreDescription,
        number: Number(storeNum),
        streetAddress: Cypress.env().devStoreStreetAddress,
        city: Cypress.env().devStoreCity,
        state: Cypress.env().devStoreState,
        zipCode: Cypress.env().devStoreZip,
        phoneNumber: Cypress.env().devStorePhoneNumber
      })
    })
  })

  it('Test 2: The register number service is available.', () => {
    cy.intercept('GET', '**/Register/RegisterNumber/**').as('registerNumber')
    cy.visit('/')
    cy.wait('@registerNumber').its('response.statusCode').should('eq', 200)
    cy.get('@registerNumber').its('response').then((res) => {
      expect(res.body, 'response body').to.contain({
        state: 0,
        stateDescription: 'Closed'
      })
    })
    cy.get('@registerNumber').its('response.body.macAddress').should('eq', registerId)
      .should('not.be.undefined')
    cy.get('@registerNumber').its('response.body.storeNumber').should('eq', Number(storeNum))
      .should('not.be.undefined')
    cy.get('@registerNumber').its('response.body.registerNumber').should('eq', Number(regNum))
      .should('not.be.undefined')
  })

  it('Test 3: The settings service is available, and returns all the feature flags.', () => {
    cy.intercept('GET', '**/Configuration/Settings**').as('featureFlags')
    cy.visit('/')
    cy.wait('@featureFlags').its('response.statusCode').should('eq', 200)
    cy.get('@featureFlags').its('response').then((res) => {
      expect(res.body.features.data, 'Configuration/Settings response body data').to.contain("Credit")
        //.to.contain("ScanAndPay")     //This flag is not in stage, so it's commented out.
        .to.contain("Suspend")
        .to.contain("ScanAndPayCoupons")
        //.to.contain("PilotSurveyUrl")   //This flag is not in stage, so it's commented out.
        //.to.contain("CSATSurvey") //This flag has been removed from stage, so it's commenyted out.
        .to.contain("Returns")
        .to.contain("LauncherHealthChecks")
        .to.contain("AdyenGiftCardTendering")
        .to.contain("CreditEnrollment")
        .to.contain("CreditLookup")
        .to.contain("PostVoid")
        .to.contain("ReturnsAuthorization")
        .to.contain("ManualCoupons")
        .to.contain("ScanGiftCard")
        .to.contain("InStoreReturns")
        .to.contain("ManuallyEnterGiftCard")
        .to.contain("NonReceiptedReturns")
        .to.contain("NoSale")
        .to.contain("GiftCardBalanceInquiry")
        //.to.contain("TaxEstimatorApi")  //This flag is not in stage, so it's commented out.
        .to.contain("ManuallyEnterGiftCard")
        .to.contain("RewardExceedsDiscount")
        .to.contain("eReceipts")
        .to.contain("SportsMatterPrompt")
        .to.contain("ConnectPinpad")
      expect(res.body.settings, 'Configuraiton/Settings response body settings').to.contain({ success: true })
    })
  })

  it('Test 4: Login service works and returns appropariate data.', () => {
    tags.login().type(Cypress.env().associateNum)
    tags.pin().type(Cypress.env().associatePIN)
    cy.intercept('POST', '**/Security/Authenticate').as('auth')
    cy.intercept('GET', '**/Transaction/ActiveTransaction').as('activeTransaction')
    tags.loginSubmit().click()
    cy.wait('@auth').its('response.statusCode').should('eq', 200)
    cy.get('@auth').its('response').then((res) => {
      expect(res.body, 'Security Authenticate response body').to.contain({
        associateId: Cypress.env().associateNum,
        firstName: Cypress.env().associateFirstName,
        lastName: Cypress.env().associateLastName
      })
    })
    cy.get('@auth').its('response.body.token').should('not.be.null')
      .should('not.be.undefined')
    cy.wait('@activeTransaction').its('response.statusCode').should('eq', 204)
    cy.onlineCloseRegister()
  })

  it('Test 5: Item lookup works and returns the correct values.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().yetiTumblerUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.get('@omniSearch').its('response').then((res) => {
      expect(res.body.transaction.header, 'OmniSearch response body transaction header').to.contain({
        associateId: Cypress.env().associateNum,
        transactionType: 1,
        transactionTypeDescription: 'Sale',
        transactionStatus: 1,
        transactionStatusDescription: 'Active'
      })
    })
    cy.get('@omniSearch').its('response.body.transaction.header.timestamp').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.signature').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.transactionKey').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.tenderIdentifier').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.eReceiptKey').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.storeNumber').should('eq', Number(storeNum))
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.registerNumber').should('eq', Number(regNum))
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.transactionNumber').should('be.greaterThan', 0)
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.startDateTime').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response.body.transaction.header.timezoneOffset').should('not.be.null')
      .should('not.be.undefined')
    cy.get('@omniSearch').its('response').then((res) => {
      expect(res.body.transaction.items[0], 'OmniSearch response body transaction items').to.contain({
        transactionItemIdentifier: 1,
        upc: Cypress.env().yetiTumblerUPC,
        sku: Cypress.env().yetiTumblerSku,
        style: Cypress.env().yetiTumblerStyle,
        description: Cypress.env().yetiTumblerDescription,
        quantity: 1,
        returnPrice: Number(yetiApiResponsePrice),
        promptForPrice: false,
        unitPrice: Number(yetiApiResponsePrice),
        referencePrice: Number(yetiApiResponsePrice),
        everydayPrice: Number(yetiApiResponsePrice),
        priceOverridden: false,
        originalUnitPrice: Number(yetiApiResponsePrice),
        nonTaxable: false,
        hierarchy: Cypress.env().yetiTumblerHierarchy,
        giftReceipt: false
      })
      expect(res.body.transaction.items[0].imageUrl).to.contain(yetiImageUrl)
      expect(res.body.transaction.items[0].variants).to.contain({
        Color: Cypress.env().yetiTumblerColor,
        Capacity: Cypress.env().yetiTumblerCapacity
      })
      expect(res.body.transaction.items[0].attributes, 'OmniSearch item attributes').to.be.empty
      expect(res.body.transaction.items[0].appliedDiscounts, 'OmniSearch item appliedDiscounts').to.be.empty
    })
    cy.get('@omniSearch').its('response.body.transaction.tenders').should('be.empty')
    cy.get('@omniSearch').its('response.body.transaction.coupons').should('be.empty')
    cy.get('@omniSearch').its('response.body.transaction.rewardCertificates').should('be.empty')
    cy.get('@omniSearch').its('response.body.transaction.receiptMessages').should('not.be.null')
    const yetiTax = helpers.determinTax(Cypress.env().yetiTumblerPrice)
    const yetiTotal = helpers.determinTotal(Cypress.env().yetiTumblerPrice, yetiTax)
    cy.get('@omniSearch').its('response').then((res) => {
      expect(res.body.transaction.total, 'OmniSearch transaction total').to.contain({
        subTotal: Number(yetiApiResponsePrice),
        tax: Number(yetiTax),
        grandTotal: Number(yetiTotal),
        changeDue: 0.0,
        remainingBalance: Number(yetiTotal)
      })
    })
    cy.get('@omniSearch').its('response.body.upc').should('contain', '888830050118')
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 6: Loyalty lookup works and returns the correct values.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().phoneAbeLincoln)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.get('@omniSearch').its('response').then((res) => {
      expect(res.body).to.contain({ type: 'LoyaltyAccounts' })
      expect(res.body.loyalty[0]).to.contain({
        id: 15,
        firstName: Cypress.env().AbeLincolnFirstName,
        lastName: Cypress.env().AbeLincolnLastName,
        street: Cypress.env().AbeLincolnStreetAddress,
        city: Cypress.env().AbeLincolnCity,
        state: Cypress.env().AbeLincolnState,
        zip: Cypress.env().AbeLincolnZip,
        homePhone: Cypress.env().phoneAbeLincoln,
        loyalty: Cypress.env().AbeLincolnLoyaltyNumber,
        subAccount: Cypress.env().AbeLincolnLoyaltySubAccount
      })
      expect(res.body.loyalty[0].emailAddress).to.not.be.null
        .to.not.be.undefined
      expect(res.body.loyalty[0].currentPointBalance).to.not.be.null
        .to.not.be.undefined
      expect(res.body.loyalty[0].rewardAmount).to.not.be.null
        .to.not.be.undefined
    })
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 7: Transaction/Customer works and returns the correct values.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().phoneAbeLincoln)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    cy.intercept('POST', '**/Transaction/Customer/**').as('customer')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.wait('@customer').its('response.statusCode').should('eq', 200)
    cy.get('@customer').its('response').then((res) => {
      expect(res.body.customer).to.contain({ loyaltyNumber: Cypress.env().AbeLincolnLoyaltyNumber })
      expect(res.body.header.timestamp).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header.signature).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header.transactionKey).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header.tenderIdentifier).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header.eReceiptKey).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header.storeNumber).to.eq(Number(storeNum))
      expect(res.body.header.registerNumber).to.eq(Number(regNum))
      expect(res.body.header.transactionNumber).to.be.greaterThan(0)
      expect(res.body.header.startDateTime).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header.timezoneOffset).not.to.be.undefined
        .not.to.be.null
      expect(res.body.header).to.contain({
        associateId: Cypress.env().associateNum,
        transactionType: 1,
        transactionTypeDescription: 'Sale',
        transactionStatus: 1,
        transactionStatusDescription: 'Active'
      })
      expect(res.body.items, 'Items').to.be.empty
      expect(res.body.tenders, 'Tenders').to.be.empty
      expect(res.body.coupons, 'Coupons').to.be.empty
      expect(res.body.rewardCertificates, 'Reward Certificates').to.be.empty
      expect(res.body.receiptMessages, 'Receipt Messages').to.be.empty
      expect(res.body.total, 'Total').to.contain({
        subTotal: 0.0,
        tax: 0.0,
        grandTotal: 0.0,
        changeDue: 0.0,
        remainingBalance: 0.0
      })
    })
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 8: Add an item, and make sure that the warranty lookup works as expected.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().recumbantBikeUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Warranty/AvailableWarranties').as('availableWarranties')
    tags.complete().click()
    cy.wait('@availableWarranties').its('response.statusCode').should('eq', 200)
    cy.get('@availableWarranties').its('response').then((res) => {
      expect(res.body[0].item).to.contain({
        transactionItemIdentifier: 1,
        upc: Cypress.env().recumbantBikeUPC,
        sku: Cypress.env().recumbantBikeSku,
        style: Cypress.env().recumbantBikeStyle,
        description: Cypress.env().recumbantBikeDescription,
        quantity: 1,
        returnPrice: Cypress.env().recumbantBikePrice,
        promptForPrice: false,
        unitPrice: Cypress.env().recumbantBikePrice,
        referencePrice: Cypress.env().recumbantBikePrice,
        everydayPrice: Cypress.env().recumbantBikePrice,
        priceOverridden: false,
        originalUnitPrice: Cypress.env().recumbantBikePrice,
        nonTaxable: false,
        hierarchy: Cypress.env().recumbantBikeHierarchy,
        giftReceipt: false
      })
      expect(res.body[0].item.imageUrl).to.contain(recumbantBikeImageUrl)
      expect(res.body[0].item.variants).to.be.empty
      expect(res.body[0].item.attributes).to.be.empty
      expect(res.body[0].item.appliedDiscounts).to.be.empty
      expect(res.body[0].warranties).to.be.a('array')
      let numWarranties = res.body[0].warranties.length
      expect(numWarranties).to.eq(4)
    })
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 9: Add an associate for the warranty sale, and verify the network response.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().recumbantBikeUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Warranty/AvailableWarranties').as('availableWarranties')
    tags.complete().click()
    cy.wait('@availableWarranties').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Security/LookupAssociate/**').as('sellingAssociate')
    tags.warrantySellingAssociate().type(Cypress.env().associateNum)
    tags.warrantySellingAssociateEnterButton().click()
    cy.wait('@sellingAssociate').its('response.statusCode').should('eq', 200)
    cy.get('@sellingAssociate').its('response').then((res) => {
      expect(res.body).to.contain({
        associateId: Cypress.env().associateNum,
        firstName: Cypress.env().associateFirstName,
        lastName: Cypress.env().associateLastName
      })
    })
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 10: Add a warranty with selling associate, and verify the network response.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().recumbantBikeUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Warranty/AvailableWarranties').as('availableWarranties')
    tags.complete().click()
    cy.wait('@availableWarranties').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Security/LookupAssociate/**').as('sellingAssociate')
    tags.warrantySellingAssociate().type(Cypress.env().associateNum)
    tags.warrantySellingAssociateEnterButton().click()
    cy.wait('@sellingAssociate').its('response.statusCode').should('eq', 200)
    cy.intercept('POST', '**/Warranty/AddToTransaction').as('warrantySelected')
    tags.firstProtectionPlanOptionRadioButton1().click()
    tags.complete().click()
    cy.sportsMatterModal()
    cy.wait('@warrantySelected').its('response.statusCode').should('eq', 200)
    cy.get('@warrantySelected').its('response').then((res) => {
      expect(res.body.header).to.contain({
        associateId: Cypress.env().associateNum,
        warrantySellingAssociateId: Cypress.env().associateNum,
        transactionType: 1,
        transactionTypeDescription: 'Sale',
        transactionStatus: 1,
        transactionStatusDescription: 'Active'
      })
      expect(res.body.header.timezoneOffset).to.be.lessThan(-239)
      expect(res.body.header.timestamp).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.signature).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.transactionKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.tenderIdentifier).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.eReceiptKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.storeNumber).to.eq(Number(storeNum))
      expect(res.body.header.registerNumber).to.eq(Number(regNum))
      expect(res.body.header.transactionNumber).to.be.greaterThan(0)
      expect(res.body.header.startDateTime).to.not.be.null
        .to.not.be.undefined
      expect(res.body.items[0]).to.contain({
        transactionItemIdentifier: 1,
        upc: Cypress.env().recumbantBikeUPC,
        sku: Cypress.env().recumbantBikeSku,
        style: Cypress.env().recumbantBikeStyle,
        description: Cypress.env().recumbantBikeDescription,
        quantity: 1,
        returnPrice: Cypress.env().recumbantBikePrice,
        promptForPrice: false,
        unitPrice: Cypress.env().recumbantBikePrice,
        referencePrice: Cypress.env().recumbantBikePrice,
        everydayPrice: Cypress.env().recumbantBikePrice,
        priceOverridden: false,
        originalUnitPrice: Cypress.env().recumbantBikePrice,
        nonTaxable: false,
        hierarchy: Cypress.env().recumbantBikeHierarchy
      })
      expect(res.body.items[0].imageUrl).to.contain(recumbantBikeImageUrl)
      expect(res.body.items[0].attributes[0]).to.eq(6)
      expect(res.body.items[0].associatedItems[0]).to.contain({
        transactionItemIdentifier: 2,
        upc: Cypress.env().bike1YearWarrantyUPC,
        sku: Cypress.env().bike1YearWarrantySku,
        style: Cypress.env().bike1YearWarrantyStyle,
        description: Cypress.env().bike1YearWarrantyDescription,
        quantity: 1,
        returnPrice: Cypress.env().bike1YearWarrantyPrice,
        promptForPrice: false,
        unitPrice: Cypress.env().bike1YearWarrantyPrice,
        referencePrice: Cypress.env().bike1YearWarrantyPrice,
        everydayPrice: Cypress.env().bike1YearWarrantyPrice,
        priceOverridden: false,
        originalUnitPrice: Cypress.env().bike1YearWarrantyPrice,
        nonTaxable: false,
        hierarchy: Cypress.env().bikeWarrantyHierarchy,
        giftReceipt: false
      })
      expect(res.body.items[0].associatedItems[0].variants).to.be.empty
        .to.not.be.undefined
      expect(res.body.items[0].associatedItems[0].attributes).to.exist
      expect(res.body.items[0].associatedItems[0].appliedDiscounts).not.to.be.null
      expect(res.body.items[0].appliedDiscounts).to.be.empty
        .to.not.be.undefined
      expect(res.body.items[0].giftReceipt).to.be.false
      expect(res.body.tenders).to.be.empty
        .to.not.be.undefined
      expect(res.body.coupons).to.be.empty
        .to.not.be.undefined
      expect(res.body.rewardCertificates).to.be.empty
        .to.not.be.undefined
      expect(res.body.receiptMessages).not.to.be.null
        .to.not.be.undefined
      const items = [Cypress.env().recumbantBikePrice, Cypress.env().bike1YearWarrantyPrice]
      const Subtotal = helpers.determinSubtotal(items)
      const Tax = helpers.determinTax(Subtotal)
      const Total = helpers.determinTotal(Subtotal, Tax)
      expect(res.body.total).to.contain({
        subTotal: Number(Subtotal),
        tax: Number(Tax),
        grandTotal: Number(Total),
        changeDue: 0.0,
        remainingBalance: Number(Total)
      })
    })
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 11: Updaing the warranty selling assoicate, and validating the network response.', () => {
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().recumbantBikeUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Warranty/AvailableWarranties').as('availableWarranties')
    tags.complete().click()
    cy.wait('@availableWarranties').its('response.statusCode').should('eq', 200)
    cy.intercept('GET', '**/Security/LookupAssociate/**').as('sellingAssociate')
    tags.warrantySellingAssociate().type(Cypress.env().associateNum)
    tags.warrantySellingAssociateEnterButton().click()
    cy.wait('@sellingAssociate').its('response.statusCode').should('eq', 200)
    cy.intercept('POST', '**/Warranty/AddToTransaction').as('warrantySelected')
    cy.intercept('PUT', '**/Associate/WarrantySelling/**').as('soldWarranty')
    tags.firstProtectionPlanOptionRadioButton1().click()
    tags.complete().click()
    cy.wait('@warrantySelected').its('response.statusCode').should('eq', 200)
    cy.wait('@soldWarranty').its('response.statusCode').should('eq', 200)
    cy.get('@soldWarranty').its('response').then((res) => {
      expect(res.body.coupons).to.be.empty
        .to.not.be.undefined
      expect(res.body.receiptMessages).not.to.be.null
        .to.not.be.undefined
      expect(res.body.rewardCertificates).to.be.empty
        .to.not.be.undefined
      expect(res.body.tenders).to.be.empty
        .to.not.be.undefined
      expect(res.body.header.timestamp).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.signature).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.transactionKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.tenderIdentifier).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.eReceiptKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.storeNumber).to.eq(Number(storeNum))
      expect(res.body.header.registerNumber).to.eq(Number(regNum))
      expect(res.body.header.transactionNumber).to.be.greaterThan(0)
      expect(res.body.header.startDateTime).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header).to.contain({
        associateId: Cypress.env().associateNum,
        warrantySellingAssociateId: Cypress.env().associateNum,
        transactionType: 1,
        transactionTypeDescription: 'Sale',
        transactionStatus: 1,
        transactionStatusDescription: 'Active'
      })
      expect(res.body.header.timezoneOffset).to.be.lessThan(-239)
    })
    cy.sportsMatterModal()
    cy.onlineVoidTransaction()
    cy.onlineCloseRegister()
  })

  it('Test 12: Under tender requires more funds to complete transaction.', () => {
    const tenderAmount = '20.00'
    let subTotal
    let grandTotal
    let remainingBalance
    let price = ''
    const Tax = helpers.determinTax(Cypress.env().yetiTumblerPrice)
    const Total = helpers.determinTotal(Cypress.env().yetiTumblerPrice, Tax)
    const BalanceDue = Number(Number(Total).toFixed(2)) - Number(Number(tenderAmount).toFixed(2))
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().yetiTumblerUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.pressComplete('online').then((isSMCampaignOn) => {
      if (isSMCampaignOn === true) {
        cy.get('[data-testid="item-price1"]').invoke('text').then(text => {
          price = parseFloat(text)
        }).then(() => {
          subTotal = Number(Cypress.env().yetiTumblerPrice) + price
          grandTotal = Number(Number(Total).toFixed(2)) + price
          remainingBalance = Number(Number(BalanceDue).toFixed(2)) + price
        })
      } else {
        subTotal = Number(Cypress.env().yetiTumblerPrice)
        grandTotal = Number(Number(Total).toFixed(2))
        remainingBalance = Number(Number(BalanceDue).toFixed(2))
      }
    })
    cy.intercept('POST', '**/Tender/NewCashTender').as('overTenderCash')
    tags.tenderMenuCashButton().click()
    tags.cashInput().type(tenderAmount)
    tags.cashInputEnter().click()
    cy.wait('@overTenderCash').its('response.statusCode').should('eq', 200)
    cy.get('@overTenderCash').its('response').then((res) => {
      expect(res.body.header.timestamp).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.signature).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.transactionKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.tenderIdentifier).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.eReceiptKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.storeNumber).to.eq(Number(storeNum))
      expect(res.body.header.registerNumber).to.eq(Number(regNum))
      expect(res.body.header.transactionNumber).to.be.greaterThan(0)
      expect(res.body.header.startDateTime).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.timezoneOffset).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header).to.contain({
        associateId: Cypress.env().associateNum,
        transactionType: 1,
        transactionTypeDescription: 'Sale',
        transactionStatus: 1,
        transactionStatusDescription: 'Active'
      })
      expect(res.body.items[0]).to.contain({
        transactionItemIdentifier: 1,
        upc: Cypress.env().yetiTumblerUPC,
        sku: Cypress.env().yetiTumblerSku,
        style: Cypress.env().yetiTumblerStyle,
        description: Cypress.env().yetiTumblerDescription,
        quantity: 1,
        returnPrice: Number(yetiApiResponsePrice),
        promptForPrice: false,
        unitPrice: Number(yetiApiResponsePrice),
        referencePrice: Number(yetiApiResponsePrice),
        everydayPrice: Number(yetiApiResponsePrice),
        priceOverridden: false,
        originalUnitPrice: Number(yetiApiResponsePrice),
        nonTaxable: false,
        hierarchy: Cypress.env().yetiTumblerHierarchy,
        giftReceipt: false
      })
      expect(res.body.items[0].imageUrl).to.contain(yetiImageUrl)
      expect(res.body.items[0].variants).to.contain({
        Color: Cypress.env().yetiTumblerColor,
        Capacity: Cypress.env().yetiTumblerCapacity
      })
      expect(res.body.items[0].attributes).to.be.empty
      expect(res.body.items[0].appliedDiscounts).to.be.empty
      expect(res.body.tenders[0]).to.contain({
        tenderType: 1,
        tenderTypeDescription: 'Cash',
        amount: Number(tenderAmount)
      })
      expect(res.body.coupons).to.be.empty
      expect(res.body.rewardCertificates).to.be.empty
      expect(res.body.receiptMessages).not.to.be.null
      expect(res.body.total).to.contain({
        subTotal: Number(subTotal),
        tax: Number(Tax),
        grandTotal: Number(grandTotal),
        changeDue: 0.0,
        remainingBalance: Number(remainingBalance)
      })
    })
    tags.tenderMenuCashButton().click()
    tags.cashInputEnter().click()
    tags.newTransactionButton().click()
    cy.onlineCloseRegister()
  })

  it('Test 13: Tender exact amount due, and verify network responses', () => {
    let subTotal
    let grandTotal
    let price
    const Tax = helpers.determinTax(Cypress.env().yetiTumblerPrice)
    const Total = helpers.determinTotal(Cypress.env().yetiTumblerPrice, Tax)
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().yetiTumblerUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.pressComplete('online').then((isSMCampaignOn) => {
      if (isSMCampaignOn === true) {
        cy.get('[data-testid="item-price1"]').invoke('text').then(text => {
          price = parseFloat(text)
        }).then(() => {
          subTotal = Number(Cypress.env().yetiTumblerPrice) + price
          grandTotal = Number(Number(Total).toFixed(2)) + price
          grandTotal = Number(grandTotal).toFixed(2)
        })
      } else {
        subTotal = Number(Cypress.env().yetiTumblerPrice)
        grandTotal = Number(Number(Total).toFixed(2))
      }
    }).then(() => {
      cy.intercept('POST', '**/Tender/NewCashTender').as('overTenderCash')
      tags.tenderMenuCashButton().click()
      tags.cashInput().type(grandTotal)
      tags.cashInputEnter().click()
      cy.wait('@overTenderCash').its('response.statusCode').should('eq', 200)
      cy.get('@overTenderCash').its('response').then((res) => {
        expect(res.body.header.timestamp).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header.signature).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header.transactionKey).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header.tenderIdentifier).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header.eReceiptKey).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header.storeNumber).to.eq(Number(storeNum))
        expect(res.body.header.registerNumber).to.eq(Number(regNum))
        expect(res.body.header.transactionNumber).to.be.greaterThan(0)
        expect(res.body.header.startDateTime).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header.timezoneOffset).to.not.be.null
          .to.not.be.undefined
        expect(res.body.header).to.contain({
          associateId: Cypress.env().associateNum,
          transactionType: 1,
          transactionTypeDescription: 'Sale',
          transactionStatus: 1,
          transactionStatusDescription: 'Active'
        })
        expect(res.body.items[0]).to.contain({
          transactionItemIdentifier: 1,
          upc: Cypress.env().yetiTumblerUPC,
          sku: Cypress.env().yetiTumblerSku,
          style: Cypress.env().yetiTumblerStyle,
          description: Cypress.env().yetiTumblerDescription,
          quantity: 1,
          returnPrice: Number(yetiApiResponsePrice),
          promptForPrice: false,
          unitPrice: Number(yetiApiResponsePrice),
          referencePrice: Number(yetiApiResponsePrice),
          everydayPrice: Number(yetiApiResponsePrice),
          priceOverridden: false,
          originalUnitPrice: Number(yetiApiResponsePrice),
          nonTaxable: false,
          hierarchy: Cypress.env().yetiTumblerHierarchy,
          giftReceipt: false
        })
        expect(res.body.items[0].imageUrl).to.contain(yetiImageUrl)
        expect(res.body.items[0].variants).to.contain({
          Color: Cypress.env().yetiTumblerColor,
          Capacity: Cypress.env().yetiTumblerCapacity
        })
        expect(res.body.items[0].attributes).to.be.empty
        expect(res.body.items[0].appliedDiscounts).to.be.empty
        expect(res.body.tenders[0]).to.contain({
          tenderType: 1,
          tenderTypeDescription: 'Cash',
          amount: Number(grandTotal)
        })
        expect(res.body.coupons).to.be.empty
        expect(res.body.rewardCertificates).to.be.empty
        expect(res.body.receiptMessages).not.to.be.null
        expect(res.body.total).to.contain({
          subTotal: Number(subTotal),
          tax: Number(Tax),
          grandTotal: Number(grandTotal),
          changeDue: 0.0,
          remainingBalance: 0.00
        })
      })
    })
    tags.newTransactionButton()
    cy.onlineCloseRegister()
  })

  it('Test 14: Over tender with cash, and verify the network response', () => {
    let tenderAmount = '50.00'
    let subTotal
    let grandTotal
    let remainingBalance
    let changeDue
    let price
    const Tax = helpers.determinTax(Cypress.env().yetiTumblerPrice)
    const Total = helpers.determinTotal(Cypress.env().yetiTumblerPrice, Tax)
    const ChangeDue = Number(Number(tenderAmount).toFixed(2)) - Number(Number(Total).toFixed(2))
    const BalanceDue = Number(Number(Total).toFixed(2)) - Number(Number(tenderAmount).toFixed(2))
    cy.onlineLogin(Cypress.env().associateNum, Cypress.env().associatePIN)
    tags.omniScan().type(Cypress.env().yetiTumblerUPC)
    cy.intercept('POST', '**/OmniSearch**').as('omniSearch')
    tags.scanSubmit().click()
    cy.wait('@omniSearch').its('response.statusCode').should('eq', 200)
    cy.pressComplete('online').then((isSMCampaignOn) => {
      if (isSMCampaignOn === true) {
        cy.get('[data-testid="item-price1"]').invoke('text').then(text => {
          price = parseFloat(text)
        }).then(() => {
          subTotal = Number(Cypress.env().yetiTumblerPrice) + price
          grandTotal = Number(Number(Total).toFixed(2)) + price
          remainingBalance = Number(Number(BalanceDue).toFixed(2)) + price
          changeDue = Number(Number(ChangeDue).toFixed(2)) - price
        })
      } else {
        subTotal = Number(Cypress.env().yetiTumblerPrice)
        grandTotal = Number(Number(Total).toFixed(2))
        remainingBalance = Number(Number(BalanceDue).toFixed(2))
        changeDue = Number(Number(ChangeDue).toFixed(2))
      }
    })
    cy.intercept('POST', '**/Tender/NewCashTender').as('overTenderCash')
    tags.tenderMenuCashButton().click()
    tags.cashInput().type(tenderAmount)
    tags.cashInputEnter().click()
    cy.wait('@overTenderCash').its('response.statusCode').should('eq', 200)
    cy.get('@overTenderCash').its('response').then((res) => {
      expect(res.body.header.timestamp).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.signature).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.transactionKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.tenderIdentifier).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.eReceiptKey).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.storeNumber).to.eq(Number(storeNum))
      expect(res.body.header.registerNumber).to.eq(Number(regNum))
      expect(res.body.header.transactionNumber).to.be.greaterThan(0)
      expect(res.body.header.startDateTime).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header.timezoneOffset).to.not.be.null
        .to.not.be.undefined
      expect(res.body.header).to.contain({
        associateId: Cypress.env().associateNum,
        transactionType: 1,
        transactionTypeDescription: 'Sale',
        transactionStatus: 1,
        transactionStatusDescription: 'Active'
      })
      expect(res.body.items[0]).to.contain({
        transactionItemIdentifier: 1,
        upc: Cypress.env().yetiTumblerUPC,
        sku: Cypress.env().yetiTumblerSku,
        style: Cypress.env().yetiTumblerStyle,
        description: Cypress.env().yetiTumblerDescription,
        quantity: 1,
        returnPrice: Number(yetiApiResponsePrice),
        promptForPrice: false,
        unitPrice: Number(yetiApiResponsePrice),
        referencePrice: Number(yetiApiResponsePrice),
        everydayPrice: Number(yetiApiResponsePrice),
        priceOverridden: false,
        originalUnitPrice: Number(yetiApiResponsePrice),
        nonTaxable: false,
        hierarchy: Cypress.env().yetiTumblerHierarchy,
        giftReceipt: false
      })
      expect(res.body.items[0].imageUrl).to.contain(yetiImageUrl)
      expect(res.body.items[0].variants).to.contain({
        Color: Cypress.env().yetiTumblerColor,
        Capacity: Cypress.env().yetiTumblerCapacity
      })
      expect(res.body.items[0].attributes).to.be.empty
      expect(res.body.items[0].appliedDiscounts).to.be.empty
      expect(res.body.tenders[0]).to.contain({
        tenderType: 1,
        tenderTypeDescription: 'Cash',
        amount: Number(tenderAmount)
      })
      expect(res.body.coupons).to.be.empty
      expect(res.body.rewardCertificates).to.be.empty
      expect(res.body.receiptMessages).not.to.be.null
      expect(res.body.total).to.contain({
        subTotal: Number(subTotal),
        tax: Number(Tax),
        grandTotal: Number(grandTotal),
        changeDue: Number(changeDue),
        remainingBalance: Number(remainingBalance)
      })
    })
    tags.newTransactionButton().click()
    cy.onlineCloseRegister()
  })
})
