import { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import AddGiftReceiptSvg from '../svg/AddGiftReceiptSvg'
import IconAboveTextButton from '../reusable/IconAboveTextButton'
import GiftReceiptSelection from '../GiftReceiptSelection'
import CloseRegisterSvg from '../svg/CloseRegisterSvg'
import { receiveUiData } from '../../actions/uiActions'
import { useDispatch } from 'react-redux'
import ReprintReceiptSvg from '../svg/ReprintReceiptSvg'
import { useTypedSelector } from '../../reducers/reducer'
import { printSalesReceipt } from '../../utils/cefSharp'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import AddTeammateSvg from '../svg/AddTeammateSvg'
import ItemLevelSap from './ItemLevelSap'
import NoSalePriceTagSvg from '../svg/NoSalePriceTagSvg'
import { featureFlagEnabled } from '../../reducers/featureFlagData'
import { createNoSaleTransaction } from '../../actions/transactionActions'
import ConnectPinpadSvg from '../svg/ConnectPinpadSvg'
import * as CefSharp from '../../utils/cefSharp'
import * as UiActions from '../../actions/uiActions'
import { RegisterDataTypes } from '../../reducers/registerData'
import { TransactionDataTypes } from '../../reducers/transactionData'
import ProductLookupPanel from '../ProductLookupPanel'
import StoreServicesPanel from '../StoreServicesPanel'
import MagnifyingGlassSvg from '../svg/MagnifyingGlassSvg'
import { clearProductLookupData } from '../../actions/productLookupActions'
import PostVoidSvg from '../svg/PostVoidSvg'
import LowestPriceSVG from '../LowestPriceSVG'
import LowestPriceInquiryPanel from '../LowestPriceInquiryPanel'
import ReprintGiftReceipt from './ReprintGiftReceipt'
import ReprintGiftReceiptSvg from '../svg/ReprintGiftReceiptSvg'
import GiftCardBalanceInquirySvg from '../svg/GiftCardBalanceInquirySvg'
import SellGiftCardSvg from '../svg/SellGiftCardSvg'
import AddAssociateDiscountSvg from '../svg/AddAssociateDiscountSvg'
import AddAssociateDiscountPopup from './AddAssociateDiscountPopup'
import { FooterOverlayActiveType, PanelsType } from '../../reducers/uiData'
import { getConfigurationValue } from '../../actions/configurationActions'
import { sendAppInsightsPageView } from '../../utils/appInsights'
import TaxExemptLabelSvg from '../svg/TaxExemptLabelSvg'
import PostVoidPopup from './PostVoidPopup'
import { receivePrintReceiptData } from '../../actions/printReceiptActions'
import FooterLookupOptionsColumn from './FooterMenuOptionsColumns/FooterLookupOptionsColumn'

interface FooterMenuOverlayProps {
  giftReceiptPanelSelected: boolean
  setGiftReceiptPanelSelected: (boolean) => void
  footerOverlayActive: FooterOverlayActiveType
  registerData: RegisterDataTypes
  transactionData: TransactionDataTypes
  activePanel: PanelsType
  authenticated: boolean
  reprintGiftReceiptPanelSelected: boolean
  setReprintGiftReceiptPanelSelected: (boolean) => void
  loyaltyAltScreenName: string
}

const FooterMenuOverlay = ({
  giftReceiptPanelSelected,
  setGiftReceiptPanelSelected,
  footerOverlayActive,
  registerData,
  transactionData,
  activePanel,
  authenticated,
  reprintGiftReceiptPanelSelected,
  setReprintGiftReceiptPanelSelected,
  loyaltyAltScreenName
}: FooterMenuOverlayProps) => {
  const dispatch = useDispatch()
  const shim = (
    <View style={{ width: 100, height: 56, marginBottom: 20, zIndex: 2 }} pointerEvents='none' />
  )
  const [reprintReceiptPressed, setReprintReceiptPressed] = useState(false)
  const {
    serializedTransaction,
    serializedStoreInfo,
    serializedAssociateData,
    serializedAdditionalInfo,
    reprintReceiptAvailable
  } = useTypedSelector(state => state.printReceiptData)
  const {
    showItemLevelSap,
    showAddAssociateDiscount,
    loadingStates,
    productLookupPanelSelected,
    storeServicesPanelSelected,
    scanEvent,
    lowestPriceInquiryPanelSelected,
    showModal,
    autofocusTextbox,
    enhancedPostVoidPanelSelected,
    priceEditActive
  } = useTypedSelector(state => state.uiData)
  const noActiveTransaction = registerData.state === 1 &&
    transactionData?.header?.transactionStatus !== 1 &&
    !transactionData.customer
  const loadingRegisterFunction = loadingStates.closeRegister || loadingStates.createNoSaleTransaction || loadingStates.void || loadingStates.taxExemptLookup
  const enableEnhancedPostVoid = featureFlagEnabled('PostVoidEnhancedWithLookup')
  const deserializedTransaction = serializedTransaction ? JSON.parse(serializedTransaction) : undefined
  const postVoidAvailable = deserializedTransaction?.header?.transactionType === 1
  const disablePostVoid = (!enableEnhancedPostVoid && !postVoidAvailable) || loadingRegisterFunction
  const disableGiftCardBalanceInquiry = loadingStates.closeRegister
  const disableActivateGiftCard = disableGiftCardBalanceInquiry || priceEditActive
  const disableTaxExempt = loadingRegisterFunction || (activePanel !== 'scanDetailsPanel' && activePanel !== 'initialScanPanel')
  const isAdyen = useTypedSelector(state => state.registerData.isAdyen)
  const isFamilyNight = getConfigurationValue('familynight', 'familyNight')
  const complimentaryGiftCardEnabled = featureFlagEnabled('ComplimentaryGiftCard')
  useEffect(() => {
    return () => {
      if (loyaltyAltScreenName !== 'advanced' && autofocusTextbox !== 'LoyaltyAdvancedSearch' && footerOverlayActive !== 'ItemLookup') {
        dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch', scanEvent: null, enhancedPostVoidPanelSelected: false }))
        dispatch(receivePrintReceiptData({ transactionByBarcodeError: null, transactionByBarcodeErrorMessage: null }))
      }
    }
  }, [])
  return (
    <>
      <View
        style={styles.container}
        testID='footer-menu-overlay'
      >
        <TouchableOpacity
          testID='close-footer-overlay'
          onPress={() => {
            dispatch(receiveUiData({ footerOverlayActive: 'None', autofocusTextbox: 'OmniSearch' }))
            ;(productLookupPanelSelected || storeServicesPanelSelected || lowestPriceInquiryPanelSelected) && dispatch(clearProductLookupData())
          }}
          style={{ height: '100%', width: '100%', position: 'absolute', left: 0 }}
        />
        {authenticated &&
          <>
            {(footerOverlayActive === 'Register' && !enhancedPostVoidPanelSelected)
              ? (
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                  {!featureFlagEnabled('SettingsButton') &&
                    isAdyen &&
                    featureFlagEnabled('ConnectPinpad') &&
                    <IconAboveTextButton
                      testId={'connect-pinpad-button'}
                      icon={<ConnectPinpadSvg disabled={loadingRegisterFunction} />}
                      buttonText={'CONNECT PINPAD'}
                      disabled={loadingRegisterFunction}
                      buttonTextStyle={styles.registerButton}
                      onPress={async () => {
                        console.info('ACTION: components > Footer > onPress CONNECT PINPAD')
                        CefSharp.activatePinpadConfigurationScanHandler()
                        dispatch(
                          UiActions.receiveUiData({
                            showModal: 'connectPinpadModal'
                          })
                        )
                      }}
                    />
                  }
                  {
                    featureFlagEnabled('TaxExempt') &&
                    <IconAboveTextButton
                      testId={'tax-exempt'}
                      icon={<TaxExemptLabelSvg disabled={disableTaxExempt} />}
                      buttonText={'TAX-EXEMPT SALE'}
                      disabled={disableTaxExempt}
                      buttonTextStyle={styles.registerButton}
                      onPress={async () => {
                        console.info('ACTION: components > Footer > onPress TAX-EXEMPT SALE')
                        dispatch(
                          receiveUiData({
                            showModal: 'taxExemptSale',
                            autofocusTextbox: 'Modal'
                          })
                        )
                      }}
                    />
                  }
                  {
                    featureFlagEnabled('NoSale') && noActiveTransaction &&
                    <IconAboveTextButton
                      testId={'no-sale'}
                      icon={<NoSalePriceTagSvg disabled={loadingRegisterFunction} />}
                      buttonText={'NO SALE'}
                      disabled={loadingRegisterFunction}
                      buttonTextStyle={styles.registerButton}
                      onPress={async () => {
                        console.info('ACTION: components > Footer > onPress NO SALE')
                        dispatch(createNoSaleTransaction())
                      }}
                      loading={loadingStates.createNoSaleTransaction}
                    />
                  }
                  {
                    isAdyen && featureFlagEnabled('PostVoid') && activePanel === 'initialScanPanel' &&
                      <IconAboveTextButton
                        testId={'post-void'}
                        icon={<PostVoidSvg disabled={disablePostVoid}/>}
                        buttonText={'POST VOID'}
                        disabled={disablePostVoid}
                        buttonTextStyle={styles.registerButton}
                        onPress={async () => {
                          console.info('ACTION: components > Footer > onPress POST VOID')
                          if (enableEnhancedPostVoid) {
                            dispatch(
                              receiveUiData({
                                enhancedPostVoidPanelSelected: true
                              })
                            )
                          } else {
                            dispatch(
                              receiveUiData({
                                showModal: 'postVoid'
                              })
                            )
                          }
                        }}
                      />
                  }
                  {
                    noActiveTransaction &&
                    <IconAboveTextButton
                      testId={'close-register'}
                      icon={<CloseRegisterSvg disabled={loadingRegisterFunction} />}
                      buttonText={'CLOSE REGISTER'}
                      disabled={loadingRegisterFunction}
                      buttonTextStyle={styles.registerButton}
                      onPress={() => {
                        console.info('ACTION: components > Footer > onPress CLOSE REGISTER')
                        dispatch(receiveUiData({ showModal: 'confirmCloseRegister' }))
                      }}
                      loading={loadingStates.closeRegister}
                    />
                  }
                </View>
              )
              : shim}
            {
              <FooterLookupOptionsColumn
                footerOverlayActive={footerOverlayActive}
                productLookupPanelSelected={productLookupPanelSelected}
                storeServicesPanelSelected={storeServicesPanelSelected}
                lowestPriceInquiryPanelSelected={lowestPriceInquiryPanelSelected}
                activePanel={activePanel}
                authenticated={authenticated}
                shim={shim}
              />
            }
            {shim}
            {footerOverlayActive === 'Receipts'
              ? (
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                  {
                    !reprintGiftReceiptPanelSelected && !giftReceiptPanelSelected &&
                    <IconAboveTextButton
                      testId={'gift-receipt'}
                      icon={<AddGiftReceiptSvg disabled={activePanel !== 'scanDetailsPanel'} />}
                      buttonText={'ADD A GIFT RECEIPT'}
                      disabled={activePanel !== 'scanDetailsPanel'}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress ADD A GIFT RECEIPT', { giftReceiptPanelSelected: giftReceiptPanelSelected })
                        if (!giftReceiptPanelSelected) {
                          setGiftReceiptPanelSelected(true)
                        } else {
                          setGiftReceiptPanelSelected(false)
                          dispatch(receiveUiData({
                            footerOverlayActive: 'None'
                          }))
                        }
                      }}
                      buttonTextStyle={styles.buttonTextStyle}
                    />
                  }
                  {featureFlagEnabled('ReprintGiftReceipt') && !giftReceiptPanelSelected && !reprintGiftReceiptPanelSelected &&
                    <IconAboveTextButton
                      testId={'reprint-gift-receipt'}
                      icon={<ReprintGiftReceiptSvg disabled={activePanel !== 'initialScanPanel'} />}
                      buttonText={'REPRINT GIFT RECEIPT'}
                      disabled={activePanel !== 'initialScanPanel'}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress REPRINT GIFT RECEIPT', { giftReceiptPanelSelected: giftReceiptPanelSelected })
                        setReprintGiftReceiptPanelSelected(!reprintGiftReceiptPanelSelected)
                        dispatch(receiveUiData({
                          autofocusTextbox: 'ReprintGiftReceipt'
                        }))
                      }}
                      buttonTextStyle={styles.buttonTextStyle}
                    />
                  }
                  {
                    !giftReceiptPanelSelected && !reprintGiftReceiptPanelSelected && (
                      <IconAboveTextButton
                        testId={'reprint-receipt'}
                        icon={<ReprintReceiptSvg disabled={!reprintReceiptAvailable || reprintReceiptPressed} />}
                        buttonText={reprintReceiptPressed ? 'PRINTING...' : 'REPRINT LAST RECEIPT'}
                        disabled={!reprintReceiptAvailable || reprintReceiptPressed}
                        onPress={() => {
                          console.info('ACTION: components > FooterMenuOverlay > onPress REPRINT LAST RECEIPT')
                          setReprintReceiptPressed(true)
                          setTimeout(
                            () => {
                              setReprintReceiptPressed(false)
                              dispatch(receiveUiData({ footerOverlayActive: 'None' }))
                            }, 3000)
                          printSalesReceipt(serializedTransaction, serializedStoreInfo, serializedAssociateData, serializedAdditionalInfo)
                          sendRumRunnerEvent('Reprint receipt', {
                            screen: activePanel === 'initialScanPanel' ? 'initialScanPanel' : 'duringTransaction'
                          })
                        }}
                        buttonTextStyle={[styles.buttonTextStyle]}
                      />
                    )
                  }
                </View>
              )
              : shim}
            {footerOverlayActive === 'GiftCard' && showModal !== 'giftCardBalanceInquiry' && showModal !== 'sellGiftCard' && showModal !== 'createGiftCard'
              ? (
                <View>
                  {complimentaryGiftCardEnabled && (
                    <IconAboveTextButton
                      testId={'create-gift-card'}
                      icon={<SellGiftCardSvg disabled={disableActivateGiftCard} />}
                      buttonText={'ACTIVATE A GIFT CARD'}
                      disabled={disableActivateGiftCard}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress ACTIVATE A GIFT CARD')
                        dispatch(receiveUiData({
                          showModal: 'createGiftCard',
                          footerOverlayActive: 'None'
                        }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle,
                        { marginTop: 8 }
                      ]}
                    />)
                  }
                  {!complimentaryGiftCardEnabled && (
                    <IconAboveTextButton
                      testId={'sell-gift-card'}
                      icon={<SellGiftCardSvg disabled={disableGiftCardBalanceInquiry} />}
                      buttonText={'SELL A GIFT CARD'}
                      disabled={disableGiftCardBalanceInquiry}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress SELL A GIFT CARD')
                        dispatch(receiveUiData({
                          showModal: 'sellGiftCard',
                          footerOverlayActive: 'None'
                        }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle,
                        { marginTop: 8 }
                      ]}
                    />)
                  }
                  {
                    isAdyen && featureFlagEnabled('GiftCardBalanceInquiry') && <IconAboveTextButton
                      testId={'gift-card-balance-inquiry'}
                      icon={<GiftCardBalanceInquirySvg disabled={disableGiftCardBalanceInquiry} />}
                      buttonText={'GIFT CARD BALANCE INQUIRY'}
                      disabled={disableGiftCardBalanceInquiry}
                      onPress={() => {
                        console.info('ACTION: components > Footer > onPress GIFT CARD AMOUNT INQUIRY')
                        dispatch(receiveUiData({
                          showModal: 'giftCardBalanceInquiry',
                          footerOverlayActive: 'None'
                        }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle,
                        { marginTop: 8, width: 200 },
                        disableGiftCardBalanceInquiry && { color: '#C8C8C8' }
                      ]}
                    />
                  }
                </View>
              )
              : shim}
            {shim}
            {shim}
            {footerOverlayActive === 'Teammate'
              ? (
                <View>
                  {!(showItemLevelSap || showAddAssociateDiscount) && (
                    <IconAboveTextButton
                      testId={'add-teammate-to-sale'}
                      icon={<AddTeammateSvg showItemLevelSap={showItemLevelSap} />}
                      buttonText={showItemLevelSap ? 'TEAMMATE' : 'ADD TEAMMATE TO SALE'}
                      disabled={activePanel !== 'scanDetailsPanel' && activePanel !== 'initialScanPanel'}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress ADD TEAMMATE TO SALE')
                        dispatch(receiveUiData({ showItemLevelSap: !showItemLevelSap }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle
                      ]}
                    />
                  )}
                  {!(showItemLevelSap || showAddAssociateDiscount) && (
                    <IconAboveTextButton
                      testId={'add-associate-discount'}
                      icon={<AddAssociateDiscountSvg showItemLevelSap={showItemLevelSap} isFamilyNight={isFamilyNight} />}
                      buttonText={isFamilyNight ? 'TEAMMATE AND FAMILY SALE' : 'ADD ASSOCIATE DISCOUNT'}
                      disabled={activePanel !== 'scanDetailsPanel' && activePanel !== 'initialScanPanel'}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress ADD TEAMMATE TO SALE')
                        dispatch(receiveUiData({ showAddAssociateDiscount: !showAddAssociateDiscount }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle,
                        { width: 200 }
                      ]}
                    />
                  )}
                </View>
              )
              : shim}
            {shim}
          </>
        }

        {!authenticated &&
          <>
            {shim}
            {shim}
            {shim}
            {shim}
            {footerOverlayActive === 'ItemLookup' && !productLookupPanelSelected && !lowestPriceInquiryPanelSelected
              ? (
                <View>
                  {
                    featureFlagEnabled('LowestPriceInquiry') && <IconAboveTextButton
                      testId={'lowest-price-inquiry'}
                      icon={<LowestPriceSVG disabled={false} width={56} height={56}/>}
                      buttonText={'LOWEST PRICE INQUIRY'}
                      disabled={false}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress LOWEST PRICE INQUIRY')
                        if (lowestPriceInquiryPanelSelected) {
                          dispatch(receiveUiData({
                            footerOverlayActive: 'None'
                          }))
                        } else {
                          sendRumRunnerEvent('Product Lookup Panel', {
                            authenticated
                          })
                        }
                        dispatch(receiveUiData({
                          lowestPriceInquiryPanelSelected: !lowestPriceInquiryPanelSelected
                        }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle,
                        { marginTop: 8 }
                      ]}
                    />
                  }
                  {
                    featureFlagEnabled('ItemLookup') && <IconAboveTextButton
                      testId={'item-lookup'}
                      icon={<MagnifyingGlassSvg disabled={false} width={56} height={56}/>}
                      buttonText={'PRODUCT LOOKUP'}
                      disabled={false}
                      onPress={() => {
                        console.info('ACTION: components > FooterMenuOverlay > onPress PRODUCT LOOKUP')
                        if (productLookupPanelSelected) {
                          dispatch(receiveUiData({
                            footerOverlayActive: 'None'
                          }))
                        } else {
                          sendRumRunnerEvent('Product Lookup Panel', {
                            authenticated
                          })
                          sendAppInsightsPageView('ProductLookup', 'ProductLookupLanding')
                        }
                        dispatch(receiveUiData({
                          productLookupPanelSelected: !productLookupPanelSelected
                        }))
                      }}
                      buttonTextStyle={[
                        styles.buttonTextStyle,
                        { marginTop: 8 }
                      ]}
                    />
                  }
                </View>
              )
              : shim}
            {shim}
            {shim}
            {shim}
            {shim}
          </>
        }

      </View>
      {
        giftReceiptPanelSelected &&
        <GiftReceiptSelection
          setGiftReceiptPanelSelected={setGiftReceiptPanelSelected}
        />
      }
      {
        reprintGiftReceiptPanelSelected &&
        <ReprintGiftReceipt
          setReprintGiftReceiptPanelSelected={setReprintGiftReceiptPanelSelected}
          activePanel={activePanel}
          transactionByBarcodeLoading={loadingStates.transactionByBarcode}
          scanEvent={scanEvent}
        />
      }
      {
        productLookupPanelSelected &&
        <ProductLookupPanel
          authenticated={authenticated}
        />
      }
      {
        storeServicesPanelSelected &&
        <StoreServicesPanel
        />
      }
      {
        lowestPriceInquiryPanelSelected &&
        <LowestPriceInquiryPanel/>
      }
      {
        showItemLevelSap &&
        <ItemLevelSap />
      }
      {
        showAddAssociateDiscount &&
        <AddAssociateDiscountPopup
          activePanel={activePanel}
          isFamilyNight={isFamilyNight}
        />
      }
      {
        enhancedPostVoidPanelSelected &&
        <PostVoidPopup
          postVoidLoading={loadingStates.postVoid}
          transactionByBarcodeLoading={loadingStates.transactionByBarcode}
          scanEvent={scanEvent}
        />
      }
    </>
  )
}
export default FooterMenuOverlay

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(25, 31, 28, 0.85)',
    position: 'absolute',
    bottom: 98,
    left: 0,
    height: '100vh',
    width: '100%',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 32
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    fontWeight: '700',
    alignItems: 'center',
    marginTop: 0,
    paddingBottom: 0,
    width: 170,
    marginBottom: 20
  },
  registerButton: {
    color: '#FFFFFF',
    marginTop: 5,
    marginBottom: 22
  }
})
