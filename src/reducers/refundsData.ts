import {
  ADD_REFUND_METHODS,
  CLEAR_REFUNDS_DATA,
  ADD_REFERENCED_REFUND,
  SET_CURRENT_REFUND_CO,
  SET_REFUND_STATUS,
  SET_REFUND_TENDER_STATUS,
  ADD_REFUND_TO_GIFT_CARD,
  ADD_REFUND_TO_CASH,
  SET_CURRENT_TENDER_ID,
  SET_ALTERNATE_TENDER_TYPE,
  REFRESH_REFUNDS_DATA
} from '../actions/refundsActions'

export enum RefundStatus {
  NotProcessed = 'NOT_PROCESSED',
  ReadyToProcess = 'READY_TO_PROCESS',
  ProcessingPaypal = 'PROCESSING_PAYPAL',
  ProcessingCredit = 'PROCESSING_CREDIT',
  ProcessingGiftCard = 'PROCESSING_GIFT_CARD',
  ProcessingCash = 'PROCESSING_CASH',
  Processed = 'PROCESSED',
  Skip = 'SKIP'
}

export interface IResult {
  Status: 0 | 1 | 2 | 3 | 4 | 100 /* map (respectively): Success, Failure, Pending, Open, Partial, Undefined */
  PaymentErrorResponse: object
  ProcessorReference: string
  MerchantOverrideFlag: boolean | null
  OnlineFlag: boolean | null
}

export interface IAcquirerData {
  TransactionID: string
  TimeStamp: string
  ApprovalCode: string
  AcquirerPOIID: string
}

export enum EndzoneTenderStatus {
  Unprocessed = 'UNPROCESSED',
  Processing = 'PROCESSING',
  CreditFailInitiatingNewTender = 'CREDIT_INITIATING_NEW_TENDER',
  Processed = 'PROCESSED',
  ProcessAsCash = 'PROCESS_AS_CASH'
}

export const brandDisplayMap = {
  0: 'American Express',
  1: 'China Union Pay',
  2: 'Diner\'s Club',
  3: 'Discover',
  4: 'JCB',
  5: 'Maestro',
  6: 'Mastercard',
  7: 'Visa',
  8: 'US PIN Debit',
  9: 'Pulse',
  100: 'DSG Credit Card', /* synchrony plcc */
  101: 'DSG Mastercard', /* synchrony comc */
  102: 'Gift Card', /* valuelink giftcard */
  103: 'Cash'
}
export interface ITender {
  Amount: number
  Brand?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 100 | 101 | 102 | 103 | null /* map (respectively): AMERICAN_EXPRESS, CHINA_UNION_PAY, DINERS_CLUB, DISCOVER, JCB, MAESTRO, MASTERCARD, VISA, US_PIN_DEBIT, PULSE, SYNCHRONY_PLCC = 100, SYNCHRONY_COMC = 101, VALUELINK_GIFTCARD = 102, CASH = 103, null */
  TenderType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null /* map (respectively): CHARGE, CREDIT, DEBIT, DEFERRED_DEBIT, PREPAID, PREPAID_RELOADABLE, PREPAID_NONRELOADABLE, CASH, GIFTCARD, PAYPAL, null */
  MaskedPan?: string
  ProcessorReference?: string
  ExpiryDate?: string
  Status?: 0 | 1 | 2 | 3 | 4 | 100 | null /* map (respectively): Success, Failure, Partial, Pending, Open, Undefined, null */
  InternalReduxId?: number
  InternalReduxStatus?: EndzoneTenderStatus
}

export interface IRefundResponse {
  Result: IResult
  AcquirerData: IAcquirerData
  Tenders: Array<ITender>
}

export interface IRefund {
  returnCustomerOrderNumber: string
  refundMethodsAmount?: number
  refundMethodsResponse?: IRefundResponse | null
  referencedRefundAmount?: number | null
  referencedRefundResponse?: IRefundResponse | null
  refundStatus: RefundStatus
}

