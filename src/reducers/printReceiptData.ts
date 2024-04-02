import { UPDATE_PRINT_RECEIPT_DATA } from '../actions/printReceiptActions'
import { TransactionDataTypes } from './transactionData'

type TransactionByBarcodeErrorTypes =
  | 700 // unable to parse barcode
  | 701 // token store number doesn't match what's on the barcode
  | 702 // barcode date isn't from today
  | 703 // transaction wasn't a sale transaction
  | 'noSaleItems'
  | 'invalidBarcode'
  | 'generalError'

export interface PrintReceiptDataType {
  serializedTransaction?: string | null
  serializedStoreInfo?: string | null
  serializedAssociateData?: string | null
  serializedAdditionalInfo?: string | null
  reprintReceiptAvailable?: boolean
  transactionFoundViaBarcode?: TransactionDataTypes
  transactionByBarcodeError?: TransactionByBarcodeErrorTypes | null
  transactionByBarcodeErrorMessage?: string
  midSaleSeparateGiftReceipts?: boolean
}

const printReceiptData = (
  state: (PrintReceiptDataType) = {
    serializedTransaction: null,
    serializedStoreInfo: null,
    serializedAssociateData: null,
    serializedAdditionalInfo: null,
    reprintReceiptAvailable: false,
    transactionFoundViaBarcode: null,
    transactionByBarcodeError: null,
    transactionByBarcodeErrorMessage: null,
    midSaleSeparateGiftReceipts: true
  },
  action
): PrintReceiptDataType => {
  switch (action.type) {
  case UPDATE_PRINT_RECEIPT_DATA:
    return {
      ...state,
      ...action.data
    }
  default:
    return state
  }
}

export default printReceiptData
