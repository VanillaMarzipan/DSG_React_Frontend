import ModalBase from './Modal'
import { ThemeTypes } from '../../reducers/theme'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { removeCoupon, managerOverride, voidTransaction, postVoidTransaction, applyManualTransactionDiscountAction, applyManualItemDiscountAction, createNoSaleTransaction } from '../../actions/transactionActions'
import { getConfigurationValue } from '../../actions/configurationActions'
import { receiveUiData } from '../../actions/uiActions'
import { featureFlagEnabled } from '../../reducers/featureFlagData'
import ManagerOverridePanel from '../reusable/ManagerOverridePanel'
import * as CoordinatorApi from '../../utils/coordinatorAPI'
import moment from 'moment'
import { manualDiscountReasons } from './discounts/ManualTransactionDiscount'
import { clearManagerOverrideInfo } from '../../actions/managerOverrideActions'
import { itemDiscountReasonEnumLabelDictionary } from './discounts/ManualItemDiscount'
import { invalidAssociateCredentialsMessage } from '../../utils/reusableStrings'
interface ManagerOverrideModalProps {
  theme: ThemeTypes
}

const ManagerOverrideModal = ({ theme }: ManagerOverrideModalProps) => {
  const dispatch = useDispatch()
  const [errorMessage, setErrorMessage] = useState('')

  const {
    registerData,
    storeInfo,
    transactionData,
    returnData,
    pendingManagerOverride,
    uiData,
    associateData,
    featureFlagData
  } = useSelector(
    state => ({
      registerData: state.registerData,
      storeInfo: state.storeInfo,
      transactionData: state.transactionData,
      returnData: state.returnData,
      configurationData: state.configurationData,
      pendingManagerOverride: state.pendingManagerOverrideData,
      uiData: state.uiData,
      associateData: state.associateData,
      featureFlagData: state.featureFlagData
    })
  )

  useEffect(() => {
    if ((!associateData?.isManager) && (
      (featureFlagEnabled('ExpiredCouponManagerOverride') && pendingManagerOverride?.ManagerOverrideType === 0) ||
      (featureFlagEnabled('NonReceiptedReturnManagerOverride') && pendingManagerOverride?.ManagerOverrideType === 1) ||
      (featureFlagEnabled('EditPriceManagerOverride') && pendingManagerOverride?.ManagerOverrideType === 2) ||
      (featureFlagEnabled('PostVoidManagerOverride') && pendingManagerOverride?.ManagerOverrideType === 4))) {
      dispatch(receiveUiData({ showModal: 'managerOverride' }))
    }
  }, [featureFlagData, pendingManagerOverride])

  const calculateDiscountPercent = (discountAmount : number) => {
    if (discountAmount === 0) {
      return 0
    }
    return ((discountAmount / (transactionData?.total?.subTotal + discountAmount)) * 100).toFixed(0)
  }

  const handleDecline = () => {
    if (pendingManagerOverride?.ManagerOverrideType === 0) {
      const selectedItem = (transactionData?.items && transactionData.items.length > 0) ? transactionData.items[transactionData.items.length - 1] : null
      dispatch(removeCoupon(parseManagerOverrideData('CouponCode'), setErrorMessage, selectedItem?.transactionItemIdentifier))
    } else if (pendingManagerOverride?.ManagerOverrideType === 1) {
      dispatch(voidTransaction(transactionData, returnData, uiData.loadingStates.void, false))
    } else if (pendingManagerOverride?.ManagerOverrideType === 4) {
      dispatch(receiveUiData({
        footerOverlayActive: 'None',
        enhancedPostVoidPanelSelected: false,
        showModal: false
      }))
    } else {
      dispatch(clearManagerOverrideInfo())
      dispatch(receiveUiData({ showModal: false, activePanel: 'scanDetailsPanel', footerOverlayActive: 'None' }))
    }
  }

  const handleManagerOverride = (associateNum: string, associatePin: string) => {
    if (pendingManagerOverride?.ManagerOverrideType === 4) {
      CoordinatorApi.isManager(associateNum, associatePin).then(resp => {
        if (!resp.ok) {
          setErrorMessage(invalidAssociateCredentialsMessage)
          throw new Error('Invalid credentials')
        } else {
          dispatch(postVoidTransaction(pendingManagerOverride?.ManagerOverrideData, storeInfo, associateData, associateNum, associatePin))
        }
      }).catch(ex => {
        console.error(ex)
      })
    } else {
      dispatch(managerOverride(associateNum, associatePin, storeInfo.number, registerData.registerNumber, pendingManagerOverride, setErrorMessage))
    }
  }

  const handleManualTransactionDiscount = (associateNum, associatePin) => {
    const manualDiscountDetails = pendingManagerOverride?.ManualDiscountResponse
    const deepClone = JSON.parse(JSON.stringify(manualDiscountDetails))
    if (deepClone.originalRequest.reason === 0) {
      deepClone.originalRequest.additionalDetail = associateNum
    }
    dispatch(applyManualTransactionDiscountAction({
      ...deepClone.originalRequest,
      managerId: associateNum,
      managerPasscode: associatePin
    }, setErrorMessage))
  }

  const handleCreateNoSaleTransaction = (associateNum, associatePin) => {
    dispatch(createNoSaleTransaction({ managerId: associateNum, managerPasscode: associatePin }, setErrorMessage))
  }

  const returnItemCount = () => {
    if (transactionData.originalSaleInformation?.length > 0) {
      return transactionData.originalSaleInformation[0]?.returnItems?.length
    }
    return 0
  }

  const handleManualItemDiscount = (associateNum, associatePin) => {
    const manualDiscountDetails = pendingManagerOverride?.ManualDiscountResponse
    dispatch(applyManualItemDiscountAction(
      {
        ...manualDiscountDetails.originalRequest,
        managerId: associateNum,
        managerPasscode: associatePin
      },
      manualDiscountDetails.transactionItemIdentifier,
      setErrorMessage
    ))
  }

  const renderPercentOrDollarDiscountString = (amount, discountType) => {
    let result = ''

    if (discountType === 1) {
      result += amount.toFixed(0) + '%'
    } else {
      result += '$' + amount.toFixed(2)
    }

    result += ' off '

    return result
  }

  const getDiscountReasonLabel = (reasonEnum) => {
    for (let i = 0; i < itemDiscountReasonEnumLabelDictionary.length; i++) {
      if (itemDiscountReasonEnumLabelDictionary[i].enum === reasonEnum) return itemDiscountReasonEnumLabelDictionary[i].label
    }
    return 'unknown'
  }

  const createHeaders = () => {
    const headers = { mainHeader: '', subHeader: '', mainText: '' }
    switch (pendingManagerOverride?.ManagerOverrideType) {
    // Expired Coupon
    case 0: {
      let expiredCouponThresholdPercent = getConfigurationValue('manageroverridethresholds', 'expiredCoupon')
      expiredCouponThresholdPercent = expiredCouponThresholdPercent !== null ? expiredCouponThresholdPercent : 0.2
      const expiredCouponThresholdDisplay = expiredCouponThresholdPercent * 100 + '%'
      const discountAmount = parseManagerOverrideData('DiscountAmount')
      const discountPercent = calculateDiscountPercent(discountAmount)
      const aboveThreshold = Number(discountPercent) >= (expiredCouponThresholdPercent * 100)

      headers.mainHeader = aboveThreshold ? 'Expired Coupon + Above Threshold' : 'Expired Coupon'
      headers.subHeader = aboveThreshold ? `This coupon is currently expired and exceeds the ${expiredCouponThresholdDisplay} threshold of \nthe transaction's total.` : 'This coupon is currently expired.'
      headers.mainText = discountAmount !== 0 ? `Requested discount: ${discountPercent}% of ${(transactionData?.total?.subTotal + discountAmount).toFixed(2)} = $${transactionData?.total?.subTotal.toFixed(2)}` : 'Current items are not available for discount by this coupon.'
      break
    }
    // No Receipted Returns
    case 1: {
      let nonReceiptedReturnThreshold = getConfigurationValue('manageroverridethresholds', 'nonReceiptedReturns')
      nonReceiptedReturnThreshold = nonReceiptedReturnThreshold !== null ? nonReceiptedReturnThreshold : 1
      const returnAmount = parseManagerOverrideData('ReturnTotal')
      headers.mainHeader = 'Return without Receipt'
      headers.subHeader = 'No receipt returns will require a manager override in order to \ncontinue.'
      headers.mainText = `Requested return: -$${returnAmount.toFixed(2)} (${returnItemCount()} item${returnItemCount() > nonReceiptedReturnThreshold ? 's' : ''})`
      break
    }
    // Edit Price
    case 2: {
      let editPriceManagerOverrideThreshold = getConfigurationValue('manageroverridethresholds', 'editItemPrice')
      editPriceManagerOverrideThreshold = editPriceManagerOverrideThreshold !== null ? editPriceManagerOverrideThreshold : 0.2
      const editPriceManagerOverridePercent = editPriceManagerOverrideThreshold * 100 + '%'
      const overridePrice = parseManagerOverrideData('overridePrice')
      const everydayPrice = parseManagerOverrideData('everydayPrice')
      headers.mainHeader = 'Edit Price'
      headers.subHeader = `Item price has been manually changed and exceeds the threshold of ${editPriceManagerOverridePercent} of the transaction’s total.`
      headers.mainText = `Requested Price: $${everydayPrice.toFixed(2)} -> $${overridePrice}`
      break
    }
    // Post Void
    case 4: {
      const parsedTransaction = JSON.parse(pendingManagerOverride?.ManagerOverrideData)
      headers.mainHeader = 'Post-Void'
      headers.subHeader = 'This transaction is being post-voided and needs manager approval.'
      const displayDate = moment(parsedTransaction.header.endDateTime).local().format('M/D/YYYY - h:mm A')
      const firstLine = `Requested Transaction: ${parsedTransaction.header.transactionNumber}`
      const secondLine = `${displayDate} - $${parsedTransaction.total.grandTotal.toFixed(2)} (${parsedTransaction.items.length} item${parsedTransaction.items.length > 1 ? 's' : ''})`
      headers.mainText = `${firstLine}\n${secondLine}`
      break
    }
    // Manual Transaction Discount
    case 5: {
      const manualTransactionDiscountDetails = pendingManagerOverride?.ManualDiscountResponse
      const originalSubtotal = manualTransactionDiscountDetails.thresholdExceededDetails.originalPrice
      const discountReason = manualTransactionDiscountDetails.originalRequest.reason
      let discountAmount = manualTransactionDiscountDetails.originalRequest.amount
      let finalPrice = originalSubtotal * ((100 - manualTransactionDiscountDetails.thresholdExceededDetails.percentDifference) / 100)
      if (discountReason === 2) {
        discountAmount = originalSubtotal - manualTransactionDiscountDetails.originalRequest.amount
        finalPrice = originalSubtotal - discountAmount
      }
      const finalPriceString = finalPrice.toFixed(2)
      headers.mainHeader = 'Manual Discount on Transaction'
      headers.subHeader = (
        'Teammate is requesting a transaction-level discount.'
      )
      headers.mainText = (
        'Requested discount: ' +
        renderPercentOrDollarDiscountString(
          discountAmount,
          manualTransactionDiscountDetails.originalRequest.type
        ) +
        `$${originalSubtotal.toFixed(2)}` +
        ' = ' +
        `$${finalPriceString}` +
        `\n\nReason Code: ${manualDiscountReasons[discountReason].label}`
      )
      break
    }
    // Manual Item Discount
    case 6: {
      const manualItemDiscountDetails = pendingManagerOverride?.ManualDiscountResponse
      const originalItemPrice = manualItemDiscountDetails.thresholdExceededDetails.originalPrice
      const discountReason = manualItemDiscountDetails.originalRequest.reason
      const discountType = manualItemDiscountDetails.originalRequest.type
      let discountAmount = manualItemDiscountDetails.originalRequest.amount
      const additionalDetail = manualItemDiscountDetails.originalRequest.additionalDetail
      let finalPrice = originalItemPrice * ((100 - manualItemDiscountDetails.thresholdExceededDetails.percentDifference) / 100)
      if (discountType === 2) {
        discountAmount = originalItemPrice - manualItemDiscountDetails.originalRequest.amount
        finalPrice = originalItemPrice - discountAmount
      }
      const finalPriceString = finalPrice.toFixed(2)
      headers.mainHeader = 'Manual Discount on Item'
      headers.subHeader = (
        'This item-level discount has exceeded the threshold of the item\'s price.'
      )

      let itemDiscountMethod = 'Percent or Dollar Off'
      if (discountType === 2) itemDiscountMethod = 'Manual Price Entry'
      else if (discountType < 2 && additionalDetail) itemDiscountMethod = 'Coupon Discount'

      headers.mainText = (
        'Request: ' +
        renderPercentOrDollarDiscountString(
          discountAmount,
          manualItemDiscountDetails.originalRequest.type
        ) +
        `$${originalItemPrice.toFixed(2)}` +
        ' = ' +
        `$${finalPriceString}` +
        `\n\nReason: ${getDiscountReasonLabel(discountReason)}` +
        `\n\nMethod: ${itemDiscountMethod}`
      )
      break
    }
    // No Sale
    case 8: {
      if (pendingManagerOverride?.ModalDetails) {
        headers.mainHeader = pendingManagerOverride.ModalDetails.mainHeader
        headers.subHeader = pendingManagerOverride.ModalDetails.subHeader
      }
    }
    }
    return headers
  }

  const parseManagerOverrideData = (field) => {
    return JSON.parse(pendingManagerOverride?.ManagerOverrideData)?.[field]
  }

  const headers = createHeaders()

  let onSubmitManagerCredentials = handleManagerOverride
  if (pendingManagerOverride?.ManagerOverrideType === 5) onSubmitManagerCredentials = handleManualTransactionDiscount
  else if (pendingManagerOverride?.ManagerOverrideType === 6) onSubmitManagerCredentials = handleManualItemDiscount
  else if (pendingManagerOverride?.ManagerOverrideType === 8) onSubmitManagerCredentials = handleCreateNoSaleTransaction
  return (
    <ModalBase
      modalName='managerOverride'
      modalHeading={'Manager Override'}
      headingSize={32}
      minModalHeight={490}
      modalWidth={642}
      onDismiss={() => {
        dispatch(receiveUiData({ scanError: false, scanErrorMessage: null, clearUpc: true }))
        dispatch(clearManagerOverrideInfo())
      }}
      dismissable={false}
    >
      <ManagerOverridePanel
        theme={theme}
        headers={headers}
        handleDecline={handleDecline}
        onSubmitManagerCredentials={onSubmitManagerCredentials}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </ModalBase>
  )
}

export default ManagerOverrideModal
