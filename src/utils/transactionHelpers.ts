import { DisplayItemType, Item, TransactionDataTypes, TransactionItemAttributesType } from '../reducers/transactionData'
import { GIFTCARD } from './reusableStrings'

export const areAllPricesSet = (itemsArray: Array<Item>): boolean => {
  for (let i = 0; i < itemsArray.length; i++) {
    if (itemsArray[i].promptForPrice && !itemsArray[i].priceOverridden) return false
  }
  return true
}

export const checkIsCashInvolved = (tendersArray): boolean => {
  for (let i = 0; i < tendersArray?.length; i++) {
    // checking if amount > 0 to rule out a transaction completed exclusively by reward certificates
    if (tendersArray[i].tenderType === 1 && tendersArray[i].amount !== 0) return true
  }
  return false
}

export const checkForNonCashTenders = (tendersArray): boolean => {
  for (let i = 0; i < tendersArray.length; i++) {
    if (tendersArray[i].tenderType.toLowerCase() !== 'cash') return true
  }
  return false
}

// checks for credit tenders, excluding giftcards
export const checkForCreditTenders = (tendersArray): boolean => {
  for (let i = 0; i < tendersArray.length; i++) {
    const caseCleansedTender = tendersArray[i].tenderType.toLowerCase()
    if (caseCleansedTender !== 'cash' && caseCleansedTender !== 'valuelink') return true
  }
  return false
}

export const checkIfTrxFailedToFinalize = (transaction: TransactionDataTypes): boolean => {
  if (areAllPricesSet(transaction.items)) {
    if ( // sale
      transaction.header.transactionType === 1 &&
      transaction.total.remainingBalance <= 0 &&
      transaction.items?.length > 0 &&
      transaction.tenders.length > 0
    ) {
      return true
    }

    if (transaction.header.transactionType === 4) {
      if (// return
        transaction.total.grandTotal < 0 &&
        transaction.total.remainingBalance === 0
      ) {
        return true
      }

      if ( // exchange
        transaction.total.grandTotal > 0 &&
        transaction.total.remainingBalance <= 0
      ) {
        return true
      }
    }
  }

  return false
}

export const getRoundUpAmount = (amount: number) => {
  const amountRoundedUp = Math.ceil(amount)
  let roundUpAmount = (amountRoundedUp - amount).toFixed(2)
  if (roundUpAmount === '0.00') roundUpAmount = '1.00'
  return roundUpAmount
}

export const checkIfTransactionContainsUpc = (upc: string, itemList: Array<Item>) => {
  if (!itemList || itemList.length === 0) return false
  for (let i = 0; i < itemList.length; i++) {
    if (itemList[i].upc === upc) return true
  }
  return false
}

export const checkIfItemListContainsGiftcard = (itemList: Array<Item>) => {
  if (!itemList || itemList.length === 0) return false
  for (let i = 0; i < itemList.length; i++) {
    if (itemList[i].accountNumber) return true
  }
  return false
}

export const checkIfItemListContainsGiftReceiptEligibleItems = (itemList: Array<Item>) => {
  if (!itemList || itemList.length === 0) return false
  for (let i = 0; i < itemList.length; i++) {
    if (itemList[i].description && itemList[i].returnPrice && itemList[i].upc) return true
  }
  return false
}

export const checkIfOmniSearchQueryIsCoupon = (input: string) => {
  if (typeof input === 'string') {
    const firstChar = input[0].toUpperCase()
    if (firstChar === 'P' || firstChar === 'B' || firstChar === 'R') {
      return true
    }
  }
  return false
}

export const checkIfItemListContainsAttribute = (itemList: Array<DisplayItemType>, attribute: TransactionItemAttributesType) => {
  if (!itemList || itemList.length === 0) return false
  for (let i = 0; i < itemList.length; i++) {
    if (itemList[i].attributes?.includes(attribute)) {
      return true
    }
  }
  return false
}

export const checkIfManualItemDiscountHasBeenApplied = (appliedDiscounts) => {
  if (!appliedDiscounts || appliedDiscounts.length === 0) return false
  const manualItemDiscountIDs = [
    '88888881', // Dollar off
    '88888882', // Percent off
    '88888883', // New Price
    '88888884', // Dollar off with coupon
    '88888885', // Pereent off with coupon
    '88888886' // New Price with coupon
  ]
  for (let i = 0; i < appliedDiscounts.length; i++) {
    if (manualItemDiscountIDs.includes(appliedDiscounts[i].discountId)) {
      return true
    }
  }
  return false
}

export const getPriceOfSelectedItemFromItemList = (itemList, selectedItemID, priceField) => {
  if (!itemList || itemList.length === 0) return null
  for (let i = 0; i < itemList.length; i++) {
    if (itemList[i].transactionItemIdentifier === selectedItemID) {
      return Number(itemList[i][priceField])
    }
  }
  return null
}

export const determineIfStringIsTempShoppingPass = (string: string): boolean => {
  if (string.length === 41) {
    const segmentedValues = string.split('.')
    if (
      segmentedValues.length === 3 &&
      segmentedValues[0].length === 3 &&
      segmentedValues[1].length === 16 &&
      segmentedValues[2].length === 20
    ) {
      return true
    }
  }
  return false
}

/**
 * Splits an amount into increments that fall at or below a max.
 * If there is a remainder in the quotient, the amount will be split into even
 * increments except for the last increment, where the remainder is placed
 */
export const splitAmountUnderMax = (amount, max) => {
  if (amount <= max) return [amount]
  const amountSplitUnderMax = []
  let finalEvenSplitAmount = amount
  let splitCount = 2

  while (finalEvenSplitAmount > max) {
    const currentSplitAmount = finalEvenSplitAmount / splitCount
    if ((currentSplitAmount + (finalEvenSplitAmount % splitCount)) <= max) {
      finalEvenSplitAmount = currentSplitAmount
      break
    }
    splitCount++
  }
  const finalSplitRemainder = amount % splitCount

  const loopWithAction = (action) => {
    for (let i = 0; i < splitCount; i++) {
      action(i)
    }
  }

  if (finalSplitRemainder === 0) {
    loopWithAction(() => amountSplitUnderMax.push(finalEvenSplitAmount))
  } else {
    loopWithAction((i) => {
      if (i < (splitCount - 1)) {
        amountSplitUnderMax.push(Math.floor(finalEvenSplitAmount))
      } else {
        amountSplitUnderMax.push(Math.floor(finalEvenSplitAmount) + finalSplitRemainder)
      }
    })
  }

  return amountSplitUnderMax
}

export const getSumOfGiftCardTenders = (tendersList) => {
  let sum = 0
  tendersList?.forEach(tender => {
    if (tender.cardType === GIFTCARD) {
      sum += tender.amount
    }
  })
  return sum
}