export interface IRefundsState {
  currentlyProcessingCustomerOrderNumber: string
  currentlyProcessingTenderInternalReduxId: number
  alternateTenderTypeSelected: string | null
  refunds: Array<IRefund>
}

const initialState: IRefundsState = {
  currentlyProcessingCustomerOrderNumber: '',
  currentlyProcessingTenderInternalReduxId: -1,
  alternateTenderTypeSelected: null,
  refunds: []
}

const getNextInternalReduxId = (refund: IRefund) => {
  let nextInternalReduxId = -1
  refund.referencedRefundResponse.Tenders.forEach(t => {
    if (t.InternalReduxId > nextInternalReduxId) {
      nextInternalReduxId = t.InternalReduxId
    }
  })
  nextInternalReduxId++
  return nextInternalReduxId
}

const addToCashRefund = (refund: IRefund, amount: number, referencedRefund: boolean): IRefund => {
  const refundResponse = referencedRefund ? refund.referencedRefundResponse : refund.refundMethodsResponse
  const tenderIndex: number = refundResponse.Tenders.findIndex(t => t.TenderType === 7)
  if (tenderIndex < 0) {
    const newTender: ITender = {
      Amount: amount,
      TenderType: 7, // CASH
      InternalReduxStatus: referencedRefund ? EndzoneTenderStatus.Unprocessed : null,
      InternalReduxId: referencedRefund ? getNextInternalReduxId(refund) : null
    }
    refundResponse.Tenders.push(newTender)
  } else {
    refundResponse.Tenders[tenderIndex].Amount += amount
  }
  if (referencedRefund) {
    refund.referencedRefundResponse = refundResponse
  } else {
    refund.refundMethodsResponse = refundResponse
  }
  return refund
}

const preprocessRefundResponse = (refund: IRefund, referencedRefund: boolean, giftcardMinimumAmount: number, giftcardMaximumAmount: number): IRefund => {
  const refundResponse = referencedRefund ? refund?.referencedRefundResponse : refund?.refundMethodsResponse
  if (!(refundResponse?.Tenders?.length > 0)) return refund

  const giftcardTypes = [4, 5, 6, 8] // respectively: PREPAID, PREPAID_RELOADABLE, PREPAID_NONRELOADABLE, GIFTCARD
  let cashTendersToAdd = 0
  let idx = 0
  do {
    refundResponse.Tenders[idx].InternalReduxId = idx
    refundResponse.Tenders[idx].InternalReduxStatus = EndzoneTenderStatus.Unprocessed
    if (giftcardTypes.includes(refundResponse.Tenders[idx].TenderType)) {
      if (Math.abs(refundResponse.Tenders[idx].Amount) < giftcardMinimumAmount) {
        cashTendersToAdd += refundResponse.Tenders[idx].Amount
        refundResponse.Tenders[idx].InternalReduxStatus = EndzoneTenderStatus.ProcessAsCash
      } else if (Math.abs(refundResponse.Tenders[idx].Amount) > giftcardMaximumAmount) {
        const sign = refundResponse.Tenders[idx].Amount < 0 ? -1 : 1
        const diff = (Math.abs(refundResponse.Tenders[idx].Amount) - giftcardMaximumAmount) * sign
        refundResponse.Tenders[idx].Amount = giftcardMaximumAmount * sign
        const clonedTender: ITender = JSON.parse(JSON.stringify(refundResponse.Tenders[idx]))
        clonedTender.Amount = diff
        if (referencedRefund) {
          clonedTender.InternalReduxId = getNextInternalReduxId(refund)
        }
        refundResponse.Tenders.push(clonedTender)
      }
    }
    idx++
  } while (idx < refundResponse.Tenders.length)
  if (cashTendersToAdd !== 0) {
    if (referencedRefund) {
      refund.referencedRefundResponse = refundResponse
    } else {
      refund.refundMethodsResponse = refundResponse
    }
    addToCashRefund(refund, cashTendersToAdd, referencedRefund)
  }
  return refund
}

