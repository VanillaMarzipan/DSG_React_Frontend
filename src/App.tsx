/* eslint-disable no-mixed-operators */
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import Header from './components/Header'
import ScanPanel from './components/ScanPanel'
import PaymentPanel from './components/PaymentPanel'
import TransactionsCard from './components/TransactionsCard'
import DetailsPanelController from './components/DetailsPanelController'
import { connect, useDispatch } from 'react-redux'
import { addTaxExemptInformation, calculateChange, createNewCreditTender, omniSearch } from './actions/transactionActions'
import { displayCashPanel, back, displayCreditPanel, promptForTenderAmount, receiveUiData, checkForLoading } from './actions/uiActions'
import { ThemeTypes } from './reducers/theme'
import BackButton from './components/BackButton'
import { UiDataTypes } from './reducers/uiData'
import { TransactionDataTypes } from './reducers/transactionData'
import { AssociateDataTypes } from './reducers/associateData'
import { RegisterDataTypes } from './reducers/registerData'
import { LoyaltyDataTypes } from './reducers/loyaltyData'
import { PrinterStringData } from './reducers/printerString'
import { useTypedSelector as useSelector } from './reducers/reducer'
import { sendRumRunnerEvent } from './utils/rumrunner'
import { fetchLoyaltyByAccountNumber } from './actions/loyaltyActions'
import * as CefSharp from './utils/cefSharp'
import { ReturnDataType } from './reducers/returnData'
import { authorizeReturn, fetchLowestReturnPrice } from './actions/returnActions'
import { addItemLevelSapUpc, getAssociateByIdForItemLevelSap } from './actions/associateActions'
import { fetchLowestPriceAndName, fetchProductLookupDetails } from './actions/productLookupActions'
import { CurrentPage, ProductLookupDataType } from './reducers/productLookupData'
import { getConfigurationValue } from './actions/configurationActions'
import LookupLoyaltyByPinpadSvg from './components/svg/LookupLoyaltyByPinpadSvg'
import { featureFlagEnabled } from './reducers/featureFlagData'
import { GIFTCARD } from './utils/reusableStrings'

interface AppProps {
  associateData: AssociateDataTypes
  theme: ThemeTypes
  registerData: RegisterDataTypes
  uiData: UiDataTypes
  transactionData: TransactionDataTypes
  displayCashPanel: () => void
  displayCreditPanel: () => void
  promptForTenderAmount: () => void
  back: () => void
  printerString: PrinterStringData
  calculateChange: () => void
  createNewCreditTender: (PrinterStringData, AssociateDataTypes, Customer, ReturnDataType, any, WarrantyDataTypes, string, refRefundCoString?, refRefundTenderNumber?) => void
  loyaltyData: LoyaltyDataTypes
  returnData: ReturnDataType
  productLookupData: ProductLookupDataType
  omniSearchInput: string
  setOmniSearchInput: (input: string) => void
  tenderAmountInput: string
  setTenderAmountInput: (amount: string) => void
}

