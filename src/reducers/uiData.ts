import { UPDATE_CREDIT_PANEL, UPDATE_LOADING_STATES, UPDATE_UI_DATA } from '../actions/uiActions'
import { DonationOption } from '../reducers/configurationData'

export type PanelsType =
  | 'cashPanel'
  | 'warrantyPanel'
  | 'paymentPanel'
  | 'changePanel'
  | 'scanDetailsPanel'
  | 'loginPanel'
  | 'creditPanel'
  | 'initialScanPanel'
  | 'tenderAmountPanel'

export type Modals =
  | 'ageRestriction'
  | 'athleteIsAgeRestricted'
  | 'cashDrawerOpen'
  | 'recall'
  | 'launch'
  | 'error'
  | 'retryFailedOperation'
  | 'feedback'
  | 'healthCheck'
  | 'returns'
  | 'creditEnrollment'
  | 'postVoid'
  | 'couponOverride'
  | 'manualTransactionDiscount'
  | 'manualItemDiscount'
  | 'returnsAuthorization'
  | 'giftCardBalanceInquiry'
  | 'sellGiftCard'
  | 'rewardAmountExceedsDiscountedAmount'
  | 'connectPinpadModal'
  | 'sportsMatterRoundUp'
  | 'sportsMatterCampaign'
  | 'void'
  | 'suspend'
  | 'confirmCloseRegister'
  | 'managerOverride'
  | 'stressPinpadModal'
  | 'taxExemptSale'
  | 'gettingStarted'
  | 'createGiftCard'
  | 'referencedRefund'
  | 'alternateRefundTender'
  | false

export type SelectedItems =
  | 'LOYALTY_PANEL'
  | 'SCORECARD_TEXTBOX'
  | 'couponPanel'
  | 'rewardPanel'
  | 'associateDiscountPanel'
  | string
  | number

export type AutofocusTextbox =
  | 'OmniSearch'
  | 'LoyaltyMiniViewController'
  | 'LoyaltyAdvancedSearch'
  | 'LoyaltyCreateAccount'
  | 'Modal'
  | 'Login'
  | 'CashTender'
  | 'NsppAssociateId'
  | 'PriceEdit'
  | 'ReturnsLookup'
  | 'ItemLevelSap'
  | 'ItemLookup'
  | 'ReprintGiftReceipt'
  | 'ManagerOverride'
  | 'None'

/**
 * Object representing a barcode scan
 */
export type ScanEvent = {
  // Barcode value received from Cefsharp
  scanValue?: string

  // UTC time that the barcode scan event was received
  scanTime: number
}

export type GetCardDataEventType = {
  lastFour: string
  cardBrand: string
}

export type FooterOverlayActiveType =
  | 'None'
  | 'Register'
  | 'Receipts'
  | 'Teammate'
  | 'ItemLookup'
  | 'GiftCard'

export type FailedOperation =
  | 'createNewCreditTender'
  | 'closeRegister'
  | 'finalizeTransaction'

export type ReturnsError =
  | 'generalError'
  | 'orderNotFound'
  | boolean

export type SportsMatterCampaignModalDisplayType =
  | 'selections'
  | 'otherAmount'

export type TaxExemptError =
  | 'invalidCustomerNumber'
  | 'general'

export interface ApplicationError {
  state?: string
  detail?: string
}

export interface LoadingStatesTypes {
  omniSearch?: string
  loyaltyLookup?: boolean
  signIn?: boolean
  complete?: boolean
  loyaltyEnrollment?: boolean
  loyaltyAdvanced?: boolean
  loyaltyEdit?: boolean
  void?: boolean
  postVoid?: boolean
  getAssociateById?: boolean
  closeRegister?: boolean
  addLoyaltyToTransaction?: boolean
  accountLevelDetails?: boolean
  removeLoyaltyAccount?: boolean
  editItemPrice?: null | number
  updateGiftReceipts?: boolean
  frontendAutoVoid?: boolean
  getReturns?: boolean
  addReturnItems?: boolean
  creditEnrollment?: boolean
  authorizeReturn?: boolean
  deleteItem?: null | number
  getItemLevelSapAssociate?: boolean
  fetchLowestReturnPrice?: boolean
  addNonReceiptedReturnItems?: boolean
  createNoSaleTransaction?: boolean
  removeReward?: boolean
  removeCoupon?: boolean
  addSportsMatterRoundUp?: boolean | '1.00' | 'round-up'
  feedback?: boolean
  newTender?: boolean
  manualDiscount?: boolean
  fetchProductLookupSearchResults?: boolean
  fetchProductLookupDetails?: boolean
  fetchProductLookupCategories?: boolean
  fetchLowestPriceAndName?: boolean
  fetchProductByUpc?: boolean
  healthCheckLoading?: boolean
  managerOverrideLoading?: boolean
  transactionByBarcode?: boolean
  sellGiftCard?: boolean
  giftCardActivation?: boolean
  addAssociateDiscount?: boolean
  taxExemptLookup?: boolean
  getRefundMethods?: boolean
  getReferencedRefund?: boolean
  alternateRefundOverride?: boolean
  addTradeInItems?: boolean
}

export type UiDataErrorTypes =
  | boolean
  | 'addSportsMatterRoundUp'

