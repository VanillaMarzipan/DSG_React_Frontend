import { useState, useEffect } from 'react'
import { Text, View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useDispatch } from 'react-redux'
import { clearRefundsData, getReferencedRefund, setRefundStatus } from '../../actions/refundsActions'
import { receiveUiData, updateLoadingStates } from '../../actions/uiActions'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { brandDisplayMap, EndzoneTenderStatus, IRefund, IRefundResponse, ITender, RefundStatus } from '../../reducers/refundsData'
import SubmitButton from '../reusable/SubmitButton'
import ModalBase from './Modal'
import { UiDataTypes } from '../../reducers/uiData'
import { obfuscateAccountNumber } from '../../utils/formatters'
import { getGiftCardMinimumAmount } from '../../utils/giftCardHelpers'

enum ResponseProcessingType {
  RefundMethodsResponse,
  ReferencedRefundsResponse,
  ErrorResponse
}

const ReferencedRefundModal = (): JSX.Element => {
  const [currentlyProcessingCustomerOrderNumber, setCurrentlyProcessingCustomerOrderNumber] = useState<string>(null)
  const [responseProcessingType, setResponseProcessingType] = useState<ResponseProcessingType>(ResponseProcessingType.RefundMethodsResponse)
  const [refundTendersDisplayList, setRefundTendersDisplayList] = useState<JSX.Element[] | null>(null)
  const [amountToDisplay, setAmountToDisplay] = useState<number | null>(null)
  const [buttonLabel, setButtonLabel] = useState<string>('CONTINUE')
  const [displayGoBackButton, setDisplayGoBackButton] = useState<boolean>(true)

  const [modalText, setModalText] = useState<string>('')

  const dispatch = useDispatch()
  const refundsData = useSelector(state => state.refundsData)
  const transactionData = useSelector(state => state.transactionData)
  const uiData: UiDataTypes = useSelector(state => state.uiData)

  const minimumAmountDisplay = getGiftCardMinimumAmount()

  const getRefundsDisplayList = (responseToDisplay: IRefundResponse): JSX.Element[] => {
    if (!responseToDisplay || !Array.isArray(responseToDisplay.Tenders) || responseToDisplay.Tenders.length === 0) {
      return []
    }
    let giftcardToCashAmount = 0
    responseToDisplay.Tenders.forEach(tender => {
      if (tender.InternalReduxStatus === EndzoneTenderStatus.ProcessAsCash) {
        giftcardToCashAmount += tender.Amount
      }
    })
    const displayList = responseToDisplay.Tenders.map(tender => {
      const tenderDetails: JSX.Element[] = []
      const successAndPending = [0, 3]
      const brandDisplay = brandDisplayMap[tender.Brand] ? brandDisplayMap[tender.Brand].toUpperCase() : 'CREDIT'
      const tenderAmount = tender.Amount.toFixed(2)
      const keyBase = `K${tender.InternalReduxId}`

      if (tender.TenderType > 3 || (!tender.Status || successAndPending.includes(tender.Status))) {
        switch (tender.TenderType) {
        case 7: // 'cash':
          tenderDetails.push(<Text key={`${keyBase}:cash:title`} style={styles.refundLabel}>CASH</Text>)
          tenderDetails.push(<Text key={`${keyBase}:cash:due`} style={styles.refundAmount}>Refund amount: ${tenderAmount}</Text>)
          if (giftcardToCashAmount !== 0) {
            tenderDetails.push(<Text key={`${keyBase}:cash:giftCardAmount`} style={[styles.refundAmount, { color: '#057758' }]}>Gift Card amount included: ${giftcardToCashAmount.toFixed(2)}</Text>)
          }
          break
        case 2: // 'debit':
        case 3: // 'deferred_debit':
        case 1: // 'credit':
          tenderDetails.push(<Text key={`${keyBase}:credit:title`} style={styles.refundLabel}>{brandDisplay}: {obfuscateAccountNumber(tender.MaskedPan, true)}</Text>)
          tenderDetails.push(<Text key={`${keyBase}:credit:due`} style={styles.refundAmount}>Refund amount: ${tenderAmount}</Text>)
          break
        case 4: // PREPAID
        case 5: // PREPAID_RELOADABLE
        case 6: // PREPAID_NONRELOADABLE
          tenderDetails.push(<Text key={`${keyBase}:prepaid:title`} style={styles.refundLabel}>{brandDisplay} PREPAID: {tender.MaskedPan}</Text>)
          if (tender.InternalReduxStatus === EndzoneTenderStatus.ProcessAsCash) {
            tenderDetails.push(<Text key={`${keyBase}:giftcard:returnAsCash`} style={[styles.refundAmount, { color: '#B80818' }]}>${tenderAmount} will be converted to cash refund.</Text>)
            tenderDetails.push(<Text key={`${keyBase}:giftcard:returnAsCash`} style={[styles.refundAmount, { color: '#B80818' }]}>Refund amount is below the minimum gift card amount of ${minimumAmountDisplay.toFixed(2)}.</Text>)
          } else {
            tenderDetails.push(<Text key={`${keyBase}:prepaid:issueCard`} style={styles.refundAmount}>Issue a new gift card: ${tenderAmount}</Text>)
          }
          break
        case 8: // 'giftcard':
          tenderDetails.push(<Text key={`${keyBase}:giftcard:title`} style={styles.refundLabel}>DICK&apos;S GIFT CARD</Text>)
          if (tender.InternalReduxStatus === EndzoneTenderStatus.ProcessAsCash) {
            tenderDetails.push(<Text key={`${keyBase}:giftcard:returnAsCash`} style={[styles.refundAmount, { color: '#B80818' }]}>${tenderAmount} will be converted to cash refund.</Text>)
            tenderDetails.push(<Text key={`${keyBase}:giftcard:returnAsCash`} style={[styles.refundAmount, { color: '#B80818' }]}>Refund amount is below the minimum gift card amount of ${minimumAmountDisplay.toFixed(2)}.</Text>)
          } else {
            tenderDetails.push(<Text key={`${keyBase}:giftcard:issueCard`} style={styles.refundAmount}>Issue a new gift card: ${tenderAmount}</Text>)
          }
          break
        case 9: // paypal
          tenderDetails.push(<Text key={`${keyBase}:giftcard:errorMessage`} style={styles.refundErrorMessage}>The following forms of tender could not be processed.  Please select &apos;Continue&apos; to choose a new refund tender.</Text>)
          tenderDetails.push(<Text key={`${keyBase}:giftcard:title`} style={styles.refundLabel}>PAYPAL</Text>)
          tenderDetails.push(<Text key={`${keyBase}:giftcard:amount`} style={[styles.refundAmount, { color: '#B80818' }]}>Amount unable to be processed: ${tenderAmount}</Text>)
          setButtonLabel('CONTINUE')
          break
        default:
          break
        }
      } else {
        tenderDetails.push(<Text key={`${keyBase}:tender:error`} style={styles.refundErrorMessage}>The following forms of tender could not be processed.  Please select &apos;Continue&apos; to choose a new refund tender.</Text>)
        tenderDetails.push(<Text key={`${keyBase}:tender:brand`} style={styles.refundLabel}>{brandDisplay}: {obfuscateAccountNumber(tender.MaskedPan, true)}</Text>)
        tenderDetails.push(<Text key={`${keyBase}:tender:amount`} style={[styles.refundAmount, { color: '#B80818' }]}>Amount due: ${tenderAmount}</Text>)
      }
      return (
        <View key={`${keyBase}:tenderDetails`} style={{ marginBottom: 20 }}>
          {tenderDetails}
        </View>
      )
    })
    return displayList
  }

  const onShow = () => {
    const refundToProcess: IRefund | undefined = refundsData.refunds.find(refund => refund.refundStatus === RefundStatus.NotProcessed)
    setCurrentlyProcessingCustomerOrderNumber(refundToProcess?.returnCustomerOrderNumber)
    if (!refundToProcess) {
      dispatch(receiveUiData({ showModal: false }))
    }
  }

  const onDismiss = () => {
    setCurrentlyProcessingCustomerOrderNumber(null)
    setModalText(`This return will be processed and refunded in the original form of tender.${'\n'}If it cannot be completed, then choose a new tender unless specified.`)
    setResponseProcessingType(ResponseProcessingType.RefundMethodsResponse)
  }

  const handleRefundMethodsResponse = (refund: IRefund) => {
    setButtonLabel('REFUND')
    setDisplayGoBackButton(true)
    setRefundTendersDisplayList(getRefundsDisplayList(refund.refundMethodsResponse))
    setAmountToDisplay(refund.refundMethodsAmount)
  }

  const handleReferencedRefundResponse = (refund: IRefund) => {
    setDisplayGoBackButton(false)
    if (refund.referencedRefundResponse.Result?.Status !== 0) {
      setResponseProcessingType(ResponseProcessingType.ErrorResponse)
      setModalText(`Unable to perform referenced refund.${'\n'}Press continue to proceed as a non-referenced refund.`)
      setButtonLabel('CONTINUE')
      return
    }

    const successAndPending = [0, 3]
    // do we have an unsuccessful refund of a credit tender?
    const failedCreditRefund: ITender | undefined = refund.referencedRefundResponse.Tenders.find(tender => {
      return tender.TenderType < 4 && !successAndPending.includes(tender.Status)
    })
    if (failedCreditRefund) {
      setRefundTendersDisplayList(getRefundsDisplayList(refund.referencedRefundResponse))
      setAmountToDisplay(refund.referencedRefundAmount)
      setButtonLabel('CONTINUE')
      return
    }
    dispatch(receiveUiData({ showModal: false }))
  }

  const handleSubmit = () => {
    if (responseProcessingType === ResponseProcessingType.RefundMethodsResponse) {
      const serializedTransaction = JSON.stringify(transactionData)
      dispatch(updateLoadingStates({ getReferencedRefund: true }))
      dispatch(getReferencedRefund(currentlyProcessingCustomerOrderNumber, amountToDisplay, serializedTransaction))
      return
    } else if (responseProcessingType === ResponseProcessingType.ErrorResponse) {
      dispatch(setRefundStatus(currentlyProcessingCustomerOrderNumber, RefundStatus.Skip))
    }
    dispatch(receiveUiData({ showModal: false }))
  }

  useEffect(() => {
    if (!currentlyProcessingCustomerOrderNumber || refundsData.refunds?.length === 0) return

    const refundToProcess: IRefund | undefined = refundsData.refunds.find(r => r.returnCustomerOrderNumber === currentlyProcessingCustomerOrderNumber)
    if (!refundToProcess || !(refundToProcess.refundStatus === RefundStatus.NotProcessed || refundToProcess.refundStatus === RefundStatus.ReadyToProcess)) return

    const receivedReferencedRefundResponse = !(refundToProcess?.referencedRefundResponse === null || refundToProcess?.referencedRefundResponse === undefined)
    if (receivedReferencedRefundResponse) {
      dispatch(updateLoadingStates({ getReferencedRefund: false }))
      setResponseProcessingType(ResponseProcessingType.ReferencedRefundsResponse)
      handleReferencedRefundResponse(refundToProcess)
    } else {
      handleRefundMethodsResponse(refundToProcess)
    }
  }, [currentlyProcessingCustomerOrderNumber, refundsData])

  let modalButtons: JSX.Element = null
  if (uiData.loadingStates.getReferencedRefund) {
    modalButtons = (
      <ActivityIndicator style={{ marginTop: 34 }} size={'large'} color={'#000'}/>
    )
  } else if (displayGoBackButton) {
    modalButtons = (
      <View style={{ display: 'flex', flexDirection: 'row', paddingLeft: 72, marginTop: 34 }}>
        <SubmitButton
          testID='referenced-refund-modal-go-back-button'
          onSubmit={() => {
            dispatch(receiveUiData({ activePanel: 'scanDetailsPanel', showModal: false }))
            dispatch(clearRefundsData())
          }}
          buttonLabel='GO BACK'
          customStyles={styles.goBackButton}
          customTextStyles={styles.goBackButtonText}
        />
        <SubmitButton
          customStyles={{ marginLeft: 22 }}
          testID={`referenced-refund-modal-${buttonLabel}-button`}
          buttonLabel={buttonLabel}
          onSubmit={() => {
            handleSubmit()
          }}
        />
      </View>

    )
  } else {
    modalButtons = (
      <SubmitButton
        customStyles={{ marginTop: 34, alignSelf: 'center' }}
        testID={`referenced-refund-modal-${buttonLabel}-button`}
        buttonLabel={buttonLabel}
        onSubmit={() => {
          handleSubmit()
        }}
      />
    )
  }

  return (
    <ModalBase
      modalName={'referencedRefund'}
      modalHeading='REFERENCED REFUND'
      headingSize={32}
      modalWidth={642}
      minModalHeight={600}
      dismissable={false}
      onShow={onShow}
      onDismiss={onDismiss}
    >
      <View style={{ paddingTop: 12 }}>
        <Text style={{ paddingLeft: 32 }}>{modalText}</Text>
        <ScrollView style={styles.refundResultsPanel}>
          {!uiData.loadingStates.getReferencedRefund && refundTendersDisplayList}
        </ScrollView>
        <Text style={styles.amountToShow}>Total: ${amountToDisplay?.toFixed(2)}</Text>
        {modalButtons}
      </View>
    </ModalBase>
  )
}

const styles = StyleSheet.create({
  refundResultsPanel: {
    padding: 20,
    marginLeft: 32,
    width: 578,
    height: 300,
    marginTop: 12,
    backgroundColor: '#F4F4F4'
  },
  refundErrorMessage: {
    color: '#B80818',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
    marginBottom: 16
  },
  refundLabel: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  refundAmount: {
    fontWeight: '400',
    fontSize: 16,
    letterSpacing: 0.5
  },
  amountToShow: {
    marginTop: 34,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 16,
    letterSpacing: 1.5,
    alignSelf: 'center'
  },
  goBackButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4E4C4C',
    borderWidth: 1
  },
  goBackButtonText: {
    color: '#191F1C'
  }
})

export default ReferencedRefundModal
