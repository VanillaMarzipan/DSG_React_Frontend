import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import DollarSvg from './svg/DollarSvg'
import GolfGalaxyLogoSvg from './svg/GolfGalaxyLogoSvg'
import CreditSvg from './svg/CreditSvg'
import CashPanel from './CashPanel'
import TenderAmountPanel from './TenderAmountPanel'
import ChangePanel from './ChangePanel'
import CreditPanel from './CreditPanel'
import PropTypes from 'prop-types'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import * as CefSharp from '../utils/cefSharp'
import { Modals, UiDataTypes } from '../reducers/uiData'
import { TransactionDataTypes } from '../reducers/transactionData'
import { PrinterStringData } from '../reducers/printerString'
import { AssociateDataTypes } from '../reducers/associateData'
import { Customer } from '../reducers/loyaltyData'
import { useDispatch } from 'react-redux'
import { authorizeReturn, receiveReturnData } from '../actions/returnActions'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { ReturnDataType } from '../reducers/returnData'
import { checkForCreditTenders, checkForNonCashTenders, checkIfTransactionContainsUpc } from '../utils/transactionHelpers'
import { receiveCreditEnrollmentData } from '../actions/creditEnrollmentActions'
import { WarrantyDataTypes } from '../reducers/warrantyData'
import {
  checkForLoading,
  receiveUiData,
  setCreditErrorMessageForMatchingTenderIDs,
  updateUiData,
  UPDATE_UI_DATA,
  UPDATE_CREDIT_PANEL,
  updateLoadingStates
} from '../actions/uiActions'
import { getConfigurationValue } from '../actions/configurationActions'
import * as Storage from '../utils/asyncStorage'
import PublicLandsLogoSvg from './svg/PublicLandsLogoSvg'
import DsgLogoSvg from './svg/DsgLogoSvg'
import { SportsMatterConfigValueType } from '../reducers/configurationData'
import { isConfigurationValid } from '../utils/sportsMatterCampaign'
import { addRefundToGiftCard, getRefundMethods, setCurrentRefundCustomerOrderNumber, setRefundStatus, setTenderEndzoneStatus, addRefundToCash, setCurrentlyProcessingTenderInternalReduxId, setAlternateTenderTypeSelected, refreshRefundData } from '../actions/refundsActions'
import { IRefund, ITender, RefundStatus, EndzoneTenderStatus } from '../reducers/refundsData'
import { RefundManagerOverrideResponse } from '../reducers/alternateRefundData'
import { createRefundManagerOverride, setRefundManagerOverride } from '../actions/alternateRefundActions'
import { getGiftCardMinimumAmount } from '../utils/giftCardHelpers'
import { obfuscateAccountNumber } from '../utils/formatters'
enum SetupSequence {
  NotStarted,
  Initialize,
  CallRefundMethods,
  ReturnsAuthCall
}

enum PaymentPanelMode {
  Default,
  RefundSelection
}

enum AlternateRefundTenderType {
  NotSelected,
  Credit,
  GiftCard,
  Cash
}

type ButtonsEnabled = {
  Cash: boolean
  Credit: boolean
  GiftCard: boolean
}

interface PaymentPanelProps {
  transactionData: TransactionDataTypes
  uiData: UiDataTypes
  displayCashPanel: () => void
  displayCreditPanel: () => void
  promptForTenderAmount: () => void
  calculateChange: (
    input: string,
    remainingBalance: number,
    printerString: PrinterStringData,
    associateData: AssociateDataTypes,
    selectedLoyaltyCustomer: Customer,
    returnData: ReturnDataType,
    warrantyData: WarrantyDataTypes,
    refundCustomerOrderNumber?: string,
    refundTenderNumber?: number,
    alternateTenderManagerOverrideId?: string,
    alternateTenderManagerOverridePin?: string) => void
  createNewCreditTender: (
    printerString: PrinterStringData,
    associateData: AssociateDataTypes,
    selectedLoyaltyCustomer: Customer,
    returnData: ReturnDataType,
    creditResponse: string,
    warrantyData: WarrantyDataTypes,
    tenderIdentifier: string,
    refundCustomerOrderNumber?: string,
    refundTenderNumber?: number,
    alternateTenderManagerOverrideId?: string,
    alternateTenderManagerOverridePin?: string) => void
  printerString: PrinterStringData
  associateData: AssociateDataTypes
  selectedLoyaltyCustomer: Customer
  returnData: ReturnDataType
  splitTender: boolean
  setSplitTender: (isSplitTender: boolean) => void
  setTenderAmountInput: (remainingBalance: string) => void
  tenderAmountInput: string
  giftCardSelected: boolean
  setGiftCardSelected: (giftCardSelected: boolean) => void
  isStoreCredit: boolean
  setIsStoreCredit: (isStoreCredit: boolean) => void
  isRefundingOver500OnGiftCards: boolean
}

