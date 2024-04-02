import { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { MenuProvider } from 'react-native-popup-menu'
import { useIdleTimer } from 'react-idle-timer'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { clearAssociateData, RECEIVE_ASSOCIATE_DATA, receiveAssociateData } from '../actions/associateActions'
import { fetchStoreInfo, fetchStoreInfoFromLauncher } from '../actions/storeActions'
import * as UiActions from '../actions/uiActions'
import { closeRegister, receiveRegisterData, RECEIVE_REGISTER_DATA } from '../actions/registerActions'
import * as CefSharp from '../utils/cefSharp'
import * as Storage from '../utils/asyncStorage'
import { initRumRunner } from '../utils/rumrunner'
import { initAppInsights } from '../utils/appInsights'
import AgeRestriction from '../components/modals/AgeRestriction'
import StopTransactionModal from '../components/modals/StopTransactionModal'
import SportsMatterModal from '../components/modals/SportsMatterModal'
import SportsMatterCampaignModal from '../components/modals/sportsMatter/SportsMatterCampaignModal'
import App from '../App'
import Login from '../views/login'
import Footer from '../components/footer/Footer'
import CashDrawerOpen from '../components/modals/CashDrawerOpen'
import FooterMenuOverlay from '../components/footer/FooterMenuOverlay'
import Recall from '../components/modals/Recall'
import ErrorModal from '../components/modals/ErrorModal'
import HealthCheckModal from '../components/modals/healthCheck/HealthCheckModal'
import Launch from '../components/modals/Launch'
import ManualTransactionDiscount from '../components/modals/discounts/ManualTransactionDiscount'
import RetryFailedOperationModal from '../components/modals/RetryFailedOperationModal'
import FeedbackModal from '../components/modals/FeedbackModal'
import { clearPrintReceiptData, receivePrintReceiptData } from '../actions/printReceiptActions'
import {
  autoVoidTransaction,
  clearTransactionData,
  getLastTransactionDetails,
  removeRewardAction,
  scanGiftCard
} from '../actions/transactionActions'
import ReturnsModal from '../components/modals/returns/ReturnsModal'
import { clearReturnData } from '../actions/returnActions'
import CreditEnrollmentModal from '../components/modals/CreditEnrollmentModal'
import { getEnvironment } from '../utils/coordinatorAPI'
import PostVoidModal from '../components/modals/PostVoidModal'
import ReturnsAuthorizationModal from '../components/modals/returns/ReturnsAuthorization'
import { AppDispatch } from '../Main'
import GiftCardBalanceInquiryModal from '../components/modals/GiftCardBalanceInquiryModal'
import SellGiftCardModal from '../components/modals/SellGiftCardModal'
import ReusableAlertWithTwoOptionsModal from '../components/modals/ReusableAlertWithTwoOptionsModal'
import { clearCustomer, clearInvalidReward, receiveLoyaltyData } from '../actions/loyaltyActions'
import ConnectPinpad from '../components/modals/ConnectPinpadModal'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { fetchFeaturesAndConfiguration } from '../actions/configurationActions'
import { checkForLoading, receiveUiData } from '../actions/uiActions'
import { clearWarrantyData } from '../actions/warrantyActions'
import Queue from '../utils/queue'
import { autoReload } from '../utils/autoReload'
import ManagerOverrideModal from '../components/modals/ManagerOverride'
import StressPinpadModal from '../components/modals/StressPinpadModal'
import { performHealthExam, showCriticalStatusIndicator } from '../utils/healthChecks'
import { clearManagerOverrideInfo } from '../actions/managerOverrideActions'
import TaxExemptSaleModal from '../components/modals/TaxExemptSaleModal'
import CreateGiftCardModal from '../components/modals/CreateGiftCard/CreateGiftCardModal'
import CouponOverride from '../components/modals/discounts/CouponOverride'
import ManualItemDiscount from '../components/modals/discounts/ManualItemDiscount'
import GettingStartedModal from '../components/modals/gettingStarted/GettingStartedModal'
import { clearRefundsData } from '../actions/refundsActions'
import ReferencedRefundsModal from '../components/modals/ReferencedRefundModal'
import AlternateRefundTenderModal from '../components/modals/AlternateRefundTenderModal'
import { clearRefundManagerOverrides } from '../actions/alternateRefundActions'
import { GIFTCARD, deleteItemStorageLatch, loyaltyAccountStorageLatch } from '../utils/reusableStrings'

const isWeb = Platform.OS === 'web'
let isCefSharp = false

if (isWeb) {
  isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')
}

const getTimestamp = () => {
  const date = new Date()
  return date.getTime()
}

const Routes = () => {
  const environment = getEnvironment()
  const isNotLocalEnv = !environment.includes('#')

  const dispatch = useDispatch<AppDispatch>()
  const {
    associateData,
    theme,
    registerData,
    storeInfo,
    uiData,
    transactionData,
    loyaltyData,
    featureFlags,
    configuration,
    printReceiptData,
    returnData,
    creditModalFlow,
    configurationData,
    healthCheckData
  } = useSelector(state => ({
    associateData: state.associateData,
    theme: state.theme,
    registerData: state.registerData,
    storeInfo: state.storeInfo,
    uiData: state.uiData,
    transactionData: state.transactionData,
    loyaltyData: state.loyaltyData,
    featureFlags: state.featureFlagData?.features,
    configuration: state.configurationData?.settings,
    printReceiptData: state.printReceiptData,
    returnData: state.returnData,
    creditModalFlow: state.creditEnrollmentData.creditModalFlow,
    configurationData: state.configurationData,
    healthCheckData: state.healthCheckData
  }))

  useEffect(() => {
    // Auto-logout
    if (environment !== "'#{ENVIRONMENT}#'") {
      const timestamp = getTimestamp()
      ;(async () => {
        const activityTimestamp = parseInt(
          await Storage.getData('activityTimestamp'),
          10
        )
        if (timestamp - activityTimestamp > 300000) {
          dispatch(clearAssociateData(associateData.associateId))
        }
      })()
    }

    // Enable register peripherals
    document.addEventListener('contextmenu', event =>
      event.preventDefault()
    )
    CefSharp.bindToApplication()
      .then(() => {
        CefSharp.getApplicationVersionNumber()
          .then(async x => {
            await Storage.storeData('applicationVersionNumber', x)
          })
          .catch(e => console.info('Error getting application version number: ', JSON.stringify(e)))
      })
    CefSharp.bindToRegisterInformation()
    CefSharp.bindToStoreInformation()
      .then(() => getInitialData())
      .then(() => CefSharp.bindToPrinter()
        .then(() => checkIfCashDrawerOpen()))
      .catch(e => console.info('Error - CefSharp binding: ', JSON.stringify(e)))
    CefSharp.bindToFipay()
    CefSharp.bindToTransactionMonitor()
    CefSharp.bindToPP()
    CefSharp.bindToBarcodeScanner()
    CefSharp.bindToHealthCheck()
      .then(() => {
        dispatch(performHealthExam())
      })
  }, [])

  useEffect(() => {
    if (healthCheckData &&
        healthCheckData.BackendConnectivityHealthInfo) {
      const showHelpWarningIndicator = showCriticalStatusIndicator(healthCheckData)
      dispatch(receiveUiData({ helpButtonWarningIndicator: showHelpWarningIndicator }))
    }
  }, [healthCheckData])

  useEffect(() => {
    if (
      storeInfo &&
      storeInfo.number &&
      registerData &&
      registerData.registerNumber
    ) {
      dispatch(
        fetchFeaturesAndConfiguration(
          storeInfo.chainNumber,
          storeInfo.number,
          registerData.registerNumber,
          -1
        )
      )
    }
  }, [registerData?.registerNumber])

  useEffect(() => {
    if (featureFlags && featureFlags.length > 0) {
      initRumRunner(featureFlags.includes('RumRunner'))
      initAppInsights(featureFlags.includes('AppInsights'))
    }
  }, [featureFlags])

  // Routing
  useEffect(() => {
    const activePanel = uiData.activePanel
    let changeActivePanel = activePanel
    let clearTransaction = false
    if (associateData.authenticated === true && !registerData.registerClosed) {
      if (
        featureFlagEnabled('IncrementedGiftCardRefunds') &&
        transactionData?.total?.grandTotal < -500 &&
        transactionData?.tenders?.some(tender => tender.cardType === GIFTCARD)
      ) {
        changeActivePanel = 'creditPanel'
      } else if (transactionData?.tenders?.length > 0 && transactionData.total?.remainingBalance > 0) {
        if (activePanel === 'scanDetailsPanel' || activePanel === 'initialScanPanel') {
          changeActivePanel = 'paymentPanel'
        }
      } else if (
        transactionData?.header?.transactionStatusDescription === 'Complete' || transactionData?.header?.transactionStatusDescription === 'DemoComplete'
      ) {
        changeActivePanel = 'changePanel'
      } else if (
        activePanel !== 'paymentPanel' && activePanel !== 'creditPanel' && activePanel !== 'warrantyPanel' && activePanel !== 'cashPanel' && activePanel !== 'changePanel' && creditModalFlow === 'none' &&
        ((transactionData?.items?.length > 0 && transactionData.total.remainingBalance > 0) ||
          (loyaltyData.loyaltyCustomers || loyaltyData.selectedLoyaltyCustomer) ||
          (transactionData?.originalSaleInformation) || (transactionData?.coupons?.length > 0) || (transactionData?.header?.associateDiscountDetails))
      ) {
        changeActivePanel = 'scanDetailsPanel'
      } else if (shouldReturnToInitialScanPanel()) {
        if (transactionData.header?.transactionStatus === 3 || transactionData.header?.transactionStatus === 7) {
          clearTransaction = true
        }
        changeActivePanel = 'initialScanPanel'
      }
    } else {
      changeActivePanel = 'loginPanel'
    }
    if (activePanel !== changeActivePanel) {
      if (clearTransaction) {
        dispatch(clearTransactionData())
      }
      dispatch(
        UiActions.receiveUiData({
          activePanel: changeActivePanel
        })
      )
    }
  }, [transactionData, loyaltyData, associateData.associateId, registerData, uiData.selectedItem])

  const shouldReturnToInitialScanPanel = (): boolean => {
    if (uiData.activePanel === 'scanDetailsPanel' && uiData.selectedItem === 'loyaltyPinpadPhoneLookup') {
      return false
    } else if (!associateData.authenticated) {
      return false
    } else if (transactionData.header?.transactionStatus === 1 || transactionData.header?.transactionStatus === 6) {
      return false
    } else if (loyaltyData.invalidReward && Object.keys(loyaltyData.invalidReward).length !== 0) {
      return false
    } else if (uiData.activePanel === 'scanDetailsPanel' && uiData.selectedItem === 'rewardPanel') {
      return false
    }

    return true
  }

  useEffect(() => {
    dispatch(receivePrintReceiptData({
      reprintReceiptAvailable: !!(printReceiptData.serializedAdditionalInfo &&
        printReceiptData.serializedAssociateData &&
        printReceiptData.serializedStoreInfo &&
        printReceiptData.serializedTransaction)
    }))
  }, [printReceiptData.serializedAdditionalInfo,
    printReceiptData.serializedAssociateData,
    printReceiptData.serializedStoreInfo,
    printReceiptData.serializedTransaction])

  useEffect(() => {
    // Contents of this if statement will fire on login (beginning of every transaction)
    if (Object.keys(transactionData).length === 0 && associateData.authenticated) {
      dispatch(getLastTransactionDetails())
      dispatch(
        fetchFeaturesAndConfiguration(
          storeInfo.chainNumber,
          storeInfo.number,
          registerData.registerNumber,
          -1
        )
      )
      process.env.NODE_ENV !== 'development' && autoReload()
      Storage.removeItems([deleteItemStorageLatch])
      Storage.removeItems([loyaltyAccountStorageLatch])
    }
    if (!transactionData.header) {
      dispatch(UiActions.receiveUiData({ giftCardTenderResponse: null }))
    }
  }, [transactionData, associateData.authenticated])

  const [omniSearchInput, setOmniSearchInput] = useState('')
  const [tenderAmountInput, setTenderAmountInput] = useState<string>('0.00')
  useEffect(() => {
    // Contents of this if statement fire on all transactions except the first one
    if (Object.keys(transactionData).length === 0 && Object.keys(registerData).length > 0) {
      // Values to be cleared for subsequent transactions
      setTenderAmountInput('0.00')
      setOmniSearchInput('')
      dispatch(UiActions.receiveUiData({
        getCardDataEvent: null,
        selectedItem: null,
        scanEvent: null,
        displayInsertCard: false,
        customerRespondedToSportsMatter: false,
        error: false,
        cashError: false,
        creditPanelError: null,
        errorMessage: null,
        giftCardAccountNumber: null,
        giftCardError: null,
        showNewTransactionButton: false,
        couponToDisplayIndex: 0,
        modalClosedByUser: false,
        pinpadPhoneEntryEnabled: false,
        callRefundMethodsAfterReturnsAuth: false,
        suspendMessage: null
      }))
      dispatch(clearManagerOverrideInfo())
      dispatch(clearPrintReceiptData())
      dispatch(clearReturnData())
      dispatch(clearWarrantyData())
      dispatch(clearInvalidReward())
      dispatch(clearCustomer())
      if (featureFlagEnabled('ReferencedRefunds')) {
        dispatch(clearRefundsData())
        dispatch(clearRefundManagerOverrides())
      }
      CefSharp.showPPScreenSaver()
      Queue.clearQueue()
      Storage.removeItems(['age'])
      dispatch(receiveAssociateData({
        sapAssociateDictionary: {},
        itemLevelSapAssociate: null
      }, RECEIVE_ASSOCIATE_DATA))
      checkIfCashDrawerOpen()
        .catch(e => console.info('Error checkIfCashDrawerOpen: ', e))
    }
  }, [transactionData])

  useEffect(() => {
    if (associateData.authenticated === true && uiData.footerOverlayActive !== 'None') {
      dispatch(UiActions.receiveUiData({ footerOverlayActive: 'None' }))
    }
  }, [associateData.authenticated])

  useEffect(() => {
    if (
      uiData.giftCardAccountNumber &&
      registerData.isAdyen &&
      featureFlagEnabled('ScanGiftCard') &&
      (uiData.activePanel === 'initialScanPanel' || uiData.activePanel === 'scanDetailsPanel') &&
      (!uiData.showModal || uiData.showModal === 'sellGiftCard') &&
      (uiData.footerOverlayActive === 'None' || uiData.footerOverlayActive === 'GiftCard') &&
      (!checkForLoading(uiData.loadingStates) && uiData.autofocusTextbox !== 'PriceEdit')
    ) {
      dispatch(scanGiftCard(uiData.giftCardAccountNumber))
    }
  }, [uiData.giftCardAccountNumber])

  const checkIfCashDrawerOpen = async () => {
    const cashDrawerIsOpen = await CefSharp.isCashDrawerOpen()
    if (cashDrawerIsOpen) {
      dispatch(
        UiActions.receiveUiData({
          showModal: 'cashDrawerOpen'
        })
      )
      await CefSharp.waitForCashDrawerToClose()
        .then(() => {
          dispatch({ type: 'UPDATE_UI_DATA', data: { showModal: false } })
        })
        .catch(e => console.info('Error waiting for cashdrawer to close: ', e))
    }
  }

  /**
   * If running on a register, get data from launcher, else get from coordinator
   */
  // TODO: Combine these two functions and add the check for isCefSharp inside the new function
  const getInitialData = async (): Promise<void> => {
    if (isCefSharp) {
      dispatch(fetchStoreInfoFromLauncher())
    } else {
      dispatch(fetchStoreInfo())
    }
  }
  const [giftReceiptPanelSelected, setGiftReceiptPanelSelected] = useState(false)
  const [reprintGiftReceiptPanelSelected, setReprintGiftReceiptPanelSelected] = useState(false)

  useEffect(() => {
    if (uiData.showModal) {
      dispatch(UiActions.receiveUiData({
        autofocusTextbox: 'Modal'
      }))
    }
  }, [uiData.showModal])

  useEffect(() => {
    // actions within this if statement will fire after the first scan that starts a transaction
    if (associateData.authenticated && transactionData.header?.transactionStatus === 1 && featureFlags && configuration) {
      CefSharp.beginTransaction(JSON.stringify(featureFlags), JSON.stringify(configuration), transactionData.header.transactionNumber)
    }
  }, [associateData?.authenticated, transactionData.header?.transactionStatus, featureFlags, configuration])

  useEffect(() => {
    CefSharp.getPinpadType()
      .then(async x => {
        dispatch(receiveRegisterData({ isAdyen: x === 'Adyen', isSimulator: x === 'Simulator' }, RECEIVE_REGISTER_DATA))
      })
      .catch(e => console.info('Error getting pinpad type: ', JSON.stringify(e)))
  }, [associateData])

  const useSportsMatterCampaignModal = featureFlags?.includes('UseSportsMatterCampaignModal')

  const { reset: noTransactionIdleTimerReset } = useIdleTimer({
    onIdle: () => {
      if (
        isNotLocalEnv &&
        transactionData &&
        Object.keys(transactionData).length === 0 &&
        uiData.activePanel === 'initialScanPanel' &&
        !checkForLoading(uiData.loadingStates) &&
        uiData.showModal !== 'stressPinpadModal'
      ) {
        console.info('ACTION: routes > Routes > noTransactionIdle > onIdle')
        CefSharp.endTransaction(JSON.stringify(featureFlags), JSON.stringify(configuration))
        dispatch(clearAssociateData(associateData?.associateId))
        dispatch(receiveUiData({
          showModal: false,
          footerOverlayActive: 'None'
        }))
      }
    },
    onAction: () => {
      if (isNotLocalEnv) {
        Storage.storeData('activityTimestamp', String(getTimestamp()))
      }
    },
    timeout: 300000, // 5 min
    debounce: 250
  })

  const { reset: activeTransactionIdleTimerReset } = useIdleTimer({
    onIdle: () => {
      if (isNotLocalEnv && associateData.authenticated) {
        console.info('ACTION: routes > Routes > transactionIdle > onIdle')

        dispatch(autoVoidTransaction(returnData, uiData.loadingStates.void))
        dispatch(receiveUiData({
          showModal: false,
          footerOverlayActive: 'None'
        }))
      }
    },
    onAction: () => {
      if (isNotLocalEnv) {
        Storage.storeData('activityTimestamp', String(getTimestamp()))
      }
    },
    timeout: 900000, // 15 min
    debounce: 250
  })

  useEffect(() => {
    if (uiData.scanEvent?.scanTime) {
      noTransactionIdleTimerReset()
      activeTransactionIdleTimerReset()
    }
  }, [uiData.scanEvent?.scanTime])

  return (
    <MenuProvider>
      <View
        style={[
          styles.appContainer,
          { backgroundColor: theme.backgroundColor }
        ]}
      >
        {associateData.authenticated === true &&
        !registerData.registerClosed
          ? (
            <>
              <App
                omniSearchInput={omniSearchInput}
                setOmniSearchInput={setOmniSearchInput}
                tenderAmountInput={tenderAmountInput}
                setTenderAmountInput={setTenderAmountInput}
              />
            </>
          )
          : (
            <Login theme={theme}/>
          )}

        {uiData.footerOverlayActive !== 'None' &&
          <FooterMenuOverlay
            giftReceiptPanelSelected={giftReceiptPanelSelected}
            setGiftReceiptPanelSelected={setGiftReceiptPanelSelected}
            footerOverlayActive={uiData.footerOverlayActive}
            registerData={registerData}
            transactionData={transactionData}
            activePanel={uiData.activePanel}
            authenticated={associateData.authenticated}
            reprintGiftReceiptPanelSelected={reprintGiftReceiptPanelSelected}
            setReprintGiftReceiptPanelSelected={setReprintGiftReceiptPanelSelected}
            loyaltyAltScreenName={loyaltyData.altScreenName}
          />
        }
        <Footer
          giftReceiptPanelSelected={giftReceiptPanelSelected}
          setGiftReceiptPanelSelected={setGiftReceiptPanelSelected}
          authenticated={associateData.authenticated}
          clearAssociateData={() =>
            dispatch(clearAssociateData(associateData.associateId))
          }
          associateData={associateData}
          registerData={registerData}
          transactionData={transactionData}
          footerOverlayActive={uiData.footerOverlayActive}
          featureFlags={featureFlags}
          reprintGiftReceiptPanelSelected={reprintGiftReceiptPanelSelected}
          setReprintGiftReceiptPanelSelected={setReprintGiftReceiptPanelSelected}
        />
        <ReusableAlertWithTwoOptionsModal
          firstSubHeading='Are you sure you want to close out this register?'
          leftButtonText='NO, GO BACK'
          rightButtonText='CONTINUE'
          leftButtonTestID='cancel-close-register'
          rightButtonTestID='confirm-close-register'
          headingText='CLOSE REGISTER'
          onClickLeftButton={() => {
            console.info('ACTION: components > ConfirmCloseRegisterModal > onPress CANCEL CLOSE REGISTER')
            dispatch(UiActions.receiveUiData({ showModal: false }))
          }}
          onClickRightButton={() => {
            console.info('ACTION: components > ConfirmCloseRegisterModal > onPress CONFIRM CLOSE REGISTER')
            dispatch(closeRegister(associateData.associateId))
          }}
          modalName='confirmCloseRegister'
          error={false}
          errorMessage='Sorry, something went wrong. Please try again.'
          rightButtonLoading={uiData.loadingStates.closeRegister}
        />
        <StopTransactionModal
          transactionData={transactionData}
          associateFirstName={associateData.firstName}
          returnData={returnData}
          activePanel={uiData.activePanel}
          uiData={uiData}
          modalName={'void'}
          storeNumber={storeInfo.number}
          configurationData={configurationData}
        />
        <StopTransactionModal
          transactionData={transactionData}
          associateFirstName={associateData.firstName}
          returnData={returnData}
          activePanel={uiData.activePanel}
          uiData={uiData}
          modalName={'suspend'}
          storeNumber={storeInfo.number}
          configurationData={configurationData}
        />
        <AgeRestriction
          storeNumber={storeInfo.number}
          registerNumber={registerData.registerNumber}
          associateId={associateData.associateId}
          itemLevelSapAssociate={associateData.itemLevelSapAssociate}
          uiData={uiData}
          transactionData={transactionData}
        />
        <CouponOverride/>
        <ManualTransactionDiscount/>
        <ManualItemDiscount/>
        <CashDrawerOpen/>
        <ConnectPinpad/>
        <Recall/>
        <ErrorModal
          uiData={uiData}
        />
        <RetryFailedOperationModal
          showModal={uiData.showModal}
        />
        <HealthCheckModal/>
        <ManagerOverrideModal theme={theme}/>
        <Launch/>
        <FeedbackModal associateFirstName={associateData.firstName}/>
        <PostVoidModal/>
        <ReturnsModal uiData={uiData} transactionData={transactionData} returnData={returnData}/>
        <TaxExemptSaleModal uiData={uiData}/>
        <CreditEnrollmentModal uiData={uiData} transactionData={transactionData} tenderAmountInput={tenderAmountInput}/>
        <ReturnsAuthorizationModal
          transactionData={transactionData}
          uiData={uiData}
          returnData={returnData}
        />
        <GiftCardBalanceInquiryModal uiData={uiData} transactionData={transactionData} storeInfo={storeInfo} associateData={associateData}/>
        <CreateGiftCardModal theme={theme} uiData={uiData} associateData={associateData} storeInfo={storeInfo} transactionData={transactionData}/>
        <SellGiftCardModal uiData={uiData}/>
        <ReusableAlertWithTwoOptionsModal
          firstSubHeading='Reward is greater than the purchase total.'
          secondSubHeading='Customer will forfeit the remainder of their reward if you continue with this transaction.'
          leftButtonText='CANCEL'
          rightButtonText='CONTINUE'
          leftButtonTestID='cancel-reward'
          rightButtonTestID='keep-reward'
          headingText='REWARDS APPLIED'
          onClickLeftButton={() => {
            dispatch(removeRewardAction(loyaltyData.lastAppliedReward))
          }}
          onClickRightButton={() => {
            dispatch(UiActions.receiveUiData({ showModal: false }))
          }}
          modalName='rewardAmountExceedsDiscountedAmount'
          error={loyaltyData.removeRewardError}
          errorMessage='Sorry, something went wrong. Please try cancelling again.'
          onDismiss={() => dispatch(receiveLoyaltyData({ lastAppliedReward: null, removeRewardError: false }))}
          leftButtonLoading={uiData.loadingStates.removeReward}
        />
        {!useSportsMatterCampaignModal &&
        <SportsMatterModal
          configurationData={configurationData}
          associateId={associateData.associateId}
          grandTotal={transactionData?.total?.grandTotal}
        ></SportsMatterModal>}
        {useSportsMatterCampaignModal && <SportsMatterCampaignModal />}
        <StressPinpadModal/>
        <GettingStartedModal/>
        <ReferencedRefundsModal/>
        <AlternateRefundTenderModal theme={theme} />
      </View>
    </MenuProvider>
  )
}

export default Routes

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    display: 'flex',
    paddingHorizontal: 32,
    minHeight: isWeb ? '100vh' : '100%'
  },
  boldText: {
    fontWeight: '700',
    fontSize: 20
  },
  plainText: {
    fontWeight: '400'
  }
})
