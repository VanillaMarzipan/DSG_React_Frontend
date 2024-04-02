// Mocked data for development purposes

// Credit Enrollment Response
export const creditApprovalRes = {
  Apr: '26.99',
  RefusalReasonRaw: '0010 : APPROVED (200)',
  ApplicationId: '40024H',
  CashAdvanceApr: '29.99',
  CashAdvanceDailyRate: '0.08217',
  CreditLine: '500.00',
  DailyRate: '0.07395',
  DecisionCode: '0010',
  Decision: 'APPROVED',
  DelinquencyApr: '',
  DelinquencyRate: '',
  ProductCode: '010',
  ReasonCode: '',
  TempCreditLimit: '0',
  TempPassExpiryDate: '10/10/2021',
  Result: {
    Status: 1, // 0 successful response from bank, 1 failed response
    PaymentErrorResponse: {
      ErrorCondition: 2
    },
    ProcessorReference: null,
    MerchantOverrideFlag: null,
    OnlineFlag: null
  },
  Tender: {
    AuthorizedAmount: null,
    CurrencyConversion: null,
    PaymentInstrumentType: null,
    Card: {
      Brand: 101,
      TenderType: null,
      MaskedPan: null,
      ExpiryDate: null,
      CountryCode: null,
      EntryMode: null,
      AvailableBalance: null,
      Token: {
        TokenType: 0,
        TokenValue: '831633012169728C.2021093000879158930048',
        TokenExpiry: '0001-01-01',
        TokenExpirySpecified: null
      }
    },
    AuthenticationMethod: null
  },
  PoiData: {
    TransactionID: '17E0001633012145001',
    TimeStamp: '2021-09-30T14:29:05Z',
    POIReconciliationID: '1000'
  },
  AcquirerData: null,
  AdditionalResponse: {
    acquirerCode: 'Synchrony560',
    alias: 'A636568840083305',
    aliasType: 'Default',
    avsResult: '0 Unknown',
    backendGiftcardIndicator: 'false',
    cardScheme: 'synchrony_cbcc',
    cardType: 'synchrony_plcc',
    cvcResult: '0 Unknown',
    giftcardIndicator: 'false',
    iso8601TxDate: '2021-09-30T10:29:05-04:00',
    merchantReference: '2021093000879158930048',
    paymentMethod: 'synchrony_cbcc',
    paymentMethodVariant: 'synchrony_cbcc',
    posAmountCashbackValue: '0',
    posAmountGratuityValue: '0',
    posAuthAmountCurrency: 'USD',
    posAuthAmountValue: '0',
    posOriginalAmountValue: '0',
    'posadditionalamounts.originalAmountCurrency': 'USD',
    'recurring.recurringDetailReference': '831633012169728C',
    'recurring.shopperReference': '2021093000879158930048',
    refusalReasonRaw: '0010 : APPROVED (200)',
    'retailCard.applicationId': '40024H',
    'retailCard.apr': '26.99',
    'retailCard.cashAdvanceAPR': '29.99',
    'retailCard.cashAdvanceDailyRate': '0.08217',
    'retailCard.creditLine': '500.00',
    'retailCard.dailyRate': '0.07395',
    'retailCard.decisionCode': '0010',
    'retailCard.decisionMessage': 'APPROVED',
    'retailCard.deliquencyApr': '',
    'retailCard.deliquencyRate': '',
    'retailCard.productCode': '010',
    'retailCard.reasonCode': '',
    'retailCard.tempCreditLimit': '0',
    'retailCard.tempPassExpiryDate': '20211010',
    shopperEmail: 'test@test.com',
    shopperReference: '2021093000879158930048',
    tid: '88924120',
    transactionType: 'GOODS_SERVICES',
    txdate: '30-09-2021',
    txtime: '10:29:05'
  },
  Raw: null
}
