import { ReturnOriginationEnumType, UPDATE_RETURN_DATA } from '../actions/returnActions'
import { Customer } from './loyaltyData'

type FetchLowestReturnPriceErrorType =
  | 'upcNotFound'
  | 'generalError'

export type LoyaltyAccountsFoundErrorType =
  | 'generalError'
  | 'noAccountsFound'
  | 'noOrdersFound'

export interface ReturnOrderType {
  customerOrderNumber: string
  chain: string
  originalSaleInfo: OriginalSaleInfoType
  orderUnits: Array<ReturnItemType>
  calculatedTotal: number
}

interface IncrementedGiftcardRefundsType {
  incrementedAmount: number
  refunded: boolean
  giftCardListNumber: number
  giftCardIdentifier: string
}

export interface ReturnDataType {
  returnableItems?: ReturnItemType[]
  nonReturnableItems?: ReturnItemType[]
  returnAuthorizationData?: ReturnAuthorizationResponseType
  nonReceiptedReturnItems?: LowestReturnPriceItem[]
  nonReceiptedReturnActive?: boolean
  fetchLowestReturnPriceError?: FetchLowestReturnPriceErrorType
  addNonReceiptedReturnItemsError?: boolean
  returnsLoyaltyAccountsFound?: Array<Customer>
  selectedReturnsLoyaltyAccount?: Customer
  returnsLoyaltyAccountsFoundError?: LoyaltyAccountsFoundErrorType
  lookedUpOrders?: Array<ReturnOrderType>
  returnOriginationType?: ReturnOriginationEnumType
  giftCardRefundTracker?: Array<IncrementedGiftcardRefundsType>
  tradeInItems?: Array<TradeInItem>
}

export interface TradeInItem {
  description: string
  upc: string
  sku: string
  style: string
  vertexTaxCode: string
  variants: Record<string, unknown>
  imageUrl: string
  hierarchy: string
  quantity: number
  returnPrice?: number
  checked: boolean
}

export interface LowestReturnPriceItem {
  product: {
    description: string
    upc: string
    sku: string
    style: string
    vertexTaxCode: string
    variants: Record<string, unknown>
    imageUrl: string
    hierarchy: string
    // eslint-disable-next-line
    attributes: Array<any>
    quantity: number
    damaged: boolean
  }
  returnPrice: number
  transactionItemId: number
}

export interface OriginalSaleInfoType {
  scorecardNumber: string | null
  tenders: ReturnTenderType[] | null
  transactionDate?: string
}

export interface ReturnTenderType {
  adyenMerchantReferenceNumber?: string
  adyenPspNumber: string
  cardNumber: string
  tenderType: string
}

export interface ReturnItemType {
  customerOrderNumber: string
  distributionOrderNumber: string
  sku: string
  skuDescription: string
  upc: string
  returnEligibility: Array<string>
  returnPrice: number
  lineNumber: number
  sequence?: number
  transactionItemIdentifier?: number
  returnItem?: boolean
  sequenceNumber?: number
  damaged?: boolean
}

export type EligibleType =
  | 'ELIGIBLE'

export interface ReturnTaxInfoType {
  actualTax: number
  estimatedTax: number
  vertexProductTaxId: string
}

export interface ReturnAuthorizationResponseType {
  transactionId: string
  action: string
  screenMessage: string
  printMessage: string
  ruleName: string
  ruleDescription: string
  rewardMessage: string
  repromptAction: string
  overrideAllowed: false
  statusCode?: number
  message?: string
}

const returnData = (
  state: (ReturnDataType) = {
    nonReturnableItems: [],
    returnableItems: [],
    returnAuthorizationData: null,
    nonReceiptedReturnItems: [],
    nonReceiptedReturnActive: false,
    tradeInItems: [],
    fetchLowestReturnPriceError: null,
    addNonReceiptedReturnItemsError: false,
    returnsLoyaltyAccountsFound: null,
    selectedReturnsLoyaltyAccount: null,
    returnsLoyaltyAccountsFoundError: null,
    giftCardRefundTracker: [],
    lookedUpOrders: null,
    returnOriginationType: null
  },
  action
): ReturnDataType => {
  switch (action.type) {
  case UPDATE_RETURN_DATA:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default returnData