export interface UiDataTypes {
  loginError?: boolean
  showNewTransactionButton?: boolean
  selectedItem?: SelectedItems
  lastItem?: string | number
  autoFocus?: boolean
  clearUpc?: boolean
  scanError?: boolean
  scanErrorMessage?: string
  storeCreditError?: boolean
  error?: UiDataErrorTypes
  cashError?: boolean
  creditPanelError?: string
  creditPanelErrorInstructions?: string
  showModal?: Modals
  errorMessage?: string
  modalErrorMessage?: string
  activePanel?: PanelsType
  previousPanel?: PanelsType
  priceEditActive?: boolean
  failedOperation?: FailedOperation | null
  scanEvent?: ScanEvent
  autofocusTextbox?: AutofocusTextbox
  footerOverlayActive?: FooterOverlayActiveType
  returnsError?: ReturnsError | boolean
  taxExemptError?: TaxExemptError
  getCardDataEvent?: GetCardDataEventType
  giftCardAccountNumber?: string
  giftCardExpirationDate?: string
  giftCardError?: string
  giftCardState?: string
  manualDiscountError?: boolean | string
  tenderType?: string
  processingTempPass?: boolean
  accountNumber?: string
  shutdownEndzone?: boolean
  processingAccountLookupTender?: boolean
  displayInsertCard?: boolean
  showItemLevelSap?: boolean
  showAddAssociateDiscount?: boolean
  loadingStates?: LoadingStatesTypes
  giftCardTenderResponse?: string
  giftCardBalanceInquiryResponse?: string
  configurePinpadSuccess?: boolean
  customerRespondedToSportsMatter?: boolean
  productLookupPanelSelected?: boolean
  storeServicesPanelSelected?: boolean
  lowestPriceInquiryPanelSelected?: boolean
  helpButtonWarningIndicator?: boolean
  healthCheckCloseAndRetryPanel?: boolean
  enhancedPostVoidPanelSelected?: boolean
  applicationError?: ApplicationError
  lastQueriedCouponCode?: string
  couponToDisplayIndex?: number
  sportsMatterCampaignModalDisplay?: SportsMatterCampaignModalDisplayType
  sportsMatterDonationSelectionResponse?: DonationOption
  modalClosedByUser?: Modals
  pinpadPhoneEntryEnabled?: boolean
  callRefundMethodsAfterReturnsAuth?: boolean
  suspendMessage?: string
}

const uiData = (
  state: UiDataTypes = {
    loginError: false,
    showNewTransactionButton: false,
    selectedItem: null,
    lastItem: null,
    autoFocus: true,
    clearUpc: false,
    scanError: false,
    error: false,
    cashError: false,
    creditPanelError: null,
    creditPanelErrorInstructions: null,
    showModal: false,
    errorMessage: null,
    modalErrorMessage: null,
    activePanel: 'loginPanel',
    previousPanel: null,
    priceEditActive: false,
    failedOperation: null,
    scanEvent: null,
    autofocusTextbox: 'OmniSearch',
    footerOverlayActive: 'None',
    returnsError: false,
    taxExemptError: null,
    getCardDataEvent: null,
    giftCardAccountNumber: null,
    giftCardExpirationDate: null,
    giftCardError: null,
    giftCardState: '',
    manualDiscountError: false,
    tenderType: null,
    processingTempPass: false,
    accountNumber: '',
    shutdownEndzone: false,
    processingAccountLookupTender: false,
    displayInsertCard: false,
    showItemLevelSap: false,
    showAddAssociateDiscount: false,
    giftCardTenderResponse: null,
    giftCardBalanceInquiryResponse: null,
    configurePinpadSuccess: null,
    customerRespondedToSportsMatter: false,
    productLookupPanelSelected: false,
    storeServicesPanelSelected: false,
    lowestPriceInquiryPanelSelected: false,
    helpButtonWarningIndicator: false,
    healthCheckCloseAndRetryPanel: false,
    enhancedPostVoidPanelSelected: false,
    applicationError: null,
    sportsMatterCampaignModalDisplay: 'selections',
    couponToDisplayIndex: 0,
    modalClosedByUser: false,
    pinpadPhoneEntryEnabled: false,
    callRefundMethodsAfterReturnsAuth: false,
    suspendMessage: null,
    loadingStates: {
      omniSearch: null,
      loyaltyLookup: false,
      signIn: false,
      complete: false,
      loyaltyEnrollment: false,
      loyaltyAdvanced: false,
      loyaltyEdit: false,
      void: false,
      postVoid: false,
      getAssociateById: false,
      closeRegister: false,
      addLoyaltyToTransaction: false,
      accountLevelDetails: false,
      removeLoyaltyAccount: false,
      editItemPrice: null,
      updateGiftReceipts: false,
      frontendAutoVoid: false,
      getReturns: false,
      addReturnItems: false,
      creditEnrollment: false,
      authorizeReturn: false,
      deleteItem: null,
      getItemLevelSapAssociate: false,
      fetchLowestReturnPrice: false,
      addNonReceiptedReturnItems: false,
      createNoSaleTransaction: false,
      removeReward: false,
      addSportsMatterRoundUp: false,
      feedback: false,
      newTender: false,
      manualDiscount: false,
      fetchProductLookupSearchResults: false,
      fetchProductLookupDetails: false,
      managerOverrideLoading: false,
      fetchLowestPriceAndName: false,
      healthCheckLoading: false,
      transactionByBarcode: false,
      sellGiftCard: false,
      giftCardActivation: false,
      addAssociateDiscount: false,
      taxExemptLookup: false,
      getRefundMethods: false,
      getReferencedRefund: false,
      alternateRefundOverride: false
    }
  },
  action
): UiDataTypes => {
  switch (action.type) {
  case UPDATE_LOADING_STATES:
    return {
      ...state,
      loadingStates: {
        ...state.loadingStates,
        ...action.data
      }
    }
  case UPDATE_UI_DATA:
  case UPDATE_CREDIT_PANEL:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default uiData
