const { defineConfig } = require('cypress')
const { cloudPlugin } = require('cypress-cloud/plugin')

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  execTimeout: 30000,
  viewportWidth: 1200,
  viewportHeight: 800,
  retries: 0,
  screenshotOnRunFailure: true,
  video: false,
  projectId: 'reactpos',

  env: {
    //  Variables for API tests
    devUrlPrefix: 'https://poscoordinator-dev.dcsg.com/api/v9/',
    stageUrlPrefix: 'https://poscoordinator-stg.dcsg.com/api/v9/',
    //  DevStore variable
    devRegisterIdMacAddress: 'B1641484576347',
    devStoreChain: 1,
    devStoreNumber: 879,
    devRegisterNumber: 107,
    devStoreDescription: 'DICKS SPORTING GOODS',
    devStoreStreetAddress: '345 COURT STREET',
    devStoreCity: 'PITTSBURGH',
    devStoreState: 'PA',
    devStoreZip: '15275',
    devStorePhoneNumber: '724-273-3400',
    //  StageStore Variable
    stageRegisterIdMacAddress: 'B1619452481704',
    stageRegisterNumber: 106,
    stageStoreNumber: 888,
    stageStoreZip: '15108',
    //  Logins
    associateNum: '1234567',
    associatePIN: '111111',
    associateFirstName: 'Johnny',
    associateLastName: 'Cashier',
    warrantySellingAssociateNum: '9876543',
    warrantySellingAssociatePIN: '222222',
    warrantySellingAssociateFirstName: 'Jane',
    warrantySellingAssociateLastName: 'Manager',
    taxRate: 0.07,
    //  Pepsi item info
    dietPepsiUPC: '012000001307',
    dietPepsiPrice: '2.29',
    dietPepsiDescription: 'DIET PEPSI 20 OZ',
    //  Tumbler item info
    yetiTumblerUPC: '888830050118',
    yetiTumblerDescription: 'YETI 20 oz. Rambler Tumbler with MagSlider Lid',
    yetiTumblerColor: 'Sand',
    yetiTumblerCapacity: '20 oz',
    yetiTumblerPrice: '35.00',
    devYetiTumblerImageUrl:
            'https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1',
    stageYetiTumblerImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand?req-img&fmt=png&op_sharpen=1',
    genericYetiTumblerImageUrl: '/Image/RemoteImage/17YETARMBLR20WMGSODR_Sand',
    yetiTumblerHierarchy: '283-001-001-002',
    yetiTumblerStyle: '21070060016',
    yetiTumblerSku: '019824277',
    smPromptForPriceUPC: '400000897646',
    smDescription: 'DSG FOUNDATION',
    //  Baseball item info
    baseballGloveUPC: '083321578120',
    baseballGloveDescription: 'Rawlings 12’’ Youth Highlight Series Glove 2019',
    baseballGlovePrice: 49.99,
    baseballGloveOneYearWarrantyPrice: 8.99,
    baseballGloveOneYearWarrantyDescription: '1 Year Replacement Plan',
    baseballGloveWarrantySoldBy: 'Sold by 9876543 Jane Manager',
    otherBaseballGlove: '887768671082',
    otherBaseballGloveDescription: 'Wilson 12.5’’ A950 Series Glove',
    //  Shoes info
    runningShoesUPC: '190340371394',
    runningShoesDescription: 'Brooks Women’s Addiction 13 Running Shoes',
    runningShoesPrice: 129.99,
    runningShoesImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17BROWDDCTN13XXXXRNN_Black_Pink_Grey?req-img&fmt=png&op_sharpen=1',
    runningShoesColor: 'Black/Pink/Grey',
    //  Bike item info
    recumbantBikeUPC: '795447115584',
    recumbantBikeDescription: 'XTERRA Fitness RSX1500 Recumbent Stepper',
    recumbantBikePrice: 1599.99,
    devRecumbantBikeImageUrl:
            'https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17NVJURSX1500RCMBMSC?req-img&fmt=png&op_sharpen=1',
    stageRecumbantBikeImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/17NVJURSX1500RCMBMSC?req-img&fmt=png&op_sharpen=1',
    generalRecumbantBikeImageUrl: '/Image/RemoteImage/17NVJURSX1500RCMBMSC?req-img&fmt=png&op_sharpen=1',
    recumbantBikeHierarchy: '350-002-004-001',
    recumbantBikeStyle: '115518',
    recumbantBikeSku: '018831374',
    //  Sweatpants item info
    nikeSweatpantsUPC: '196149321257',
    nikeSweatpantsPrice: 65.00,
    nikeSweatpantsDescription: 'Nike Women’s Sportswear Phoenix Fleece High-Rise Sweatpants',
    //  Warranty item info
    bike4YearWarrantyDescription: '4 Year Cardio Plan',
    bike4YearWarrantyUPC: '400001000939',
    bike4YearWarrantySku: '013676838',
    bikeWarrantyHierarchy: '001-006-200-200',
    bike4YearWarrantyStyle: 'NM CARDIO 4Y 4',
    bikeWarrantyTaxCode: '81000',
    devBike4YearWarrantyImageUrl:
            'https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU4YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    stageBike4YearWarrantyImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU4YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    bike4YearWarrantyPrice: 299.99,
    bike3YearWarrantyDescription: '3 Year Cardio Plan',
    bike3YearWarrantyUPC: '400001000885',
    bike3YearWarrantySku: '013676827',
    bike3YearWarrantyStyle: 'NM CARDIO 3Y 4',
    devBike3YearWarrantyImageUrl:
            'https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU3YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    stageBike3YearWarrantyImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU3YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    bike3YearWarrantyPrice: 229.99,
    bike2YearWarrantyDescription: '2 Year Cardio Plan',
    bike2YearWarrantyUPC: '400001000830',
    bike2YearWarrantySku: '013676817',
    bike2YearWarrantyStyle: 'NM CARDIO 2Y 4',
    devBike2YearWarrantyImageUrl:
            'https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU2YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    stageBike2YearWarrantyImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU2YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    bike2YearWarrantyPrice: 159.99,
    bike1YearWarrantyDescription: '1 Year Cardio Plan',
    bike1YearWarrantyUPC: '400001000786',
    bike1YearWarrantySku: '013676807',
    bike1YearWarrantyStyle: 'NM CARDIO 1Y 4',
    devBike1YearWarrantyImageUrl:
            'https://posimageservice-pcidev.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU1YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    stageBike1YearWarrantyImageUrl:
            'https://posimageservice.appssec.an01.pcf.dcsg.com/api/v1/Image/RemoteImage/16DSGU1YR4CRDXTPLNMW?req-img&fmt=png&op_sharpen=1',
    bike1YearWarrantyPrice: 129.99,
    //  Recall item info
    recallUPC: '013658112247',
    //  Launch item
    launchUPC: '400001930397',
    //  Golf club item info
    golfClubUPC: '889751127996',
    golfClubDescription: 'Top Flite XL Driver',
    golfClubPrice: 24.97,
    // Age Restricted item info
    age18RestrictedCO2tankUPC: '400001571002',
    age18RestrictedCO2tankDescription: 'BEVERAGE GRADE CO2 TANK EXCHNG',
    age18RestrictedCO2tankPrice: 49.99,
    age21Restricted22AmmoUPC: '076683000279',
    age21Restricted22AmmoDescription: 'CCI .22 Short HP Ammo – 100 Rounds',
    age21Restricted22AmmoPrice: 12.99,
    //  Prompt for price
    promptForPriceUPC: '400000897646',
    promptForPriceDescription: 'DSG FOUNDATION',
    //  Reward certificate info
    rewardCertificate: 'R0002601320000003',
    //  Coupons info
    coupon10off50: 'P00043458',
    couponNotFound: 'P00093608',
    couponExpired: 'P00043607',
    overrideExpiredCoupon: 'P00045194',
    overrideNoPromotionsCoupon: 'P00044905',
    couponNoOverrideNeeded: 'P00044920',
    couponPercentOrDollarOff: 'P00043607',
    coupon20off100: 'P00043608',
    coupon10off50Description: '$10 off $50',
    coupon20percentInput: '20',
    coupon15dollarInput: '15',
    //  Phone numbers info
    phoneNumberNoResults: '0000000001',
    phoneNumberMultipleResults: '4125555555',
    phoneNumberSingleResult: '4124435568',
    phoneAbeLincoln: '7241234321',
    //  Loyalty bar code
    loyaltyBarCodeDonP: 'L01XB23YCLJ1',
    // Customer info
    AbeLincolnFirstName: 'Abraham',
    AbeLincolnLastName: 'Lincoln',
    AbeLincolnStreetAddress: '1600 Pennsylvania Ave NW',
    AbeLincolnCity: 'Washington',
    AbeLincolnState: 'DC',
    AbeLincolnZip: '20500',
    AbeLincolnLoyaltyNumber: '200000030018',
    AbeLincolnLoyaltySubAccount: '20000003',
    //  Return info
    returnDoNumber: '35300843008',
    inStoreReturnReceiptNum: '1048891020673031122016',
    inStoreReturnNoItemEligible: '1048891020673031122016',
    //  Nike Connected item info
    nikeConnectedJacketUPC: '195871683565',
    nikeConnectedJacketDescription: 'Jordan Men’s Zion Williamson Hooded Jacket',
    // Nike Connected account info
    nikeConnectedPhoneNumber: '5555555555',
    nikeConnectedFirstName: 'Nick',
    nikeConnectedLastName: 'A Jordan',
    nikeConnectedAccountNumber: 'L01VB23YCPJD',
    //  Component test variables
    styledTextFont: 'Archivo',
    styledTextColor: 'rgba(0, 0, 0, 0.87)'
  },

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.

    setupNodeEvents (on, config) {
      require('@cypress/code-coverage/task')(on, config)
      on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))

      return cloudPlugin(on, config)
    },

    supportFile: 'cypress/support/e2e.js',
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    }
  }
})
