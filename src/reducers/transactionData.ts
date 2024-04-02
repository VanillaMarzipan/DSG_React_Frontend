import {
  CLEAR_TRANSACTION_DATA,
  REPLACE_TRANSACTION_DATA,
  UPDATE_TRANSACTION_DATA
} from '../actions/transactionActions'

export type ManagerOverride = {
  managerId: string
}

/**
 * TypeScript type for Coupon.
 * State is an enum with the following values:
 *   Unknown = 0,
 *   Applied = 1,
 *   AppliedWithExclusions = 2,
 *   Expired = 3,
 *   Invalid = 4
 */
export type Coupon = {
  couponCode: string
  expirationDate: string
  description: string
  couponState: number
  couponPromotionStatus: number
  expiredCouponManagerOverride?: ManagerOverride
}

export interface ItemDiscount {
  discountId: string
  discountDescription: string
  discountAmount: number
  discountBasePrice: number
  couponCode?: string
  rewardCertificateNumber?: string
}

export interface RewardCertificates {
  status: number
  statusDescription: string
  rewardAmount: number
  rewardCertificateNumber: string
  expirationDate: string
  expired: boolean
  rewardCertificateType: number
  rewardTypeDescription: string
}

export interface Item {
  transactionItemIdentifier: number
  upc?: string
  sku?: string
  style?: string
  description: string
  quantity?: number
  unitPrice?: number
  originalUnitPrice?: number
  returnPrice?: number
  variants?
  imageUrl?: string
  nonTaxable?: boolean
  hierarchy?: string
  attributes?: []
  associatedItems?: Array<Item>
  appliedDiscounts?: Array<ItemDiscount>
  everydayPrice?: number
  referencePrice?: number
  overridePrice?: number
  priceOverridden?: boolean
  giftReceipt?: boolean
  promptForPrice?: boolean
  sequenceNumber?: number
  accountNumber?: string
  amount?: number
  adyenTransactionId?: string
  adyenTimestamp?: Date
  sellingAssociateId?: string
  editPriceManagerOverride?: ManagerOverride
}

export type TransactionItemAttributesType =
  | 8 // isNikeExclusive

export interface DisplayItemType {
  transactionItemIdentifier: number
  description: string
  upc?: string
  sku?: string
  style?: string
  quantity?: number
  unitPrice?: number
  originalUnitPrice?: number
  returnPrice?: number
  variants?
  imageUrl?: string
  nonTaxable?: boolean
  hierarchy?: string
  attributes?: Array<TransactionItemAttributesType>
  associatedItems?: Array<Item>
  appliedDiscounts?: Array<ItemDiscount>
  everydayPrice?: number
  referencePrice?: number
  overridePrice?: number
  priceOverridden?: boolean
  giftReceipt?: boolean
  promptForPrice?: boolean
  customerOrderNumber?: string
  distributionOrderNumber?: string
  skuDescription?: string
  returnEligibility?: Array<string>
  lineNumber?: number
  returnItem?: boolean
  sequenceNumber?: number
  damaged?: boolean
  accountNumber?: string
  amount?: number
  adyenTransactionId?: string
  adyenTimestamp?: Date
  sellingAssociateId?: string
}

export interface OriginalTendersType {
  tenderType: string
}

export interface OriginalSaleInformationType {
  nonReceiptedReturnManagerOverride?: ManagerOverride
  returnItems: Array<DisplayItemType>
  returnSource?: number
  originalTenders: Array<OriginalTendersType>
  returnOriginationType?: 0 | 1 | 2 | 3 | 5// receipted, nonReceipted, giftReceipt, loyaltyLookup, tradeIn (respectively)
  customerOrderNumber: string
}

export interface TransactionCustomerType {
  loyaltyNumber: string
}

interface AssociateDiscountDetailsType {
  associateId: string
  familyNight: boolean
  percentOff?: number
  couponCode?: string
}

export interface TaxSummary {
  taxType: string
  amount: number
}

export interface TransactionDataTypes {
  rewardCertificates?: Array<RewardCertificates>
  header?: {
    storeNumber: number
    registerNumber: number
    transactionNumber: number
    startDateTime: string
    endDateTime?: string
    timezoneOffset: number
    associateId: string
    transactionType: number
    transactionTypeDescription: string
    transactionStatus: number
    transactionStatusDescription: string
    tenderIdentifier: string
    transactionKey: string
    associateDiscountDetails?: AssociateDiscountDetailsType
  }
  items?: Array<Item>
  originalSaleInformation?: OriginalSaleInformationType[]
  tempUpc?: string
  // eslint-disable-next-line
  tenders?: any[]
  total?: {
    subTotal: number
    tax: number
    grandTotal: number
    changeDue: number
    discount?: number
    remainingBalance: number
    taxSummaries?: TaxSummary[]
  }
  customer?: TransactionCustomerType
  coupons?: Coupon[]
  isTaxExempt?: boolean
}

interface ActionType {
  type: string
  data: TransactionDataTypes
}

const transactionData = (
  state: TransactionDataTypes = {},
  action: ActionType
): TransactionDataTypes => {
  switch (action.type) {
  case UPDATE_TRANSACTION_DATA:
    return {
      ...state,
      ...action.data
    }
  case REPLACE_TRANSACTION_DATA:
    return {
      ...action.data
    }
  case CLEAR_TRANSACTION_DATA:
    return {}
  default:
    return state
  }
}

export default transactionData