const PaymentPanel = ({
  uiData,
  displayCashPanel,
  displayCreditPanel,
  promptForTenderAmount,
  transactionData,
  calculateChange,
  associateData,
  printerString,
  selectedLoyaltyCustomer,
  returnData,
  createNewCreditTender,
  splitTender,
  setSplitTender,
  setTenderAmountInput,
  tenderAmountInput,
  giftCardSelected,
  setGiftCardSelected,
  isStoreCredit,
  setIsStoreCredit,
  isRefundingOver500OnGiftCards
}: PaymentPanelProps) => {
  const {
    warrantyData,
    featureFlagData,
    registerData,
    refundsData,
    alternateRefundData
  } = useSelector(state => state)
  const [giftCardAmount, setGiftCardAmount] = useState<number>(0)
  const [returnsAuthModalPreviouslyShown, setReturnsAuthModalPreviouslyShown] = useState<boolean>(false)
  const campaignConfiguration: SportsMatterConfigValueType = getConfigurationValue('sportsmattercampaign')
  const sportsMatterModalUseCampaign = featureFlagData.features?.includes('UseSportsMatterCampaignModal')
  const [setupSequence, setSetupSequence] = useState<SetupSequence>(SetupSequence.NotStarted)
  const [paymentsPanelMode, setPaymentsPanelMode] = useState<PaymentPanelMode>(PaymentPanelMode.Default)
  const [currentRefundsCustomerOrderNumber, setCurrentRefundsCustomerOrderNumber] = useState('')
  const [currentRefundTenderId, setCurrentRefundTenderId] = useState(-1)
  const [currentRefundAmount, setCurrentRefundAmount] = useState(0)
  const [currentRefundDueType, setCurrentRefundDueType] = useState('')
  const [buttonsDefaultEnabled, setButtonsDefaultEnabled] = useState<ButtonsEnabled>({ Cash: false, Credit: false, GiftCard: false })
  const [buttonsEnabled, setButtonsEnabled] = useState<ButtonsEnabled>({ Cash: false, Credit: false, GiftCard: false })
  const [alternateRefundTenderTypeSelected, setAlternateRefundTenderTypeSelected] = useState<AlternateRefundTenderType>(AlternateRefundTenderType.NotSelected)
  const [refundSelectionErrorMessage, setRefundSelectionErrorMessage] = useState<string>('')

  const shouldPromptSportsMatter = (
    featureFlagData.features?.includes('SportsMatterPrompt') &&
    campaignConfiguration?.campaignActive === true &&
    !uiData.customerRespondedToSportsMatter &&
    !uiData.loadingStates.void &&
    uiData.showModal === false &&
    uiData.activePanel === 'paymentPanel' &&
    transactionData?.total?.grandTotal > 0 &&
    transactionData?.tenders?.length === 0 &&
    !checkIfTransactionContainsUpc(campaignConfiguration?.upc, transactionData.items) &&
    (!sportsMatterModalUseCampaign || isConfigurationValid(campaignConfiguration))
  )

  const isWeb = Platform.OS === 'web'
  let isCefSharp = false
  if (isWeb) {
    isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
  }

  const isRefund = transactionData?.originalSaleInformation?.length > 0 && transactionData?.total?.grandTotal < 0
  const isNonReceiptedReturn = isRefund && transactionData.originalSaleInformation[0].returnOriginationType === 1
  const isGiftReceiptReturn = isRefund && transactionData.originalSaleInformation[0].returnOriginationType === 2

  const shouldFireRefundMethodsCall =
    featureFlagEnabled('ReferencedRefunds') &&
    isCefSharp &&
    isRefund &&
    transactionData?.originalSaleInformation?.length > 0 &&
    transactionData?.originalSaleInformation[0]?.customerOrderNumber?.length > 0

  const [modalQueue, setModalQueue] = useState([])
  const handleModalQueue = (action: string, modalToQueue?: Modals) => {
    const modalQueueClone = [...modalQueue]
    if (action === 'q') {
      modalQueueClone.push(modalToQueue)
    } else if (action === 'dq') {
      const modalToDequeue = modalQueueClone[modalQueueClone.length - 1]
      modalQueueClone.pop()
      dispatch(receiveUiData({ showModal: modalToDequeue }))
    }
    setModalQueue(modalQueueClone)
  }

  useEffect(() => {
    if (uiData.showModal === false &&
      modalQueue.length > 0 &&
      uiData.modalClosedByUser !== 'returnsAuthorization') {
      handleModalQueue('dq')
    }
  }, [modalQueue, uiData.showModal])

  useEffect(() => {
    if (uiData.showModal === 'returnsAuthorization' && !returnsAuthModalPreviouslyShown) setReturnsAuthModalPreviouslyShown(true)
    if (returnsAuthModalPreviouslyShown &&
      shouldPromptSportsMatter) {
      setReturnsAuthModalPreviouslyShown(false)
      if (sportsMatterModalUseCampaign) {
        handleModalQueue('q', 'sportsMatterCampaign')
      } else {
        handleModalQueue('q', 'sportsMatterRoundUp')
      }
    }
  }, [uiData.showModal])

  useEffect(() => {
    if (returnData?.returnAuthorizationData?.action.toLowerCase() === 'approved') {
      if (shouldPromptSportsMatter) {
        if (sportsMatterModalUseCampaign) {
          handleModalQueue('q', 'sportsMatterCampaign')
        } else {
          handleModalQueue('q', 'sportsMatterRoundUp')
        }
      }
      if (shouldFireRefundMethodsCall) {
        setSetupSequence(SetupSequence.CallRefundMethods)
      }
    }
    dispatch(updateLoadingStates({ authorizeReturn: null }))
  }, [returnData.returnAuthorizationData])

  const disableSplitTender = (
    (transactionData && transactionData.total?.remainingBalance < 0) ||
    checkForLoading(uiData.loadingStates) ||
    isNonReceiptedReturn ||
    isGiftReceiptReturn ||
    uiData.priceEditActive
  )
  const adyenGiftCardTendering = registerData.isAdyen && featureFlagData.features?.includes('AdyenGiftCardTendering')
  const manuallyEnterGiftCard = registerData.isAdyen && featureFlagData.features?.includes('ManuallyEnterGiftCard')

  const allowRefund = isRefund && transactionData.originalSaleInformation[0].originalTenders?.length > 0

  const isCashRefund = (
    allowRefund &&
    !checkForNonCashTenders(transactionData.originalSaleInformation[0].originalTenders) &&
    transactionData.originalSaleInformation[0].returnSource === 2
  )

  const disableStoreCredit = (
    !featureFlagEnabled('NonReceiptedReturns') ||
    checkForLoading(uiData.loadingStates) ||
    !isNonReceiptedReturn ||
    isGiftReceiptReturn ||
    uiData.priceEditActive
  )
  const dispatch = useDispatch()

  const initializeButtons = () => {
    const creditTendersCheck = transactionData.originalSaleInformation?.length > 0 &&
      transactionData.originalSaleInformation[0].originalTenders &&
      checkForCreditTenders(transactionData.originalSaleInformation[0].originalTenders)
    const loadingCheck = checkForLoading(uiData.loadingStates)
    const giftcardMinimumAmount = getGiftCardMinimumAmount()
    const buttonsStates: ButtonsEnabled = {
      Cash: transactionData?.total?.grandTotal > 0 ||
      !(
        (!isCashRefund && transactionData.total?.grandTotal < 0) ||
        loadingCheck ||
        isNonReceiptedReturn ||
        isGiftReceiptReturn ||
        uiData.priceEditActive
      ),
      Credit: transactionData.total?.grandTotal > 0 ||
      (
        allowRefund &&
        creditTendersCheck &&
        !loadingCheck &&
        !(isNonReceiptedReturn || isGiftReceiptReturn) &&
        !uiData.priceEditActive
      ),
      GiftCard: transactionData.total?.grandTotal > giftcardMinimumAmount || (
        !loadingCheck &&
        !isNonReceiptedReturn &&
        !uiData.priceEditActive
      )
    }
    setButtonsEnabled(buttonsStates)
    setButtonsDefaultEnabled(buttonsStates)

    if (paymentsPanelMode === PaymentPanelMode.RefundSelection) {
      setButtonsEnabled({ Cash: true, Credit: true, GiftCard: buttonsStates.GiftCard })
    }
  }

  useEffect(() => {
    setSetupSequence(SetupSequence.Initialize)
  }, [])

  useEffect(() => {
    switch (setupSequence) {
    case SetupSequence.Initialize: {
      initializeButtons()
      setCurrentRefundsCustomerOrderNumber('')

      if (!disableSplitTender && transactionData?.tenders?.length > 0) {
        setSplitTender(true)
      }
      if (splitTender && transactionData?.tenders?.length === 0) {
        setSplitTender(false)
      }
      setGiftCardSelected(false)
      setIsStoreCredit(false)

      setSetupSequence(SetupSequence.ReturnsAuthCall)
      break
    }
    case SetupSequence.ReturnsAuthCall: {
      if (featureFlagEnabled('ReturnsAuthorization') && transactionData.header.transactionType === 4 && uiData.activePanel === 'paymentPanel') {
        if (transactionData.originalSaleInformation && transactionData.originalSaleInformation[0].returnOriginationType === 1) {
          handleModalQueue('q', 'returnsAuthorization')
        } else {
          dispatch(updateLoadingStates({ authorizeReturn: true }))
          dispatch(authorizeReturn(transactionData?.total?.grandTotal === 0, uiData.showModal))
        }
      } else if (shouldPromptSportsMatter) {
        if (sportsMatterModalUseCampaign) {
          handleModalQueue('q', 'sportsMatterCampaign')
        } else {
          handleModalQueue('q', 'sportsMatterRoundUp')
        }
      } else if (transactionData?.total?.grandTotal === 0 && uiData.activePanel === 'paymentPanel') {
        dispatch(receiveUiData({
          activePanel: 'changePanel',
          tenderType: 'cash'
        }))
      }
      break
    }
    case SetupSequence.CallRefundMethods: {
      const coNumber = transactionData.originalSaleInformation[0].customerOrderNumber
      const amount = transactionData.total.grandTotal
      const returnSource = transactionData.originalSaleInformation[0].returnSource
      dispatch(updateLoadingStates({ getRefundMethods: true }))
      dispatch(getRefundMethods(coNumber, amount, returnSource))
      break
    }
    } // end switch (setupStatus)
  }, [setupSequence])

  if (featureFlagEnabled('ReferencedRefunds')) {
    useEffect(() => {
      if (uiData.callRefundMethodsAfterReturnsAuth) {
        dispatch(receiveUiData({ callRefundMethodsAfterReturnsAuth: false }))
        setSetupSequence(SetupSequence.CallRefundMethods)
      }
    }, [uiData.callRefundMethodsAfterReturnsAuth])

    useEffect(() => {
      if (setupSequence !== SetupSequence.CallRefundMethods) {
        return
      }
      dispatch(updateLoadingStates({ getRefundMethods: false }))
      const refundIndex = refundsData.refunds.findIndex(r => r.refundStatus === RefundStatus.NotProcessed)
      if (refundIndex > -1) {
        handleModalQueue('q', 'referencedRefund')
        return
      }
      const refund: IRefund | undefined = refundsData.refunds.find(r => r.returnCustomerOrderNumber === refundsData.currentlyProcessingCustomerOrderNumber)
      if (!refund) {
        console.error(`No refund found for CO# ${refundsData.currentlyProcessingCustomerOrderNumber}`)
        return
      }
      if (!refund.refundStatus) {
        const obj = JSON.stringify(refund)
        console.error(`Refund status not set for refund: ${obj}`)
        return
      }
      switch (refund.refundStatus) {
      case RefundStatus.ReadyToProcess: {
        dispatch(setRefundStatus(refund.returnCustomerOrderNumber, RefundStatus.ProcessingPaypal))
        break
      }
      case RefundStatus.ProcessingPaypal: {
        const paypalTender: ITender | undefined = refund.referencedRefundResponse.Tenders.find(t => t.TenderType === 9 && t.InternalReduxStatus !== EndzoneTenderStatus.Processed)
        if (!paypalTender) {
          dispatch(setRefundStatus(refund.returnCustomerOrderNumber, RefundStatus.ProcessingCredit))
          break
        }

        if (paypalTender.InternalReduxStatus === EndzoneTenderStatus.Unprocessed) {
          setButtonsEnabled(buttonsDefaultEnabled)
          dispatch(createRefundManagerOverride(refund.returnCustomerOrderNumber))
          dispatch(setCurrentlyProcessingTenderInternalReduxId(refund.returnCustomerOrderNumber, paypalTender.InternalReduxId))
          dispatch(setTenderEndzoneStatus(refund.returnCustomerOrderNumber, paypalTender.InternalReduxId, EndzoneTenderStatus.Processing))
        } else if (paypalTender.InternalReduxStatus === EndzoneTenderStatus.Processing) {
          const buttonsToEnable: ButtonsEnabled = { Cash: false, Credit: true, GiftCard: (getGiftCardMinimumAmount() < Math.abs(paypalTender.Amount)) }
          setButtonsEnabled(buttonsToEnable)
          setCurrentRefundsCustomerOrderNumber(refund.returnCustomerOrderNumber)
          setCurrentRefundTenderId(paypalTender.InternalReduxId)
          setCurrentRefundAmount(paypalTender.Amount)
          setPaymentsPanelMode(PaymentPanelMode.RefundSelection)
        }
        break
      }
      case RefundStatus.ProcessingCredit: {
        const creditAndDebit = [0, 1, 2, 3] // respectively: CHARGE, CREDIT, DEBIT, DEFERRED_DEBIT
        const creditTender: ITender | undefined = refund.referencedRefundResponse.Tenders.find(t => creditAndDebit.includes(t.TenderType) && t.InternalReduxStatus !== EndzoneTenderStatus.Processed)
        if (!creditTender) {
          dispatch(setRefundStatus(refund.returnCustomerOrderNumber, RefundStatus.ProcessingGiftCard))
          break
        }

        if (creditTender.InternalReduxStatus === EndzoneTenderStatus.Unprocessed) {
          setButtonsEnabled(buttonsDefaultEnabled)
          dispatch(setCurrentlyProcessingTenderInternalReduxId(refund.returnCustomerOrderNumber, creditTender.InternalReduxId))
          dispatch(setTenderEndzoneStatus(refund.returnCustomerOrderNumber, creditTender.InternalReduxId, EndzoneTenderStatus.Processing))
          const successAndPending = [0, 3]
          if (successAndPending.includes(creditTender.Status)) {
            setCurrentRefundsCustomerOrderNumber(refund.returnCustomerOrderNumber)
            setCurrentRefundTenderId(creditTender.InternalReduxId)
            setCurrentRefundAmount(creditTender.Amount)
            const paymentsResponseFormat = {
              Result: {
                Status: 0,
                ProcessorReference: creditTender.ProcessorReference
              },
              AdditionalResponse: {
                ReferencedRefund: true,
                ReferencedRefundTimeStamp: new Date().toISOString(),
                CustomerOrderNumber: refund.returnCustomerOrderNumber
              },
              Tender: {
                AuthorizedAmount: creditTender.Amount,
                Card: {
                  EntryMode: [3], // Adyen's EntryModeType.File = 3, maps to our enum TenderInputMethod.Lookup
                  Brand: creditTender.Brand,
                  TenderType: creditTender.TenderType,
                  MaskedPan: creditTender.MaskedPan,
                  ExpiryDate: creditTender.ExpiryDate
                }
              }
            }
            const creditResponse = JSON.stringify(paymentsResponseFormat)
            createNewCreditTender(printerString, associateData, selectedLoyaltyCustomer, returnData, creditResponse, warrantyData, transactionData.header.tenderIdentifier, refund.returnCustomerOrderNumber, creditTender.InternalReduxId)
          } else {
            const buttonsToEnable: ButtonsEnabled = { Cash: false, Credit: true, GiftCard: (getGiftCardMinimumAmount() < Math.abs(creditTender.Amount)) }
            setButtonsEnabled(buttonsToEnable)
            setCurrentRefundsCustomerOrderNumber(refund.returnCustomerOrderNumber)
            setCurrentRefundTenderId(creditTender.InternalReduxId)
            setCurrentRefundAmount(creditTender.Amount)
            setPaymentsPanelMode(PaymentPanelMode.RefundSelection)
            dispatch(createRefundManagerOverride(refund.returnCustomerOrderNumber))
            dispatch(setTenderEndzoneStatus(refund.returnCustomerOrderNumber, creditTender.InternalReduxId, EndzoneTenderStatus.CreditFailInitiatingNewTender))
          }
        }
        break
      }
      case RefundStatus.ProcessingGiftCard: {
        const prepaidAndGidtCards = [4, 5, 6, 8] // respectively: PREPAID, PREPAID_RELOADABLE, PREPAID_NONRELOADABLE, GIFTCARD
        const giftCardTender: ITender | undefined = refund.referencedRefundResponse.Tenders.find(t => prepaidAndGidtCards.includes(t.TenderType) && t.InternalReduxStatus !== EndzoneTenderStatus.Processed && t.InternalReduxStatus !== EndzoneTenderStatus.ProcessAsCash)
        if (!giftCardTender) {
          dispatch(setRefundStatus(refund.returnCustomerOrderNumber, RefundStatus.ProcessingCash))
          break
        }
        if (giftCardTender.InternalReduxStatus === EndzoneTenderStatus.Unprocessed) {
          setButtonsEnabled(buttonsDefaultEnabled)
          dispatch(setCurrentlyProcessingTenderInternalReduxId(refund.returnCustomerOrderNumber, giftCardTender.InternalReduxId))
          dispatch(setTenderEndzoneStatus(refund.returnCustomerOrderNumber, giftCardTender.InternalReduxId, EndzoneTenderStatus.Processing))
        } else if (giftCardTender.InternalReduxStatus === EndzoneTenderStatus.Processing) {
          setGiftCardSelected(true)
          setGiftCardAmount(giftCardTender.Amount)
          setCurrentRefundAmount(giftCardTender.Amount)
          setCurrentRefundsCustomerOrderNumber(refund.returnCustomerOrderNumber)
          setCurrentRefundTenderId(giftCardTender.InternalReduxId)
          dispatch(receiveUiData({ activePanel: 'creditPanel', creditPanelError: null, creditPanelErrorInstructions: null }))
        }
        break
      }
      case RefundStatus.ProcessingCash: {
        const cashTender: ITender | undefined = refund.referencedRefundResponse.Tenders.find(t => t.TenderType === 7)
        if (!cashTender) {
          dispatch(setRefundStatus(refund.returnCustomerOrderNumber, RefundStatus.Processed))
          break
        }
        if (cashTender.InternalReduxStatus === EndzoneTenderStatus.Unprocessed) {
          setButtonsEnabled(buttonsDefaultEnabled)
          dispatch(setCurrentlyProcessingTenderInternalReduxId(refund.returnCustomerOrderNumber, cashTender.InternalReduxId))
          dispatch(setTenderEndzoneStatus(refund.returnCustomerOrderNumber, cashTender.InternalReduxId, EndzoneTenderStatus.Processing))
        } else if (cashTender.InternalReduxStatus === EndzoneTenderStatus.Processing) {
          let managerId = null
          let managerPasscode = null
          if (refund.returnCustomerOrderNumber in alternateRefundData && !alternateRefundData[refund.returnCustomerOrderNumber].applied) {
            managerId = alternateRefundData[refund.returnCustomerOrderNumber].managerOverrideId
            managerPasscode = alternateRefundData[refund.returnCustomerOrderNumber].managerOverridePIN
          }
          calculateChange(transactionData.total.remainingBalance.toString(), /* cashTender.Amount */ transactionData.total.remainingBalance, printerString, associateData, selectedLoyaltyCustomer, returnData, warrantyData, refund.returnCustomerOrderNumber, cashTender.InternalReduxId, managerId, managerPasscode)
        }
        break
      }
      case RefundStatus.Processed: {
        dispatch(setCurrentRefundCustomerOrderNumber(''))
        setCurrentRefundsCustomerOrderNumber('')
        const refundIndex = refundsData.refunds.findIndex(r => r.refundStatus === RefundStatus.NotProcessed)
        if (refundIndex > -1) {
          handleModalQueue('q', 'referencedRefund')
        }
        break
      }
      }
    }, [refundsData])

    useEffect(() => {
      if (currentRefundsCustomerOrderNumber?.length > 0 &&
          currentRefundsCustomerOrderNumber in alternateRefundData &&
          alternateRefundData[currentRefundsCustomerOrderNumber].managerOverrideResponse === RefundManagerOverrideResponse.Allowed &&
          !alternateRefundData[currentRefundsCustomerOrderNumber].applied) {
        dispatch(setRefundManagerOverride(currentRefundsCustomerOrderNumber, alternateRefundData[currentRefundsCustomerOrderNumber].managerOverrideId, alternateRefundData[currentRefundsCustomerOrderNumber].managerOverridePIN, RefundManagerOverrideResponse.Processed))
        processAlternateTenderRefund()
      }
    }, [alternateRefundData])
  }

  useEffect(() => {
    if (uiData.giftCardAccountNumber != null && transactionData?.total?.remainingBalance < 0) {
      dispatch(receiveUiData({
        creditPanelError: null,
        creditPanelErrorInstructions: null
      }))
      const shouldBlockTender = async () => {
        const createNewCreditTenderLatch = await Storage.getData('createNewCreditTenderLatch')
        if (createNewCreditTenderLatch === transactionData.header.tenderIdentifier) {
          return true
        }
        return false
      }
      shouldBlockTender()
        .then(result => {
          if (result === true) {
            dispatch(setCreditErrorMessageForMatchingTenderIDs())
          } else {
            console.info('giftcard swiped: ')
            dispatch(updateLoadingStates({ giftCardActivation: true }))
            let amount = transactionData?.total?.remainingBalance
            const giftCardRefundMustBeIncremented = returnData.giftCardRefundTracker.length > 0
            if (giftCardRefundMustBeIncremented) {
              for (let i = 0; i < returnData.giftCardRefundTracker.length; i++) {
                if (returnData.giftCardRefundTracker[i].refunded === false) {
                  amount = returnData.giftCardRefundTracker[i].incrementedAmount * -1
                  break
                }
              }
            }
            if (featureFlagEnabled('ReferencedRefunds') && currentRefundsCustomerOrderNumber?.length > 0) {
              amount = currentRefundAmount
            }
            let managerId = null
            let managerPin = null
            if (currentRefundsCustomerOrderNumber in alternateRefundData && !alternateRefundData[currentRefundsCustomerOrderNumber].applied) {
              managerId = alternateRefundData[currentRefundsCustomerOrderNumber].managerOverrideId
              managerPin = alternateRefundData[currentRefundsCustomerOrderNumber].managerOverridePIN
            }
            dispatch(updateLoadingStates({ giftCardActivation: true }))
            CefSharp.beginGiftCardActivation(amount, uiData.giftCardAccountNumber, uiData.giftCardExpirationDate, transactionData, false, isStoreCredit, transactionData.header.tenderIdentifier)
              .then(data => {
                if (JSON.parse(data[0]).Result.PaymentErrorResponse === null && giftCardRefundMustBeIncremented) {
                  const giftCardRefundTrackerClone = JSON.parse(JSON.stringify(returnData.giftCardRefundTracker))
                  for (let i = 0; i < giftCardRefundTrackerClone.length; i++) {
                    if (giftCardRefundTrackerClone[i].refunded === false) {
                      giftCardRefundTrackerClone[i].refunded = true
                      giftCardRefundTrackerClone[i].giftCardIdentifier = uiData.giftCardAccountNumber.slice(-4)
                      break
                    }
                  }
                  dispatch(receiveReturnData({
                    giftCardRefundTracker: giftCardRefundTrackerClone
                  }))
                }
                dispatch(updateUiData({ giftCardAccountNumber: null }, UPDATE_UI_DATA))
                // call coordinator to add tender
                createNewCreditTender(
                  printerString,
                  associateData,
                  selectedLoyaltyCustomer,
                  returnData,
                  data[data.length - 1],
                  warrantyData,
                  transactionData.header.tenderIdentifier,
                  currentRefundsCustomerOrderNumber,
                  currentRefundTenderId,
                  managerId,
                  managerPin
                )
                dispatch(updateLoadingStates({ giftCardActivation: false }))
              })
              .catch(e => {
                dispatch(updateLoadingStates({ giftCardActivation: false }))
                console.info('CefSharp - Error beginGiftCardActivation:  ', JSON.stringify(e))
              })
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }, [uiData.giftCardAccountNumber])

  useEffect(() => {
    if (uiData.giftCardError != null) {
      dispatch(
        updateUiData(
          {
            creditPanelError: uiData.giftCardError,
            creditPanelErrorInstructions: 'Please try a different gift card'
          },
          UPDATE_CREDIT_PANEL
        )
      )
      dispatch(updateUiData({ giftCardError: null }, UPDATE_UI_DATA))
    }
  }, [uiData.giftCardError])

  useEffect(() => {
    if (!uiData.processingTempPass) {
      CefSharp.setBarcodeScannerEnabled(true)
    }
  }, [uiData.processingTempPass])

  /**
   * Send data to cefSharp to begin tender on pinpad. Call createNewCreditTender with data returned from cefSharp and pinpad.
   */
  const initiateCredit = async (amount): Promise<void> => {
    console.info('ENTER: initiateCredit', amount, JSON.stringify(transactionData))
    dispatch(receiveUiData({
      creditPanelError: null,
      creditPanelErrorInstructions: null
    }))
    displayCreditPanel()
    const createNewCreditTenderLatch = await Storage.getData('createNewCreditTenderLatch')
    if (createNewCreditTenderLatch === transactionData.header.tenderIdentifier) {
      dispatch(setCreditErrorMessageForMatchingTenderIDs())
      return
    }
    let managerId = null
    let managerPin = null
    if (currentRefundsCustomerOrderNumber in alternateRefundData && !alternateRefundData[currentRefundsCustomerOrderNumber].applied) {
      managerId = alternateRefundData[currentRefundsCustomerOrderNumber].managerOverrideId
      managerPin = alternateRefundData[currentRefundsCustomerOrderNumber].managerOverridePIN
    }
    CefSharp.beginCreditTender(amount, transactionData)
      .then(data => {
        console.info('SUCCESS: BeginCreditTender', data)
        let parsedData = null
        try {
          parsedData = JSON.parse(data[data.length - 1])
          console.info('beginCreditTender parse try')
        } catch (error) {
          console.info('beginCreditTender parse catch', error)
        }
        if (parsedData?.Result?.PaymentErrorResponse?.ErrorCondition === 0) {
          console.info('BeginCreditTender: Barcode scan cancelled acquisition')
        } else {
          createNewCreditTender(
            printerString,
            associateData,
            selectedLoyaltyCustomer,
            returnData,
            data[data.length - 1],
            warrantyData,
            transactionData.header.tenderIdentifier,
            currentRefundsCustomerOrderNumber,
            currentRefundTenderId,
            managerId,
            managerPin
          )
        }
        dispatch(updateUiData({ getCardDataEvent: null }, UPDATE_UI_DATA))
      })
      .catch(e => console.info('CefSharp Error - BeginCreditTender: ', JSON.stringify(e)))
  }

  /**
   * Send data to cefSharp to begin tender on pinpad. Call createNewCreditTender with data returned from cefSharp and pinpad.
   * NOTE: Can be removed when Adyen supports giftcards on card acquisition
   */
  const initiateGiftCard = async (amount): Promise<void> => {
    console.info('initiateGiftCard called', amount)
    setGiftCardAmount(amount)
    dispatch(receiveUiData({ activePanel: 'creditPanel', creditPanelError: null, creditPanelErrorInstructions: null, displayInsertCard: false }))
    const createNewCreditTenderLatch = await Storage.getData('createNewCreditTenderLatch')
    if (createNewCreditTenderLatch === transactionData.header.tenderIdentifier) {
      dispatch(setCreditErrorMessageForMatchingTenderIDs())
      return
    }
    if (adyenGiftCardTendering) {
      console.info('initiateGiftCard > adyenGiftCardTendering')
      CefSharp.beginGiftCardTender(
        amount,
        transactionData,
        false
      )
    } else {
      console.info('initiateGiftCard > beginCreditTender')
      CefSharp.beginCreditTender(amount, transactionData)
        .then(data => {
          createNewCreditTender(
            printerString,
            associateData,
            selectedLoyaltyCustomer,
            returnData,
            data[data.length - 1],
            warrantyData,
            transactionData.header.tenderIdentifier
          )
        })
        .catch(e => console.info('CefSharp - Error beginCreditTender:', JSON.stringify(e)))
    }
  }

  const processAlternateTenderRefund = () => {
    setPaymentsPanelMode(PaymentPanelMode.Default)
    switch (alternateRefundTenderTypeSelected) {
    case AlternateRefundTenderType.Credit: {
      initiateCredit(currentRefundAmount)
      break
    }
    case AlternateRefundTenderType.GiftCard: {
      dispatch(addRefundToGiftCard(currentRefundsCustomerOrderNumber, currentRefundAmount, currentRefundTenderId))
      dispatch(setTenderEndzoneStatus(currentRefundsCustomerOrderNumber, currentRefundTenderId, EndzoneTenderStatus.Processed))
      break
    }
    case AlternateRefundTenderType.Cash: {
      dispatch(addRefundToCash(currentRefundsCustomerOrderNumber, currentRefundAmount, currentRefundTenderId))
      dispatch(setTenderEndzoneStatus(currentRefundsCustomerOrderNumber, currentRefundTenderId, EndzoneTenderStatus.Processed))
      break
    }
    }
  }

  let tenderDisplay = {}
  let _primaryButtonStyle = styles.buttonSizeLarge
  let _secondaryButtonStyle = styles.buttonSecondary
  if (
    transactionData?.total?.remainingBalance &&
    transactionData.total.remainingBalance < transactionData.total.grandTotal
  ) {
    _primaryButtonStyle = styles.buttonSizeSmall
    _secondaryButtonStyle = styles.buttonSecondarySmall
    tenderDisplay = (
      <View style={styles.columnContainer}>
        <Text testID='amount-due' style={styles.dues}>
          <Text>Total Due: </Text>
          <Text
            style={[transactionData?.total?.grandTotal < 0 && { color: '#B80818' }]}>${transactionData?.total?.grandTotal?.toFixed(2)}</Text>
        </Text>
        <Text testID='total-tendered' style={styles.dues}>
          {`Total Tendered:  $${transactionData.total &&
          (
            transactionData?.total?.grandTotal -
            transactionData?.total?.remainingBalance
          ).toFixed(2)}`}
        </Text>
        {transactionData?.total?.remainingBalance > 0 && (
          <Text
            testID='remaining-balance'
            style={[styles.dues, styles.bordered, styles.red]}
          >
            {`Remaining Due:  $${transactionData.total &&
            transactionData?.total?.remainingBalance?.toFixed(2)}`}
          </Text>
        )}
      </View>
    )
  } else {
    tenderDisplay = (
      <View style={styles.columnContainer}>
        <Text testID='amount-due' style={[styles.totalDue, !isRefundingOver500OnGiftCards && styles.bordered]}>
          <Text>Total Due: </Text>
          <Text style={[transactionData?.total?.grandTotal < 0 && { color: '#B80818' }]}>
            {/*  Method for rendering the negative sign before the dollar sign for negative totals from a return trx */}
            {transactionData?.total?.grandTotal < 0 && '-'}
            ${transactionData?.total?.grandTotal < 0
              ? (transactionData?.total?.grandTotal * -1).toFixed(2)
              : transactionData?.total?.grandTotal.toFixed(2)}
          </Text>
        </Text>
        {featureFlagEnabled('ReferencedRefunds') && uiData.activePanel === 'creditPanel' && transactionData?.total?.grandTotal < 0 && (currentRefundDueType?.length > 0) && (
          <Text
            testID='remaining-balance'
            style={[styles.dues, styles.bordered, styles.red]}
          >
            {`${currentRefundDueType} Due:  $-${Math.abs(currentRefundAmount).toFixed(2)}`}
          </Text>
        )}
      </View>
    )
  }

  const disableCreditLookup = (
    !registerData.isAdyen ||
    !featureFlagData.features?.includes('CreditLookup') ||
    transactionData?.total?.grandTotal < 0 ||
    checkForLoading(uiData.loadingStates) ||
    isNonReceiptedReturn ||
    uiData.priceEditActive
  )

  useEffect(() => {
    if (uiData.activePanel === 'paymentPanel') {
      initializeButtons()
      dispatch(refreshRefundData())
    }
  }, [uiData.activePanel])

  let completedTenderingPanel: JSX.Element = null
  if (uiData.activePanel === 'changePanel' && transactionData.total?.changeDue !== undefined) {
    if (featureFlagEnabled('ReferencedRefunds') && refundsData?.refunds?.length > 0) {
      const refundTotals = []
      refundsData.refunds.forEach(refund => {
        refund.referencedRefundResponse?.Tenders?.forEach(tender => {
          switch (tender.TenderType) {
          case 0:
          case 1:
          case 2:
          case 3:
            refundTotals.push({ typeGroup: 1, txt: `Credit ${obfuscateAccountNumber(tender.MaskedPan, true)}`, amount: Math.abs(tender.Amount) })
            break
          case 4:
          case 5:
          case 6:
          case 8:
            if (tender.InternalReduxStatus !== EndzoneTenderStatus.ProcessAsCash) {
              refundTotals.push({ typeGroup: 2, txt: 'Gift card', amount: Math.abs(tender.Amount) })
            }
            break
          case 7:
            refundTotals.push({ typeGroup: 3, txt: 'Cash', amount: Math.abs(tender.Amount) })
            break
          }
        })
      })
      if (refundTotals.length === 1) {
        completedTenderingPanel = (
          <Text style={styles.amountReturnedText}>Amount Returned: {refundTotals[0].amount.toFixed(2)}</Text>
        )
      } else {
        refundTotals.sort((a, b) => {
          return a.typeGroup - b.typeGroup // order by tender type group
        })
        let total = 0
        const items: Array<JSX.Element> = []
        for (let idx = 0; idx < refundTotals.length; idx++) {
          total += refundTotals[idx].amount
          items.push(
            <View style={[styles.refundTotalTenderedView, { borderTopWidth: idx > 0 ? 1 : 0 }]}>
              <View><Text style={{ fontSize: 18 }}>{refundTotals[idx].txt}</Text></View>
              <View style={{ marginLeft: 'auto' }}><Text style={{ alignSelf: 'flex-end', fontSize: 18 }}>-${refundTotals[idx].amount.toFixed(2)}</Text></View>
            </View>
          )
        }
        items.splice(0, 0, <Text style={styles.amountReturnedText}>Total Returned: -${total.toFixed(2)}</Text>)
        completedTenderingPanel = (
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            {items}
          </View>
        )
      }
    } else {
      completedTenderingPanel = (
        <ChangePanel
          cashTendered={transactionData?.total?.changeDue + transactionData?.total?.grandTotal}
          changeDue={transactionData?.total?.changeDue}
          tenderType={uiData.tenderType}
          isCashRefund={isCashRefund}
        />
      )
    }
  }

  return (
    <View style={styles.container} testID={'payment-panel'}>
      {(uiData.loadingStates.authorizeReturn || uiData.loadingStates.getRefundMethods || (uiData.loadingStates.newTender && !isRefundingOver500OnGiftCards)) && !(uiData.activePanel === 'changePanel') && <ActivityIndicator style={{ marginTop: 20 }} size={'large'} />}
      {!(uiData.loadingStates.authorizeReturn || uiData.loadingStates.getRefundMethods || (uiData.loadingStates.newTender && !isRefundingOver500OnGiftCards)) && !(uiData.activePanel === 'changePanel') && tenderDisplay}
      {completedTenderingPanel}
      {uiData.activePanel === 'creditPanel' && (
        <CreditPanel
          creditPanelError={uiData.creditPanelError}
          creditPanelErrorInstructions={uiData.creditPanelErrorInstructions}
          transactionData={transactionData}
          getCardDataEvent={uiData.getCardDataEvent}
          isGiftCard={giftCardSelected}
          processingTempPass={uiData.processingTempPass}
          displayInsertCard={uiData.displayInsertCard}
          amount={giftCardAmount}
          manuallyEnterGiftCardEnabled={manuallyEnterGiftCard}
          isStoreCredit={isStoreCredit}
          isRefundingOver500OnGiftCards={isRefundingOver500OnGiftCards}
        />
      )}

      {uiData.activePanel === 'cashPanel' && (
        <CashPanel
          transactionData={transactionData}
          cashError={uiData.cashError}
          calculateChange={calculateChange}
          associateData={associateData}
          printerString={printerString}
          selectedLoyaltyCustomer={selectedLoyaltyCustomer}
          returnData={returnData}
          warrantyData={warrantyData}
          showModal={uiData.showModal}
        />
      )}

      {uiData.activePanel === 'tenderAmountPanel' && (
        <TenderAmountPanel
          transactionData={transactionData}
          cashError={uiData.cashError}
          showModal={uiData.showModal}
          initiateTender={giftCardSelected ? initiateGiftCard : initiateCredit}
          setTenderAmountInput={setTenderAmountInput}
          tenderAmountInput={tenderAmountInput}
        />
      )}
      {featureFlagEnabled('ReferencedRefunds') && paymentsPanelMode === PaymentPanelMode.RefundSelection && (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.refundPartiallyFailedText}>Refund has partially failed to process.  Please select a new tender for refund.</Text>
          <Text style={styles.refundAmountText}>Refund amount: ${currentRefundAmount.toFixed(2)}</Text>
        </View>
      )}
      {uiData.activePanel === 'paymentPanel' && transactionData?.total?.grandTotal !== 0 && (
        <View style={styles.activePaymentPanel}>
          {splitTender && (<Text style={styles.subheadingText}>Select {(transactionData?.tenders?.length > 0) ? 'next' : 'first'} tender</Text>)}
          <View style={[!splitTender ? [styles.rowContainer, { justifyContent: 'space-between' }] : styles.splitTenderRowContainer, styles.paymentButtonRows]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                testID='cash-button'
                disabled={!buttonsEnabled.Cash}
                onPress={() => {
                  console.info('ACTION: components > PaymentPanel > onPress cash-button')
                  setButtonsEnabled({ Cash: false, Credit: false, GiftCard: false })
                  if (featureFlagEnabled('ReferencedRefunds') && paymentsPanelMode === PaymentPanelMode.RefundSelection) {
                    const currentRefund: IRefund | undefined = refundsData.refunds.find(refund => refund.returnCustomerOrderNumber === currentRefundsCustomerOrderNumber)
                    if (!currentRefund) {
                      console.error(`PaymentPanel -> Cash button refund check: NO refund found with CO# [${currentRefundsCustomerOrderNumber}]`)
                      setRefundSelectionErrorMessage('Error refunding to cash.  Please click the BACK arrow and retry again.')
                      return
                    }
                    setCurrentRefundDueType('Cash')
                    dispatch(setAlternateTenderTypeSelected(currentRefundsCustomerOrderNumber, 'cash'))
                    setAlternateRefundTenderTypeSelected(AlternateRefundTenderType.Cash)
                    if (currentRefundsCustomerOrderNumber in alternateRefundData &&
                      alternateRefundData[currentRefundsCustomerOrderNumber]?.managerOverrideResponse !== RefundManagerOverrideResponse.Allowed &&
                      alternateRefundData[currentRefundsCustomerOrderNumber]?.managerOverrideResponse !== RefundManagerOverrideResponse.Processed) {
                      dispatch(receiveUiData({ showModal: 'alternateRefundTender', autofocusTextbox: 'ManagerOverride' }))
                    } else {
                      processAlternateTenderRefund()
                    }
                    return
                  }
                  if (isCashRefund) {
                    calculateChange(
                      transactionData.total.remainingBalance.toString(),
                      transactionData.total.remainingBalance,
                      printerString,
                      associateData,
                      selectedLoyaltyCustomer,
                      returnData,
                      warrantyData
                    )
                  } else {
                    displayCashPanel()
                  }
                }}
                style={[
                  styles.button,
                  _primaryButtonStyle,
                  !buttonsEnabled.Cash && { backgroundColor: '#C8C8C8' }
                ]}
              >
                <View>
                  <Text style={styles.buttonText}>CASH</Text>
                  <DollarSvg color='#fff' height={45} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  console.info('ACTION: components > PaymentPanel > onPress credit-button')
                  if (featureFlagEnabled('ReferencedRefunds') && paymentsPanelMode === PaymentPanelMode.RefundSelection) {
                    const currentRefund: IRefund | undefined = refundsData.refunds.find(refund => refund.returnCustomerOrderNumber === currentRefundsCustomerOrderNumber)
                    if (!currentRefund) {
                      console.error(`PaymentPanel -> Credit button refund check: NO refund found with CO# [${currentRefundsCustomerOrderNumber}]`)
                      setRefundSelectionErrorMessage('Error refunding to credit.  Please click the BACK arrow and retry again.')
                      return
                    }
                    setCurrentRefundDueType('Credit')
                    setAlternateRefundTenderTypeSelected(AlternateRefundTenderType.Credit)
                    dispatch(setAlternateTenderTypeSelected(currentRefundsCustomerOrderNumber, 'credit'))
                    if (currentRefundsCustomerOrderNumber in alternateRefundData &&
                      alternateRefundData[currentRefundsCustomerOrderNumber]?.managerOverrideResponse !== RefundManagerOverrideResponse.Allowed &&
                      alternateRefundData[currentRefundsCustomerOrderNumber]?.managerOverrideResponse !== RefundManagerOverrideResponse.Processed) {
                      dispatch(receiveUiData({ showModal: 'alternateRefundTender', autofocusTextbox: 'ManagerOverride' }))
                    } else {
                      processAlternateTenderRefund()
                    }
                  } else {
                    setGiftCardSelected(false)
                    !splitTender
                      ? initiateCredit(transactionData.total.remainingBalance.toString())
                      : promptForTenderAmount()
                  }
                }}
                disabled={!buttonsEnabled.Credit && (!featureFlagEnabled('ReferencedRefunds') || paymentsPanelMode !== PaymentPanelMode.RefundSelection)}
                testID='credit-button'
                style={[styles.button, _primaryButtonStyle, { marginHorizontal: 62 }, (!buttonsEnabled.Credit && (!featureFlagEnabled('ReferencedRefunds') || paymentsPanelMode !== PaymentPanelMode.RefundSelection)) && { backgroundColor: '#C8C8C8' }]}
              >
                <View style={{
                  marginTop: -10
                }}>
                  <Text style={styles.buttonText}>CREDIT / DEBIT</Text>
                  <Text style={styles.buttonText}>PREPAID CARD</Text>
                  <CreditSvg color='#fff' height={35} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!buttonsEnabled.GiftCard}
                onPress={() => {
                  console.info('ACTION: components > PaymentPanel > onPress gift-card-button')
                  if (featureFlagEnabled('ReferencedRefunds') && paymentsPanelMode === PaymentPanelMode.RefundSelection) {
                    const currentRefund: IRefund | undefined = refundsData.refunds.find(refund => refund.returnCustomerOrderNumber === currentRefundsCustomerOrderNumber)
                    if (!currentRefund) {
                      console.error(`PaymentPanel -> Gift card button refund check: NO refund found with CO# [${currentRefundsCustomerOrderNumber}]`)
                      setRefundSelectionErrorMessage('Error refunding to gift card.  Please click the BACK arrow and retry again.')
                      return
                    }
                    setCurrentRefundDueType('Gift Card')
                    setAlternateRefundTenderTypeSelected(AlternateRefundTenderType.GiftCard)
                    dispatch(setAlternateTenderTypeSelected(currentRefundsCustomerOrderNumber, 'gift card'))
                    if (currentRefundsCustomerOrderNumber in alternateRefundData &&
                      alternateRefundData[currentRefundsCustomerOrderNumber]?.managerOverrideResponse !== RefundManagerOverrideResponse.Allowed &&
                      alternateRefundData[currentRefundsCustomerOrderNumber]?.managerOverrideResponse !== RefundManagerOverrideResponse.Processed) {
                      dispatch(receiveUiData({ showModal: 'alternateRefundTender', autofocusTextbox: 'ManagerOverride' }))
                    } else {
                      processAlternateTenderRefund()
                    }
                  } else {
                    setGiftCardSelected(true)
                    setIsStoreCredit(false)
                    const amount = transactionData.total.remainingBalance
                    if (amount < 0) {
                      dispatch(receiveUiData({ activePanel: 'creditPanel', displayInsertCard: false }))
                    } else {
                      initiateGiftCard(transactionData.total.remainingBalance)
                    }
                  }
                }}
                testID='gift-card-button'
                style={[
                  styles.button,
                  _primaryButtonStyle,
                  !buttonsEnabled.GiftCard && styles.buttonDisabled
                ]}
              >
                <View style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                  <Text style={[styles.buttonText, { marginTop: -18 }]}>GIFT CARD</Text>
                  <View style={{ marginTop: 30, flexDirection: 'row' }}>
                    <DsgLogoSvg/>
                    <View style={{ marginHorizontal: 4 }}>
                      <GolfGalaxyLogoSvg/>
                    </View>
                    <PublicLandsLogoSvg/>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {featureFlagEnabled('ReferencedRefunds') && refundSelectionErrorMessage?.length > 0 && (
            <Text style={{ marginTop: 25, color: '#B80818', fontWeight: 'bold' }}>{refundSelectionErrorMessage}</Text>
          )}
          {(!featureFlagEnabled('ReferencedRefunds') || paymentsPanelMode !== PaymentPanelMode.RefundSelection) && !splitTender && (<View style={[styles.rowContainer, styles.paymentButtonRows, { justifyContent: 'space-between' }]}>
            <TouchableOpacity
              disabled={disableSplitTender}
              onPress={() => {
                console.info('ACTION: components > PaymentPanel > onPress split-tender-button')
                setGiftCardSelected(false)
                setIsStoreCredit(false)
                setSplitTender(true)
                dispatch(receiveUiData({ displayInsertCard: false }))
              }}
              testID='split-tender-button'
              style={[
                styles.button,
                _secondaryButtonStyle,
                disableSplitTender && styles.buttonDisabled
              ]}
            >
              <View>
                <Text style={styles.buttonText}>SPLIT TENDER</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={disableStoreCredit}
              onPress={() => {
                setIsStoreCredit(true)
                setGiftCardSelected(false)
                console.info('ACTION: components > PaymentPanel > onPress store-credit')
                dispatch(receiveUiData({ activePanel: 'creditPanel', displayInsertCard: false }))
              }}
              testID='store-credit-button'
              style={[
                styles.button,
                _secondaryButtonStyle,
                disableStoreCredit && styles.buttonDisabled
              ]}
            >
              <View>
                <Text style={styles.buttonText}>STORE CREDIT</Text>
              </View>
            </TouchableOpacity>
          </View>
          )}

          {(!featureFlagEnabled('ReferencedRefunds') || paymentsPanelMode !== PaymentPanelMode.RefundSelection) && !splitTender && (<View style={[styles.rowContainer, styles.paymentButtonRows, { justifyContent: 'space-between' }]}>
            <TouchableOpacity
              disabled={disableCreditLookup}
              testID='lookup-button'
              onPress={() => {
                setGiftCardSelected(false)
                setIsStoreCredit(false)
                handleModalQueue('q', 'creditEnrollment')
                dispatch(receiveUiData({ scanEvent: null }))
                dispatch(receiveCreditEnrollmentData({
                  creditModalFlow: 'lookup',
                  creditLookupActive: true
                }))
              }}
              style={[
                styles.button,
                disableCreditLookup && styles.buttonDisabled,
                { flex: 1, height: 88 }
              ]}
            >
              <View>
                <Text style={styles.buttonText}>SCOREREWARDS CREDIT CARD LOOKUP<br/>TEMP SHOPPING PASS</Text>
              </View>
            </TouchableOpacity>
          </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  activePaymentPanel: {
    display: 'flex',
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    paddingTop: 40
  },
  buttonSizeLarge: { width: 165, height: 146 },
  buttonSizeSmall: { width: 148, height: 132 },
  rowContainer: {
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 64,
    alignItems: 'center'
  },
  splitTenderRowContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 64,
    alignItems: 'center'
  },
  columnContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 64,
    alignItems: 'center'
  },
  totalDue: {
    maxWidth: 397,
    minWidth: 397,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 32,
    paddingTop: 10,
    paddingBottom: 10
  },
  dues: {
    maxWidth: 397,
    minWidth: 397,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 14,
    paddingTop: 6,
    paddingBottom: 6
  },
  bordered: {
    borderColor: '#191F1C',
    borderStyle: 'solid',
    borderWidth: 2
  },
  paymentButtonRows: {
    flex: 0,
    paddingHorizontal: 0,
    marginBottom: 16
  },
  chevron: {
    width: 64,
    height: 64
  },
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  red: {
    borderColor: '#8d0d02',
    color: '#8d0d02',
    paddingRight: 24,
    paddingLeft: 24
  },
  button: {
    width: 213,
    height: 45,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 19,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#f9f9f9',
    textAlign: 'center'
  },
  buttonSecondary: {
    width: 275,
    height: 88
  },
  buttonSecondarySmall: {
    width: 148,
    height: 68
  },
  buttonDisabled: {
    backgroundColor: '#BABCBB',
    ...Platform.select({
      web: {
        cursor: 'not-allowed'
      }
    })
  },
  subheadingText: {
    alignSelf: 'center',
    fontSize: 16,
    marginBottom: 32,
    paddingTop: 20,
    paddingBottom: 20
  },
  refundPartiallyFailedText: {
    padding: 20,
    fontSize: 16,
    color: '#B80818'
  },
  refundAmountText: {
    padding: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B80818',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#B80818'
  },
  amountReturnedText: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 37,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingTop: 135
  },
  refundTotalTenderedView: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    borderTopColor: '#777777',
    marginTop: 15,
    paddingTop: 15
  }
})

PaymentPanel.propTypes = {
  transactionData: PropTypes.object,
  uiData: PropTypes.object,
  displayCashPanel: PropTypes.func,
  displayCreditPanel: PropTypes.func,
  calculateChange: PropTypes.func,
  createNewCreditTender: PropTypes.func,
  printerString: PropTypes.object,
  associateData: PropTypes.object,
  selectedLoyaltyCustomer: PropTypes.object
}

export default PaymentPanel