const App = ({
  theme,
  associateData,
  registerData,
  uiData,
  transactionData,
  displayCashPanel,
  displayCreditPanel,
  promptForTenderAmount,
  back,
  printerString,
  calculateChange,
  createNewCreditTender,
  loyaltyData,
  returnData,
  productLookupData,
  omniSearchInput,
  setOmniSearchInput,
  tenderAmountInput,
  setTenderAmountInput
}: AppProps): JSX.Element => {
  const dispatch = useDispatch()
  const featureFlagData = useSelector(state => state.featureFlagData)
  const warrantyData = useSelector(state => state.warrantyData)
  const selectedLoyaltyCustomer = useSelector(state => state.loyaltyData.selectedLoyaltyCustomer)
  const [giftCardSelected, setGiftCardSelected] = useState<boolean>(false)
  const [isStoreCredit, setIsStoreCredit] = useState<boolean>(false)
  const transactionCardShowing: boolean = uiData.activePanel !== 'initialScanPanel'
  const isCefSharp = Object.prototype.hasOwnProperty.call(window, 'cefSharp')

  const [splitTender, setSplitTender] = useState<boolean>(false)
  const fetchItem = (input: string) => (dispatch): void => {
    console.info('ENTER: components > ScanPanel > fetchItem', { input: input })
    const page = uiData.activePanel === 'scanDetailsPanel' ? 'Transaction screen' : 'Initial scan screen'
    if (input) {
      if (input.length === 10) {
        sendRumRunnerEvent('Scorecard Lookup', {
          type: 'phone entry',
          input: input,
          page: page
        })
      } else if (input.trim().charAt(0).toLowerCase() === 'l') {
        sendRumRunnerEvent('Scorecard Lookup', {
          type: 'scan',
          input: input,
          page: page
        })
      }
    }
    if (!uiData.showAddAssociateDiscount) {
      setOmniSearchInput(input)
    }
    dispatch(omniSearch(
      input,
      associateData.associateId,
      'manual',
      null,
      null,
      uiData.activePanel,
      transactionData?.header?.transactionTypeDescription
    ))
  }

  useEffect(() => {
    if (transactionData?.header?.tenderIdentifier && uiData.giftCardTenderResponse) {
      console.info('uiData.giftCardTenderResponse', uiData.giftCardTenderResponse)
      try {
        createNewCreditTender(
          printerString,
          associateData,
          selectedLoyaltyCustomer,
          returnData,
          uiData.giftCardTenderResponse,
          warrantyData,
          transactionData.header.tenderIdentifier
        )
      } catch (error) {
        console.error('App.tx > useEffect uiData.giftCardTenderResponse\n' + JSON.stringify(error))
      }
    }
  }, [uiData.giftCardTenderResponse])

  useEffect(() => {
    // If scanned with barcode scanner
    if (uiData.scanEvent?.scanTime) {
      if (uiData.showModal === 'void') {
        return
      }
      if (uiData.productLookupPanelSelected && (productLookupData.currentPage === CurrentPage.Landing || productLookupData.currentPage === CurrentPage.SearchResults)) {
        dispatch(fetchProductLookupDetails(uiData.scanEvent.scanValue))
        sendRumRunnerEvent('Product Lookup Scan', {
          authenticated: true
        })
      } else if (uiData.lowestPriceInquiryPanelSelected) {
        dispatch(fetchLowestPriceAndName(uiData.scanEvent.scanValue))
      } else if (uiData.showModal === 'returnsAuthorization' && transactionData.originalSaleInformation[0] && transactionData.originalSaleInformation[0].returnOriginationType === 1) {
        dispatch(authorizeReturn(
          transactionData?.total?.grandTotal === 0,
          uiData.showModal,
          {
            idType: 1, // we only accept state or driver's license, so this is hard-coded
            barcode: uiData.scanEvent.scanValue
          }
        ))
      } else if (uiData.showModal === 'returns' && returnData.nonReceiptedReturnActive && !uiData.loadingStates.fetchLowestReturnPrice && !uiData.loadingStates.addNonReceiptedReturnItems) {
        dispatch(fetchLowestReturnPrice(uiData.scanEvent.scanValue, returnData.nonReceiptedReturnItems))
      } else if (uiData.footerOverlayActive === 'Teammate' && uiData.showItemLevelSap) {
        if (associateData.itemLevelSapStep === 1) {
          dispatch(getAssociateByIdForItemLevelSap(uiData.scanEvent.scanValue))
        } else {
          dispatch(addItemLevelSapUpc(associateData.itemLevelSapUpcs, uiData.scanEvent.scanValue))
        }
      } else if (uiData.showModal === 'taxExemptSale') {
        dispatch(addTaxExemptInformation(uiData.scanEvent.scanValue))
      } else if (uiData.footerOverlayActive === 'None' &&
        !uiData.loadingStates.closeRegister &&
        uiData.selectedItem !== 'SCORECARD_TEXTBOX' &&
        (uiData.showModal !== 'returns' && uiData.showModal !== 'confirmCloseRegister' && uiData.showModal !== 'cashDrawerOpen') &&
        (uiData.activePanel === 'scanDetailsPanel' || uiData.activePanel === 'initialScanPanel') ||
        (uiData.showAddAssociateDiscount && !getConfigurationValue('familynight', 'familyNight') && uiData.scanEvent.scanValue.length <= 10)) { // Omnisearch
        dispatch(fetchItem(uiData.scanEvent.scanValue))
      } else if ( // Numeric Scorecard
        uiData?.selectedItem === 'SCORECARD_TEXTBOX' && uiData.activePanel === 'scanDetailsPanel'
      ) {
        if (uiData.footerOverlayActive !== 'None') dispatch(receiveUiData({ footerOverlayActive: 'None' }))
        dispatch(fetchLoyaltyByAccountNumber(uiData.scanEvent.scanValue))
      }
    }
  }, [uiData.scanEvent?.scanTime])

  const checkForWarrantiesAdded = () => {
    for (let i = 0; i < transactionData.items?.length; i++) {
      if (transactionData.items[i].associatedItems) return true
    }
    return false
  }
  const transactionContainsGiftCardTenders = transactionData?.tenders?.some(tender => tender.cardType === GIFTCARD)
  const isRefundingOver500OnGiftCards = (
    featureFlagEnabled('IncrementedGiftCardRefunds') &&
    transactionData && transactionData.total?.grandTotal < -500 &&
    (giftCardSelected || transactionContainsGiftCardTenders)
  )
  return (
    <View style={styles.app}>
      {transactionCardShowing
        ? (
          <View style={[styles.grid, styles.gridContainer]}>
            <View
              style={[
                styles.grid,
                styles.gridItem,
                { width: '60%', alignItems: 'stretch' }
              ]}
            >
              <Header
                theme={theme}
                storeNumber={registerData.storeNumber}
                registerNumber={registerData.registerNumber}
                text={`Hello, ${associateData.firstName}!`}
                transactionCardShowing={transactionCardShowing}
              />
              <View
                style={[
                  styles.mainContainer,
                  {
                    alignItems:
                    uiData.activePanel !== 'scanDetailsPanel'
                      ? 'center'
                      : 'flex-start',
                    justifyContent: 'flex-start'
                  }
                ]}
              >
                {
                  (
                    uiData.activePanel === 'cashPanel' ||
                    uiData.activePanel === 'tenderAmountPanel' ||
                    (uiData.activePanel === 'paymentPanel' && transactionData?.tenders?.length === 0) ||
                    (uiData.creditPanelError && !isRefundingOver500OnGiftCards) ||
                    uiData.activePanel === 'warrantyPanel' ||
                    (uiData.activePanel === 'creditPanel' && giftCardSelected && transactionData?.total?.grandTotal < 0 && !transactionContainsGiftCardTenders) ||
                    (uiData.activePanel === 'creditPanel' && isStoreCredit && !uiData.loadingStates.giftCardActivation)
                  ) &&
                  !checkForLoading(uiData.loadingStates) &&
                  (
                    <BackButton
                      warrantiesAdded={checkForWarrantiesAdded()}
                      activePanel={uiData.activePanel}
                      back={back}
                      splitTender={splitTender}
                      setSplitTender={setSplitTender}
                    />
                  )
                }
                {uiData.activePanel === 'paymentPanel' ||
              uiData.activePanel === 'cashPanel' ||
              uiData.activePanel === 'creditPanel' ||
              uiData.activePanel === 'tenderAmountPanel' ||
              uiData.activePanel === 'changePanel'
                  ? (
                    <PaymentPanel
                      uiData={uiData}
                      displayCashPanel={displayCashPanel}
                      displayCreditPanel={displayCreditPanel}
                      promptForTenderAmount={promptForTenderAmount}
                      transactionData={transactionData}
                      calculateChange={calculateChange}
                      createNewCreditTender={createNewCreditTender}
                      associateData={associateData}
                      printerString={printerString}
                      selectedLoyaltyCustomer={loyaltyData.selectedLoyaltyCustomer}
                      returnData={returnData}
                      splitTender={splitTender}
                      setSplitTender={setSplitTender}
                      tenderAmountInput={tenderAmountInput}
                      setTenderAmountInput={setTenderAmountInput}
                      giftCardSelected={giftCardSelected}
                      setGiftCardSelected={setGiftCardSelected}
                      isStoreCredit={isStoreCredit}
                      setIsStoreCredit={setIsStoreCredit}
                      isRefundingOver500OnGiftCards={isRefundingOver500OnGiftCards}
                    />
                  )
                  : (
                    <DetailsPanelController
                      uiData={uiData}
                      transactionData={transactionData}
                      theme={theme}
                      omniSearchInput={omniSearchInput}
                      setOmniSearchInput={setOmniSearchInput}
                      fetchItem={fetchItem}
                    />
                  )}
              </View>
            </View>
            <View
              style={[
                styles.grid,
                styles.gridItem,
                styles.transactionCardContainer
              ]}
            >
              <TransactionsCard
                change={uiData.activePanel === 'changePanel'}
                scannedItems={transactionData?.items}
                featureFlagData={featureFlagData}
              />
            </View>
          </View>
        )
        : (
          <>
            <Header
              theme={theme}
              storeNumber={registerData.storeNumber}
              registerNumber={registerData.registerNumber}
              text={`Hello, ${associateData.firstName}!`}
              transactionCardShowing={transactionCardShowing}
            />
            <View style={styles.mainContainer}>
              <ScanPanel home={true} omniSearchInput={omniSearchInput} fetchItem={(input) => dispatch(fetchItem(input))}
                setOmniSearchInput={setOmniSearchInput}/>
              {featureFlagEnabled('LoyaltyPhonePinpadEntry') &&
              (
                <TouchableOpacity
                  style={{ position: 'absolute', bottom: 32, left: 7 }}
                  onPress={() => {
                    if (isCefSharp) {
                      dispatch(receiveUiData({ activePanel: 'scanDetailsPanel', selectedItem: 'loyaltyPinpadPhoneLookup', pinpadPhoneEntryEnabled: true }))
                      CefSharp.initiateLoyaltyPhoneInput()
                    }
                  }}>
                  <LookupLoyaltyByPinpadSvg/>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
    </View>
  )
}

App.propTypes = {
  associateData: PropTypes.object,
  theme: PropTypes.object,
  registerData: PropTypes.object,
  uiData: PropTypes.object,
  transactionData: PropTypes.object,
  displayCashPanel: PropTypes.func,
  displayCreditPanel: PropTypes.func,
  promptForTenderAmount: PropTypes.func,
  back: PropTypes.func,
  printerString: PropTypes.object,
  calculateChange: PropTypes.func,
  createNewCreditTender: PropTypes.func,
  loyaltyData: PropTypes.object,
  returnData: PropTypes.object,
  productLookupData: PropTypes.object
}

const mapStateToProps = state => ({
  theme: state.theme,
  associateData: state.associateData,
  registerData: state.registerData,
  uiData: state.uiData,
  transactionData: state.transactionData,
  printerString: state.printerString,
  loyaltyData: state.loyaltyData,
  returnData: state.returnData,
  productLookupData: state.productLookupData
})

const mapDispatchToProps = {
  calculateChange,
  createNewCreditTender,
  displayCashPanel: displayCashPanel,
  displayCreditPanel: displayCreditPanel,
  promptForTenderAmount,
  back
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

const styles = StyleSheet.create({
  app: {
    flex: 1
  },
  appHeader: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  grid: {
    flex: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  gridContainer: {
    flexWrap: 'wrap',
    width: '100%',
    flex: 1
  },
  gridItem: {
    margin: 0,
    flexDirection: 'column'
  },
  mainContainer: {
    flex: 1,
    borderTopWidth: 2,
    borderColor: '#a7a7a7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  transactionCardContainer: {
    width: '40%',
    alignItems: 'stretch',
    flex: 1,
    alignSelf: 'stretch'
  }
})
