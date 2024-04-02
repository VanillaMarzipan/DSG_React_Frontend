/// <reference types="cypress" />
import elements from '../../support/pageElements'

context('Gift Receipt tests', () => {

  const tags = new elements()
  const tumblerUPC = Cypress.env().yetiTumblerUPC
  const yetiTumblerBaseballGloveAndGolfClubResponseData = '{"type":"Transaction","transaction":{"header":{"timestamp":1619105764050,"signature":"jfBU10W+AHHXILDTUdpqR9pjIsSBWF+8zD3Imq5XyiM=","transactionKey":"247480087931704222021","tenderIdentifier":"1-247480087931704222021","eReceiptKey":"5008793170011042221014","storeNumber":879,"registerNumber":317,"transactionNumber":11,"startDateTime":"2021-04-22T15:31:20.658591Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":24.97,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":101.95,"tax":7.14,"grandTotal":109.09,"changeDue":0.00,"remainingBalance":109.09}},"upc":"889751127996"}'
  const giftReceiptResponseDataFirstItemOnly = '{"success":true,"statusCode":200,"data":{"header":{"timestamp":1620758304884,"signature":"Na4Azj39MDcKQz0rIniuSmhmr1OBSzwrtEmbaAJM/Rs=","transactionKey":"252320087931705112021","tenderIdentifier":"1-252320087931705112021","eReceiptKey":"5008793170014051121015","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-11T18:37:25.00665Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":true},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":24.97,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":101.95,"tax":7.14,"grandTotal":109.09,"changeDue":0.0,"remainingBalance":109.09}}}'
  const giftReceiptResponseDataSecondItemOnly = '{"success":true,"statusCode":200,"data":{"header":{"timestamp":1620758381540,"signature":"nrMf4jS1BrEb0U2eT+8XeN0YWLDEDNUNY+iNHKR0hgo=","transactionKey":"252320087931705112021","tenderIdentifier":"1-252320087931705112021","eReceiptKey":"5008793170014051121015","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-11T18:37:25.00665Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":true},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":24.97,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":101.95,"tax":7.14,"grandTotal":109.09,"changeDue":0.0,"remainingBalance":109.09}}}'
  const giftReceiptResponseDataThirdItemOnly = '{"success":true,"statusCode":200,"data":{"header":{"timestamp":1620758381540,"signature":"nrMf4jS1BrEb0U2eT+8XeN0YWLDEDNUNY+iNHKR0hgo=","transactionKey":"252320087931705112021","tenderIdentifier":"1-252320087931705112021","eReceiptKey":"5008793170014051121015","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-11T18:37:25.00665Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":false},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":24.97,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":true}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":101.95,"tax":7.14,"grandTotal":109.09,"changeDue":0.0,"remainingBalance":109.09}}}'
  const giftReceiptResponseDataAllItems = '{"success":true,"statusCode":200,"data":{"header":{"timestamp":1620758486922,"signature":"tbHknLL3CnR/yRRZrWLkJ9poUfnSsbXzAa4FezGOeiA=","transactionKey":"252320087931705112021","tenderIdentifier":"1-252320087931705112021","eReceiptKey":"5008793170014051121015","storeNumber":879,"registerNumber":317,"transactionNumber":14,"startDateTime":"2021-05-11T18:37:25.00665Z","timezoneOffset":-240,"associateId":"1234567","transactionType":1,"transactionTypeDescription":"Sale","transactionStatus":1,"transactionStatusDescription":"Active"},"items":[{"transactionItemIdentifier":1,"upc":"888830050118","sku":"019824277","style":"21070060016","description":"YETI 20 oz. Rambler Tumbler with MagSlider Lid","quantity":1,"returnPrice":29.99,"promptForPrice":false,"unitPrice":29.99,"referencePrice":29.99,"everydayPrice":29.99,"priceOverridden":false,"originalUnitPrice":29.99,"variants":{"Color":"Sand","Capacity":"20 oz"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"283-001-001-002","attributes":[],"appliedDiscounts":[],"giftReceipt":true},{"transactionItemIdentifier":2,"upc":"083321578120","sku":"019455863","style":"DICH120BRNC","description":"Rawlings 12’’ Youth Highlight Series Glove 2019","quantity":1,"returnPrice":46.99,"promptForPrice":false,"unitPrice":46.99,"referencePrice":48.99,"everydayPrice":46.99,"priceOverridden":false,"originalUnitPrice":46.99,"variants":{"Color":"Brown","Glove Throw":"Right Hand Throw"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/18RAWY12HGHLGHTBRBGL_Brown?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"330-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":true},{"transactionItemIdentifier":3,"upc":"889751127996","sku":"016510954","style":"TF16XLDVRMRH","description":"Top Flite XL Driver","quantity":1,"returnPrice":24.97,"promptForPrice":false,"unitPrice":24.97,"referencePrice":39.99,"everydayPrice":24.97,"priceOverridden":false,"originalUnitPrice":24.97,"variants":{"Hand":"Right Hand","Loft":"10.5°","Flex":"Regular Flex","Shaft":"Graphite"},"imageUrl":"https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16TFLMTPFLT2016XLDRV?req-img&fmt=png&op_sharpen=1","nonTaxable":false,"hierarchy":"130-001-001-001","attributes":[],"appliedDiscounts":[],"giftReceipt":true}],"tenders":[],"coupons":[],"rewardCertificates":[],"receiptMessages":[],"total":{"subTotal":101.95,"tax":7.14,"grandTotal":109.09,"changeDue":0.0,"remainingBalance":109.09}}}'

  const clickReceiptOptions = () => {
    tags.complete().should('be.visible')
    tags.receiptOptions().should('be.visible')
        .click()
  }

  beforeEach(() => {
    cy.launchPageLoggedIn()
  })

  it('Test 1: The clicking receipt options displays receipt reprint, and gift receipt buttons', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.reprintLastReceiptButton().should('be.visible')
    tags.giftReceiptButton().should('be.visible')
    tags.reprintGiftReceiptButton().should('be.visible')
  })

  it('Test 2: Clicking the gift receipt button brings up a pane, with a select all, individual options, and a confirm button.', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.receiptOptions().should('be.visible')
    tags.giftReceiptsSelectAllOption().should('be.visible')
    tags.giftReceiptSelectItem1().should('be.visible')
    tags.giftReceiptSelectItem2().should('be.visible')
    tags.giftReceiptSelectItem3().should('be.visible')
    tags.descriptionItem1().should('contain.text', 'YETI 20 oz. Rambler Tumbler with MagSlider Lid')
    tags.priceItem1().should('contain.text', '29.99')
    tags.upcItem1().should('contain.text', '88830050118')
    tags.descriptionItem2().should('contain.text', 'Rawlings 12’’ Youth Highlight Series Glove 2019')
    tags.priceItem2().should('contain.text', '46.99')
    tags.upcItem2().should('contain.text', '083321578120')
    tags.descriptionItem3().should('contain.text', 'Top Flite XL Driver')
    tags.priceItem3().should('contain.text', '24.97')
    tags.upcItem3().should('contain.text', '889751127996')
    tags.giftReceiptsSelectAllOption().should('be.visible')
    tags.selectItemsForGiftReceiptButton().should('be.visible').and('have.css', 'background-color', 'rgb(200, 200, 200)')
  })

  it('Test 3: Cannot press the confirm button if no gift receipt options have been selected.', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptConfirmSingleButton().should('not.exist')
  })

  it('Test 4: Selecting the first item and clicking the confirm button, puts a G next to the item in the transaction card.', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptSelectItem1().click()
    cy.giftReceipt(giftReceiptResponseDataFirstItemOnly)
    tags.giftReceiptSelectedIndicator1().should('be.visible')
    tags.giftReceiptSelectedIndicator2().should('not.exist')
    tags.giftReceiptSelectedIndicator3().should('not.exist')
  })

  it('Test 5: Selecting the second item and clicking confirm, puts a G next to the second item in the transaction card.', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptSelectItem2().click()
    cy.giftReceipt(giftReceiptResponseDataSecondItemOnly)
    tags.giftReceiptSelectedIndicator1().should('not.exist')
    tags.giftReceiptSelectedIndicator2().should('be.visible')
    tags.giftReceiptSelectedIndicator3().should('not.exist')
  })

  it('Test 6: Selecting the third item and clicking confirm, puts a G next to the third item in the transaction card.', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptSelectItem3().click()
    cy.giftReceipt(giftReceiptResponseDataThirdItemOnly)
    tags.giftReceiptSelectedIndicator1().should('not.exist')
    tags.giftReceiptSelectedIndicator2().should('not.exist')
    tags.giftReceiptSelectedIndicator3().should('be.visible')
  })

  it('Test 7: Selecting all items and clicking confirm, puts a G next to all the items in the transaction card.', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptsSelectAllOption().click()
    cy.giftReceipt(giftReceiptResponseDataAllItems)
    tags.giftReceiptSelectedIndicator1().should('be.visible')
    tags.giftReceiptSelectedIndicator2().should('be.visible')
    tags.giftReceiptSelectedIndicator3().should('be.visible')
  })

  it('Test 8: Cannot click One Item per Receipt if there is only one item selected', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptSelectItem1().click()
    tags.giftReceiptConfirmSingleButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
    tags.giftReceiptConfirmSeparateButton().should('have.css', 'background-color', 'rgb(200, 200, 200)')
  })

  it('Test 9: Can click One Item per Receipt button when multiple items are selected', () => {
    cy.addItemOrLoyalty(tumblerUPC, yetiTumblerBaseballGloveAndGolfClubResponseData)
    clickReceiptOptions()
    tags.giftReceiptButton().click()
    tags.giftReceiptSelectItem1().click()
    tags.giftReceiptSelectItem2().click()
    tags.giftReceiptConfirmSingleButton().should('have.css', 'background-color', 'rgb(197, 113, 53)')
    tags.giftReceiptConfirmSeparateButton().should('have.css', 'background-color', 'rgb(0, 101, 84)')
  }) 

})
