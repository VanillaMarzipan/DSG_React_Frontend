import ManagerOverridePanel from '../reusable/ManagerOverridePanel'
import ModalBase from './Modal'
import { ThemeTypes } from '../../reducers/theme'
import { useState } from 'react'
import { isManager } from '../../utils/coordinatorAPI'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { RefundManagerOverrideResponse } from '../../reducers/alternateRefundData'
import { setRefundManagerOverride } from '../../actions/alternateRefundActions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../Main'
import { receiveUiData, updateLoadingStates } from '../../actions/uiActions'
import { capitalizeFirstLetter } from '../../utils/formatters'
import { generalErrorMessage, invalidAssociateCredentialsMessage } from '../../utils/reusableStrings'

interface AlternateRefundTenderModalProps {
  theme: ThemeTypes
}

const AlternateRefundTenderModal = ({ theme }: AlternateRefundTenderModalProps): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>()
  const refundsData = useSelector(state => state.refundsData)

  const [errorMessage, setErrorMessage] = useState<string>()
  const onDismiss = () => {
    dispatch(receiveUiData({ showModal: false }))
  }

  const onSubmitManagerCredentials = (associateNum: string, associatePin: string) => {
    setErrorMessage('')
    dispatch(updateLoadingStates({ alternateRefundOverride: true }))
    isManager(associateNum, associatePin)
      .then(res => {
        if (!res.ok) {
          setErrorMessage(invalidAssociateCredentialsMessage)
          dispatch(setRefundManagerOverride(refundsData.currentlyProcessingCustomerOrderNumber, associateNum, '', RefundManagerOverrideResponse.NotAllowed))
          return false
        }
        dispatch(setRefundManagerOverride(refundsData.currentlyProcessingCustomerOrderNumber, associateNum, associatePin, RefundManagerOverrideResponse.Allowed))
        onDismiss()
      })
      .catch(err => {
        console.error('AlternateRefundTenderModal error: ' + err)
        setErrorMessage(generalErrorMessage)
        dispatch(setRefundManagerOverride(refundsData.currentlyProcessingCustomerOrderNumber, associateNum, '', RefundManagerOverrideResponse.Error))
      })
      .finally(() => {
        dispatch(updateLoadingStates({ alternateRefundOverride: false }))
      })
  }

  const handleDecline = () => {
    dispatch(setRefundManagerOverride(refundsData.currentlyProcessingCustomerOrderNumber, '', '', RefundManagerOverrideResponse.Declined))
    onDismiss()
  }

  const getTenderTypeDisplay = (tenderType: number) => {
    if (tenderType < 4) return 'credit'
    if (tenderType < 7) return 'prepaid card'
    if (tenderType === 7) return 'cash'
    if (tenderType === 8) return 'gift card'
    if (tenderType === 9) return 'paypal'
    throw new Error(`${tenderType} is an unknown tender type`)
  }

  const headers = {
    mainHeader: 'Alternate Tender',
    subHeader: 'This refund has partially or fully failed to process, and a new tender is needed to complete the return.',
    mainText: ''
  }

  const currentRefund = refundsData.refunds.find(refund => refund.returnCustomerOrderNumber === refundsData.currentlyProcessingCustomerOrderNumber)
  const tender = currentRefund?.referencedRefundResponse?.Tenders?.find(tender => tender.InternalReduxId === refundsData.currentlyProcessingTenderInternalReduxId)
  if (tender) {
    const tenderType = getTenderTypeDisplay(tender.TenderType)
    headers.mainHeader = capitalizeFirstLetter(refundsData.alternateTenderTypeSelected) + ' Tender'
    headers.subHeader = `The ${tenderType} refund partially or fully failed to process, and an alternate ${refundsData.alternateTenderTypeSelected} refund has been selected to complete the return.`
    headers.mainText = `Refund amount remaining: $${Math.abs(tender.Amount).toFixed(2)}`
  }
  return (
    <ModalBase
      modalName='alternateRefundTender'
      modalHeading={'MANAGER OVERRIDE'}
      headingSize={32}
      modalWidth={636}
      minModalHeight={384}
      dismissable={false}
      onDismiss={onDismiss}
    >
      <ManagerOverridePanel
        theme={theme}
        headers={headers}
        onSubmitManagerCredentials={onSubmitManagerCredentials}
        handleDecline={handleDecline}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </ModalBase>
  )
}

export default AlternateRefundTenderModal
