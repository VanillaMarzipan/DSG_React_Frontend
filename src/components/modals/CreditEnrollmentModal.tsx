import { useState } from 'react'
import { useDispatch } from 'react-redux'
import ModalBase from './Modal'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import CreditEnrollmentLookup from '../CreditEnrollmentLookup'
import CreditEnrollmentProcess from '../CreditEnrollmentProcess'
import { clearCreditEnrollmentData } from '../../actions/creditEnrollmentActions'
import CreditLookup from '../CreditLookup'
import { clearCustomer } from '../../actions/loyaltyActions'
import { abortCreditAccountLookup, sendTransactionToPinPad } from '../../utils/cefSharp'
import { receiveUiData } from '../../actions/uiActions'
import { UiDataTypes } from '../../reducers/uiData'
import { TransactionDataTypes } from '../../reducers/transactionData'

interface CreditEnrollmentModalProps {
  uiData: UiDataTypes
  transactionData: TransactionDataTypes
  tenderAmountInput: string
}

const CreditEnrollmentModal = ({ uiData, transactionData, tenderAmountInput }: CreditEnrollmentModalProps): JSX.Element => {
  const dispatch = useDispatch()
  const [lookupTextInput, setLookupTextInput] = useState('')
  const {
    enrollmentLookupStep,
    enrollmentStatus,
    enrollmentProcessStep,
    creditLookupStep
  } = useSelector(state => state.creditEnrollmentData)
  const headingOptions = {
    none: 'Enrollment',
    approval: 'Approval',
    declined: 'Declined',
    timedOut: 'Enrollment Expired',
    canceled: 'Enrollment Canceled',
    generalError: 'Enrollment Error'
  }
  const { creditLookupActive, creditModalFlow } = useSelector(state => state.creditEnrollmentData)
  return (
    <ModalBase
      modalName='creditEnrollment'
      modalHeading={(creditLookupActive || creditModalFlow === 'lookup') ? 'SCOREREWARDS CREDIT CARD' : ('Credit ' + headingOptions[enrollmentStatus])}
      headingSize={30}
      modalWidth={525}
      minModalHeight={449}
      dismissable={enrollmentProcessStep !== 3 && creditLookupStep !== 2 && !uiData.processingTempPass}
      backdropDismissable={!creditLookupActive}
      backgroundColor='#EDEDED'
      onDismiss={() => {
        console.info('Close Credit Enrollment Modal')
        setLookupTextInput('')
        dispatch(clearCreditEnrollmentData())
        dispatch(receiveUiData({
          creditPanelError: null,
          creditPanelErrorInstructions: null,
          scanEvent: null
        }))
        if (enrollmentLookupStep === 3 && !creditLookupActive) dispatch(clearCustomer())
        if (creditLookupActive && creditLookupStep === 3) abortCreditAccountLookup()
        // TODO: Revisit logic below when temp shopping pass is set up to handle split tender
        if (!uiData.processingAccountLookupTender && !uiData.processingTempPass) {
          sendTransactionToPinPad(transactionData)
        }
      }}
    >
      {creditLookupActive
        ? <CreditLookup
          creditPanelError={uiData.creditPanelError}
          creditPanelErrorInstructions={uiData.creditPanelErrorInstructions}
          tenderAmountInput={tenderAmountInput}
        />
        : enrollmentLookupStep > 3
          ? <CreditEnrollmentProcess lookupTextInput={lookupTextInput}/>
          : <CreditEnrollmentLookup
            uiData={uiData}
            lookupTextInput={lookupTextInput}
            setLookupTextInput={setLookupTextInput}
            enrollmentLookupStep={enrollmentLookupStep}
          />}
    </ModalBase>
  )
}

export default CreditEnrollmentModal
