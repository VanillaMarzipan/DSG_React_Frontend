import { useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { receiveUiData, updateUiData, UPDATE_UI_DATA } from '../../../actions/uiActions'
import { UiDataTypes } from '../../../reducers/uiData'
import ManagerOverridePanel from '../../reusable/ManagerOverridePanel'
import ModalBase from '../Modal'
import { ThemeTypes } from '../../../reducers/theme'
import * as CoordinatorApi from '../../../utils/coordinatorAPI'
import SwipeGiftCardPanel, { ComplimentaryGiftCardProps } from './SwipeGiftCardPanel'
import ConfirmCardCreationPanel from './ConfirmCardCreationPanel'
import ComplimentaryGiftCardSuccessPanel from './ComplimentaryGiftCardSuccessPanel'
import ChooseGiftCardActivationPanel from './ChooseGiftCardActivationPanel'
import SellGiftCardPanel from './SellGiftCardPanel'
import BackButton from '../../BackButton'
import GiftCardModalStyles from './GiftCardModalStyles'
import { AssociateDataTypes } from '../../../reducers/associateData'
import { StoreInfoTypes } from '../../../reducers/storeInformation'
import * as CefSharp from '../../../utils/cefSharp'
import Breadcrumbs from '../../Breadcrumbs'
import { TransactionDataTypes } from '../../../reducers/transactionData'
import { scanGiftCard } from '../../../actions/transactionActions'
import { invalidAssociateCredentialsMessage } from '../../../utils/reusableStrings'

interface CreateGiftCardModalProps{
  uiData: UiDataTypes
  associateData: AssociateDataTypes
  transactionData: TransactionDataTypes
  storeInfo: StoreInfoTypes
  theme: ThemeTypes
}

const loggingHeader = 'components > modals > CreateGiftCardModal > '

// eslint-disable-next-line
const CreateGiftCardModal = ({ theme, uiData, associateData, transactionData, storeInfo }: CreateGiftCardModalProps): JSX.Element => {
  const steps = ['choose', 'manager', 'swipe', 'confirm', 'complete', 'sell']

  const [errorMessage, setErrorMessage] = useState('')
  const [associateNum, setAssociateNum] = useState('')
  const [associatePin, setAssociatePin] = useState('')
  const [cardType, setCardType] = useState('')
  const [transactionNumber, setTransactionNumber] = useState(0)
  const [activationTimestamp, setActivationTimestamp] = useState('')
  const [activationTransactionId, setActivationTransactionId] = useState('')
  const [complimentaryDescription, setComplimentaryDescription] = useState('')
  const [cardCreationStep, setCardCreationStep] = useState(steps[0])
  const [breadCrumbStepNumber, setBreadCrumbStepNumber] = useState(1)
  const [displayBreadCrumbs, setDisplayBreadCrumbs] = useState(true)
  const [cardCreationError, setCardCreationError] = useState(false)
  const [isInTransaction, setIsInTransaction] = useState(false)
  const [modalHeading, setModalHeading] = useState('Manager Override')
  const [cardInformation, setCardInformation] = useState<ComplimentaryGiftCardProps | undefined>(undefined)
  const [backButtonVisible, setBackButtonVisible] = useState(true)
  const [allowFormClose, setAllowFormClose] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    if (transactionData?.header?.transactionStatus === 1) {
      setIsInTransaction(true)
    } else {
      setIsInTransaction(false)
    }
  }, [transactionData])

  useEffect(() => {
    if (cardCreationStep === 'manager') {
      setModalHeading('MANAGER OVERRIDE')
      setDisplayBreadCrumbs(false)
    } else {
      setDisplayBreadCrumbs(true)
      setModalHeading('ACTIVATE GIFT CARD')
    }

    if (cardCreationStep === 'choose') {
      setBreadCrumbStepNumber(1)
    } else if (cardCreationStep === 'complete') {
      setBreadCrumbStepNumber(3)
    } else {
      setBreadCrumbStepNumber(2)
    }

    if (cardCreationStep === 'complete') {
      beginCloseTimer()
    }

    setBackButtonVisible(cardCreationStep !== 'manager' && cardCreationStep !== 'choose' && cardCreationStep !== 'complete')
    setAllowFormClose(true)
  }, [cardCreationStep])

  useEffect(() => {
    if (uiData.giftCardAccountNumber && cardCreationStep === 'sell') {
      dispatch(scanGiftCard(uiData.giftCardAccountNumber))
      dispatch(receiveUiData({ autofocusTextbox: 'PriceEdit' }))
    }
  }, [uiData.giftCardAccountNumber])

  const clearData = () => {
    if (cardCreationStep !== 'sell') {
      dispatch(updateUiData({
        giftCardAccountNumber: null,
        giftCardExpirationDate: null
      }, UPDATE_UI_DATA))
    }
    setErrorMessage('')
    setAssociateNum('')
    setAssociatePin('')
    setCardType('')
    setComplimentaryDescription('')
    setCardCreationStep(steps[0])
    setCardInformation(undefined)
  }

  const moveToNextStep = () => {
    dispatch(updateUiData({
      scanError: false
    }, UPDATE_UI_DATA))
    setCardCreationError(false)
    let currentStep = steps.indexOf(cardCreationStep)
    if (currentStep !== steps.length - 1) {
      currentStep++
      if (associateData.isManager && steps[currentStep] === 'manager') {
        currentStep++
      }
      setCardCreationStep(steps[currentStep])
    }
  }

  const moveToPreviousStep = () => {
    dispatch(updateUiData({
      scanError: false
    }, UPDATE_UI_DATA))
    setCardCreationError(false)
    if (cardCreationStep === 'sell' || cardCreationStep === 'swipe') {
      setCardCreationStep('choose')
    } else {
      const currentStep = steps.indexOf(cardCreationStep)
      if (currentStep !== 0) {
        setCardCreationStep(steps[currentStep - 1])
      }
    }
  }

  const chooseCardType = (type: string) => {
    setCardType(type)
    if (type === 'sell') {
      setCardCreationStep('sell')
    } else {
      if (type === 'customer') {
        setComplimentaryDescription('Customer Service')
      } else if (type === 'high5') {
        setComplimentaryDescription('High Five Card')
      }
      moveToNextStep()
    }
  }

  const handleDecline = () => {
    setAssociatePin(associatePin)
    setAssociateNum(associateNum)
    dispatch(receiveUiData({ showModal: false }))
  }

  const handleManagerOverride = (associateNum: string, associatePin: string) => {
    CoordinatorApi.isManager(associateNum, associatePin).then(resp => {
      if (!resp.ok) {
        setErrorMessage(invalidAssociateCredentialsMessage)
        throw new Error('Invalid credentials')
      } else {
        setAssociateNum(associateNum)
        setAssociatePin(associatePin)
        moveToNextStep()
      }
    }).catch(ex => {
      console.error(loggingHeader + JSON.stringify(ex))
    })
  }

  const handleSwipe = (cardInformation: ComplimentaryGiftCardProps) => {
    setCardInformation(cardInformation)
    moveToNextStep()
  }

  const handleConfirm = () => {
    createGiftCardTransaction()
      .then(() => moveToNextStep())
      .catch(ex => {
        console.error(loggingHeader + JSON.stringify(ex))
      })
  }

  const createGiftCardTransaction = (): Promise<void> => {
    setAllowFormClose(false)
    setBackButtonVisible(false)
    return CoordinatorApi.getCurrentTransactionNumber()
      .then(resp => {
        if (resp.status !== 200) {
          throw new Error('getCurrentTransactionNumber: Invalid credentials\n' + JSON.stringify(resp))
        } else {
          return resp.json()
        }
      }).then(transactionNumber => {
        setTransactionNumber(transactionNumber)
        return CefSharp.BeginGiftCardActivationWithTransactionNumber(
          cardInformation.accountNumber,
          cardInformation.expirationDate,
          cardInformation.amount,
          transactionNumber,
          true,
          false
        )
      }).then(result => {
        const activationResponse = JSON.parse(result)
        if (activationResponse.Result.Status !== 0) {
          throw new Error('BeginGiftCardActivationWithTransactionNumber: not successful\n' + JSON.stringify(result))
        } else {
          setActivationTimestamp(activationResponse.PoiData.TimeStamp)
          setActivationTransactionId(activationResponse.PoiData.TransactionID)
          return CoordinatorApi.createComplimentaryGiftCard({
            managerId: associateNum,
            managerPasscode: associatePin,
            accountNumber: cardInformation.accountNumber,
            amount: cardInformation.amount,
            creditProcessorTransactionId: activationResponse.PoiData.TransactionID,
            creditProcessorTimestamp: activationResponse.PoiData.TimeStamp,
            complimentaryGiftCardType: cardType === 'high5' ? 1 : 2
          })
        }
      }).then(resp => {
        if (resp.status === 200) {
          return resp.json()
        } else {
          deactivateGiftCard()
          throw new Error('createComplimentaryGiftCard: Error saving transaction\n' + JSON.stringify(resp))
        }
      }).then(json => {
        CefSharp.printComplimentaryGiftCardChit(
          JSON.stringify(json),
          JSON.stringify(storeInfo),
          JSON.stringify(associateData),
          cardInformation.amount.toString(),
          cardInformation.accountNumber
        )
        return Promise.resolve()
      }).catch((err) => {
        setAllowFormClose(true)
        setBackButtonVisible(true)
        setCardCreationError(true)
        throw err
      })
  }

  const deactivateGiftCard = () => {
    if (activationTimestamp) {
      CefSharp.reverseGiftCardActivationWithTransactionNumber(
        transactionNumber,
        cardInformation.amount,
        activationTimestamp,
        activationTransactionId
      )
    }
  }

  const beginCloseTimer = () => {
    if (uiData.showModal === 'createGiftCard') {
      setTimeout(() => closeGiftCardModal(), 5000)
    }
  }

  const closeGiftCardModal = () => {
    clearData()
    dispatch(receiveUiData({ showModal: false }))
  }

  return (
    <ModalBase
      modalName='createGiftCard'
      modalHeading={ modalHeading }
      headingSize={32}
      modalWidth={636}
      minModalHeight={384}
      dismissable={allowFormClose}
      onDismiss={() => {
        dispatch(receiveUiData({
          scanError: false,
          scanErrorMessage: null,
          storeCreditError: false
        }))
        clearData()
      }}
    >
      {displayBreadCrumbs && (<Breadcrumbs
        currentProcessStep={breadCrumbStepNumber}
        breadcrumbCount={2}
        customContainerStyles={GiftCardModalStyles.breadCrumbs}
      />)}
      {cardCreationStep === 'choose' && (<ChooseGiftCardActivationPanel
        isInTransaction={isInTransaction}
        cardTypeSelected={chooseCardType}
      />)}
      {cardCreationStep === 'manager' && (<ManagerOverridePanel
        theme = { theme }
        errorMessage={errorMessage}
        setErrorMessage={ setErrorMessage }
        headers = {{
          mainHeader: 'High Five or Customer Service Gift Card',
          subHeader: 'Teammate is requesting to create a high five or customer service gift card for the athlete.',
          mainText: ''
        }}
        handleDecline = { handleDecline }
        onSubmitManagerCredentials = { handleManagerOverride }
      />)}
      {cardCreationStep === 'swipe' && (<SwipeGiftCardPanel
        complimentaryCardTypeDescription={complimentaryDescription}
        uiData={uiData}
        receiveGiftCardInformation={handleSwipe}
      />)}
      {cardCreationStep === 'confirm' && (<ConfirmCardCreationPanel
        complimentaryCardTypeDescription={complimentaryDescription}
        amount={cardInformation.amount}
        transactionCreationError = {cardCreationError}
        confirmCardCreation={handleConfirm}
      />)}
      {cardCreationStep === 'complete' && (<ComplimentaryGiftCardSuccessPanel
        complimentaryCardTypeDescription={complimentaryDescription}
        amount={cardInformation.amount}
        completeCardCreation={() => closeGiftCardModal()}
      />)}
      {cardCreationStep === 'sell' && (<SellGiftCardPanel uiData={uiData}/>)}
      {backButtonVisible && (<BackButton
        style={GiftCardModalStyles.backButton}
        back={moveToPreviousStep}
      />)}
    </ModalBase>
  )
}

export default CreateGiftCardModal