function refundsData (
  state: IRefundsState | null = initialState,
  action
): IRefundsState {
  switch (action.type) {
  case ADD_REFERENCED_REFUND: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Attempt to add referenced refund failed.  No CO# matching [${action.data.co}]`)
    } else {
      const response: IRefundResponse = action.data.response === 'ERROR' ? { Result: { Status: 1 } } : JSON.parse(action.data.response)
      const refundStatus = action.data.response === 'ERROR' || response.Result?.Status !== 0 ? RefundStatus.Skip : RefundStatus.ReadyToProcess
      clone.currentlyProcessingCustomerOrderNumber = clone.refunds[index].returnCustomerOrderNumber
      clone.refunds[index].referencedRefundAmount = action.data.amount
      clone.refunds[index].referencedRefundResponse = response
      clone.refunds[index].refundStatus = refundStatus
      clone.refunds[index] = preprocessRefundResponse(clone.refunds[index], true, action.data.giftCardMinimumAmount, action.data.giftcardMaximumAmount)
    }
    return clone
  }
  case ADD_REFUND_METHODS: {
    const index: number = state.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      const refunds: IRefund[] = [...state.refunds]
      const response = action.data.response === 'ERROR' ? { Result: { Status: 1 } } : JSON.parse(action.data.response)
      const refund: IRefund = {
        returnCustomerOrderNumber: action.data.co,
        refundMethodsAmount: action.data.amount,
        refundMethodsResponse: response,
        referencedRefundAmount: null,
        referencedRefundResponse: null,
        refundStatus: RefundStatus.NotProcessed
      }
      const status = refund.refundMethodsResponse === null || refund.refundMethodsResponse?.Result?.Status !== 0 ? RefundStatus.Skip : RefundStatus.NotProcessed
      refund.refundStatus = status
      refunds.push(preprocessRefundResponse(refund, false, action.data.giftCardMinimumAmount, action.data.giftcardMaximumAmount))
      return {
        currentlyProcessingCustomerOrderNumber: state.currentlyProcessingCustomerOrderNumber,
        currentlyProcessingTenderInternalReduxId: -1,
        alternateTenderTypeSelected: null,
        refunds: refunds
      }
    } else {
      console.warn(`Attempt to add refund that already exists for ${action.data.co}`)
      return state
    }
  }
  case CLEAR_REFUNDS_DATA:
    return {
      currentlyProcessingCustomerOrderNumber: '',
      currentlyProcessingTenderInternalReduxId: -1,
      alternateTenderTypeSelected: null,
      refunds: []
    }
  case SET_CURRENT_REFUND_CO: {
    return {
      currentlyProcessingCustomerOrderNumber: action.data,
      currentlyProcessingTenderInternalReduxId: -1,
      alternateTenderTypeSelected: null,
      refunds: state.refunds
    }
  }
  case SET_REFUND_STATUS: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Unable to set refund status.  Refund doesn't exist for CO ${action.data.co}`)
    }
    clone.refunds[index].refundStatus = action.data.status
    return clone
  }
  case SET_CURRENT_TENDER_ID: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Unable to set current tender id.  Refund doesn't exist for CO ${action.data.co}`)
    }
    const tenderIndex: number = clone.refunds[index].referencedRefundResponse.Tenders.findIndex(tender => tender.InternalReduxId === action.data.id)
    if (tenderIndex < 0) {
      throw new Error(`Unable to set current tender id.  The id passed cannot be found in refund for CO ${action.data.co}`)
    }
    clone.currentlyProcessingTenderInternalReduxId = action.data.id
    return clone
  }
  case SET_REFUND_TENDER_STATUS: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Unable to set refund status.  Refund doesn't exist for CO ${action.data.co}`)
    }
    const tenderIndex: number = clone.refunds[index].referencedRefundResponse.Tenders.findIndex(t => t.InternalReduxId === action.data.tenderId)
    if (tenderIndex < 0) {
      throw new Error(`Unable to set tender status for refund with CO ${action.data.co}.  Tender with that id does not exist`)
    }
    clone.refunds[index].referencedRefundResponse.Tenders[tenderIndex].InternalReduxStatus = action.data.status
    return clone
  }
  case ADD_REFUND_TO_GIFT_CARD: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Unable to add to gift card refund.  Refund doesn't exist for CO ${action.data.co}`)
    }
    const originalTenderIndex = action.data.originalTenderId
    if (!('originalTenderId' in action.data) || !clone.refunds[index].referencedRefundResponse.Tenders[originalTenderIndex]) {
      throw new Error(`Unable to add to gift card refund.  Original tender id not passed for CO ${action.data.co}`)
    }
    const tenderIndex: number = clone.refunds[index].referencedRefundResponse.Tenders.findIndex(t => t.TenderType === 8)
    if (tenderIndex < 0) {
      const nextEndzoneId = getNextInternalReduxId(clone.refunds[index])
      const newTender: ITender = {
        Amount: action.data.amount,
        TenderType: 8, // GIFTCARD
        InternalReduxStatus: EndzoneTenderStatus.Unprocessed,
        InternalReduxId: nextEndzoneId
      }
      clone.refunds[index].referencedRefundResponse.Tenders.push(newTender)
    } else {
      clone.refunds[index].referencedRefundResponse.Tenders[tenderIndex].Amount += action.data.amount
    }
    clone.refunds[index].referencedRefundResponse.Tenders[originalTenderIndex].InternalReduxStatus = EndzoneTenderStatus.Processed
    return clone
  }
  case ADD_REFUND_TO_CASH: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Unable to add to cash refund.  Refund doesn't exist for CO ${action.data.co}`)
    }
    if (!('originalTenderId' in action.data) || !clone.refunds[index].referencedRefundResponse.Tenders[action.data.originalTenderId]) {
      throw new Error(`Unable to add to cash refund.  Original tender id not passed for CO ${action.data.co}`)
    }
    clone.refunds[index] = addToCashRefund(clone.refunds[index], action.data.amount, true)
    clone.refunds[index].referencedRefundResponse.Tenders[action.data.originalTenderId].InternalReduxStatus = EndzoneTenderStatus.Processed
    return clone
  }
  case SET_ALTERNATE_TENDER_TYPE: {
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    const index: number = clone.refunds.findIndex(refund => refund.returnCustomerOrderNumber === action.data.co)
    if (index < 0) {
      throw new Error(`Unable to set alternate tender type.  Refund doesn't exist for CO ${action.data.co}`)
    }
    clone.alternateTenderTypeSelected = action.data.type
    return clone
  }
  case REFRESH_REFUNDS_DATA: {
    // if we click the back button during a declined or other "bad" tender, we need to re-trigger the current flow for referenced refunds
    const clone: IRefundsState = JSON.parse(JSON.stringify(state))
    if (clone.currentlyProcessingCustomerOrderNumber?.length > 0 && clone.refunds[clone.currentlyProcessingCustomerOrderNumber]?.referencedRefundResponse) {
      // if we get here, we've come back to the paymentpanel (using Back button), where we're currently processing a referenced refund tender
      // so reset the tender to Unprocessed to trigger useEffect tendering sequence again for that tender
      const index = clone.refunds[clone.currentlyProcessingCustomerOrderNumber].referencedRefundResponse.Tenders.findIndex(t => t.InternalReduxStatus === EndzoneTenderStatus.Processing)
      if (index > -1) {
        clone.refunds[clone.currentlyProcessingCustomerOrderNumber].referencedRefundResponse.Tenders[index].InternalReduxStatus = EndzoneTenderStatus.Unprocessed
      }
    }
    return clone
  }
  default:
    return state
  }
}

export default refundsData
