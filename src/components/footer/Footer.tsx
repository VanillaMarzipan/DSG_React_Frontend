import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import { AssociateDataTypes } from '../../reducers/associateData'
import { RegisterDataTypes } from '../../reducers/registerData'
import { TransactionDataTypes } from '../../reducers/transactionData'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import IconAboveTextButton from '../reusable/IconAboveTextButton'
import ReceiptOptions from '../svg/ReceiptOptionsSvg'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import RegisterFunctions from '../svg/RegisterFunctionsSvg'
import { receiveUiData } from '../../actions/uiActions'
import { useDispatch } from 'react-redux'
import FeedbackSvg from '../svg/FeedbackSvg'
import { setReceiptDetails } from '../../actions/transactionActions'
import ReturnsSvg from '../svg/ReturnsSvg'
import { FeatureFlagTypes } from '../../reducers/featureFlagData'
import CreditFooterSvg from '../svg/CreditFooterSvg'
import GiftCardMenuSvg from '../svg/GiftCardFooterSvg'
import TeammateSvg from '../svg/TeammateSvg'
import { receiveCreditEnrollmentData } from '../../actions/creditEnrollmentActions'
import LookupSvg from '../svg/LookupSvg'
import { clearProductLookupData } from '../../actions/productLookupActions'

export interface FooterProps {
  authenticated: boolean
  clearAssociateData: (associateId: string) => void
  associateData: AssociateDataTypes
  registerData: RegisterDataTypes
  transactionData: TransactionDataTypes
  footerOverlayActive: string
  giftReceiptPanelSelected: boolean
  setGiftReceiptPanelSelected: (boolean) => void
  featureFlags: FeatureFlagTypes
  reprintGiftReceiptPanelSelected: boolean
  setReprintGiftReceiptPanelSelected: (boolean) => void
}

const Footer = ({
  authenticated,
  footerOverlayActive,
  giftReceiptPanelSelected,
  setGiftReceiptPanelSelected,
  featureFlags,
  reprintGiftReceiptPanelSelected,
  setReprintGiftReceiptPanelSelected,
  transactionData
}: FooterProps) => {
  const dispatch = useDispatch()
  const shim = (
    <View style={{ width: 100 }}/>
  )
  const {
    priceEditActive,
    activePanel,
    loadingStates,
    showItemLevelSap,
    showAddAssociateDiscount,
    showModal,
    productLookupPanelSelected,
    storeServicesPanelSelected,
    lowestPriceInquiryPanelSelected,
    enhancedPostVoidPanelSelected
  } = useSelector(state => state.uiData)
  const storeInfo = useSelector(state => state.storeInfo)
  const { customer, tenders } = useSelector(state => state.transactionData)
  const reprintReceiptAvailable = useSelector(state => state.printReceiptData?.reprintReceiptAvailable)
  const selectedLoyaltyCustomer = useSelector(state => state.loyaltyData.selectedLoyaltyCustomer)
  const isAdyen = useSelector(state => state.registerData.isAdyen)

  useEffect(() => {
    if (footerOverlayActive === 'None') {
      setGiftReceiptPanelSelected(false)
      setReprintGiftReceiptPanelSelected(false)
      dispatch(receiveUiData({
        productLookupPanelSelected: false,
        storeServicesPanelSelected: false,
        lowestPriceInquiryPanelSelected: false
      }))
    }
  }, [footerOverlayActive])

  const closeRegisterLoading = loadingStates.closeRegister
  const disableRegisterFunctions = (
    loadingStates.closeRegister ||
    loadingStates.createNoSaleTransaction ||
    loadingStates.transactionByBarcode ||
    loadingStates.postVoid ||
    (footerOverlayActive !== 'Register' && footerOverlayActive !== 'None')
  )
  const disableReceipts = priceEditActive || closeRegisterLoading || (footerOverlayActive !== 'Receipts' && footerOverlayActive !== 'None')
  const disableReturns = transactionData?.tenders?.length > 0 || transactionData?.originalSaleInformation?.length > 0 || (activePanel !== 'scanDetailsPanel' && activePanel !== 'initialScanPanel') || closeRegisterLoading || footerOverlayActive !== 'None'
  const disableTeammate = (
    priceEditActive ||
    (footerOverlayActive !== 'None' && footerOverlayActive !== 'Teammate') ||
    (activePanel !== 'initialScanPanel' && activePanel !== 'scanDetailsPanel') ||
    loadingStates.addAssociateDiscount ||
    loadingStates.omniSearch !== null
  )
  const disableSignOut = closeRegisterLoading || footerOverlayActive !== 'None'
  const disableFeedback = disableSignOut
  const disableItemLookup = footerOverlayActive !== 'None' && footerOverlayActive !== 'ItemLookup'
  const disableGiftCard = footerOverlayActive !== 'None' && footerOverlayActive !== 'GiftCard'
  const disableCreditEnrollment = (activePanel !== 'scanDetailsPanel' && activePanel !== 'paymentPanel') || tenders?.length > 0 || footerOverlayActive !== 'None'
  return (
    <View
      style={[
        styles.footer
      ]}
    >
      {authenticated && (
        <>
          {!(activePanel === 'creditPanel')
            ? (
              <IconAboveTextButton
                testId={'register-functions'}
                icon={<RegisterFunctions disabled={disableRegisterFunctions} circled={
                  showModal === 'taxExemptSale' || showModal === 'postVoid' || enhancedPostVoidPanelSelected || showModal === 'confirmCloseRegister'
                }/>}
                buttonText={'FUNCTIONS'}
                buttonTextStyle={[
                  {
                    marginTop: 6,
                    width: 150
                  },
                  disableRegisterFunctions && { color: '#C8C8C8' }
                ]}
                disabled={disableRegisterFunctions}
                onPress={() => {
                  console.info('ACTION: components > Footer > onPress REGISTER FUNCTIONS')
                  if (footerOverlayActive === 'None') {
                    dispatch(receiveUiData({
                      autofocusTextbox: null,
                      footerOverlayActive: 'Register'
                    }))
                  } else {
                    dispatch(receiveUiData({
                      autofocusTextbox: 'OmniSearch',
                      footerOverlayActive: 'None',
                      enhancedPostVoidPanelSelected: false
                    }))
                  }
                }}
              />
            )
            : shim
          }
          {featureFlags?.includes('ItemLookup') || featureFlags?.includes('StoreServices') || featureFlags?.includes('LowestPriceInquiry')
            ? (
              <IconAboveTextButton
                testId={'item-lookup-footer'}
                icon={<LookupSvg disabled={disableItemLookup} circled={productLookupPanelSelected || storeServicesPanelSelected || lowestPriceInquiryPanelSelected}/>}
                style={{
                  marginTop: 8
                }}
                buttonTextStyle={[
                  {
                    marginTop: 3
                  },
                  disableItemLookup && {
                    color: '#C8C8C8'
                  }
                ]}
                disabled={disableItemLookup}
                buttonText={'LOOKUP'}
                onPress={() => {
                  console.info('ACTION: components > Footer > onPress PRODUCT LOOKUP')
                  if (footerOverlayActive === 'None') {
                    dispatch(receiveUiData({
                      autofocusTextbox: 'ItemLookup',
                      footerOverlayActive: 'ItemLookup'
                    }))
                    sendRumRunnerEvent('Product Lookup Menu', {
                      authenticated
                    })
                  } else {
                    dispatch(receiveUiData({
                      autofocusTextbox: 'OmniSearch',
                      footerOverlayActive: 'None'
                    }))
                    dispatch(clearProductLookupData())
                  }
                }}
              />
            )
            : shim}
          {shim}
          {(activePanel === 'scanDetailsPanel' || activePanel === 'initialScanPanel' || activePanel === 'paymentPanel')
            ? (
              <IconAboveTextButton
                testId={'receipt-options'}
                icon={<ReceiptOptions disabled={disableReceipts} receiptOptionSelected={giftReceiptPanelSelected || reprintGiftReceiptPanelSelected}/>}
                buttonText={'RECEIPTS'}
                disabled={disableReceipts}
                onPress={() => {
                  console.info('ACTION: components > Footer > onPress RECEIPT OPTIONS', { priceEditActive: priceEditActive })
                  if (!priceEditActive) {
                    if (footerOverlayActive === 'None') {
                      dispatch(receiveUiData({
                        autofocusTextbox: null,
                        footerOverlayActive: 'Receipts'
                      }))
                      if (!reprintReceiptAvailable) {
                        const additionalInfo = {
                          shouldPrintSurvey: false,
                          isDuplicate: true,
                          loyaltyCustomer: ''
                        }
                        if (customer && customer.loyaltyNumber) {
                          additionalInfo.loyaltyCustomer = customer.loyaltyNumber
                        }
                        if (storeInfo) {
                          dispatch(setReceiptDetails(storeInfo, additionalInfo))
                        }
                      }
                    } else {
                      dispatch(receiveUiData({
                        autofocusTextbox: 'OmniSearch',
                        footerOverlayActive: 'None'
                      }))
                    }
                  }
                }}
                buttonTextStyle={[
                  {
                    width: 120
                  },
                  disableReceipts && { color: '#C8C8C8' }
                ]}
              />
            )
            : shim}
          {isAdyen && (activePanel === 'initialScanPanel' || activePanel === 'scanDetailsPanel')
            ? (
              <IconAboveTextButton
                testId={'gift-card-balance-inquiry-footer'}
                icon={<GiftCardMenuSvg disabled={disableGiftCard} circled={
                  showModal === 'giftCardBalanceInquiry' || showModal === 'createGiftCard'
                }/>}
                buttonText={'GIFT CARD'}
                onPress={() => {
                  console.info('ACTION: components > Footer > onPress GIFT CARD')
                  if (footerOverlayActive === 'None') {
                    dispatch(receiveUiData({
                      footerOverlayActive: 'GiftCard'
                    }))
                  } else {
                    dispatch(receiveUiData({
                      footerOverlayActive: 'None'
                    }))
                  }
                }}
                buttonTextStyle={[
                  {
                    marginTop: 24
                  },
                  disableGiftCard && { color: '#C8C8C8' }
                ]}
              />
            )
            : shim}
          {(isAdyen && featureFlags?.includes('Returns'))
            ? <IconAboveTextButton
              testId={'returns-footer'}
              disabled={disableReturns}
              icon={<ReturnsSvg disabled={disableReturns} circled={showModal === 'returns'}/>}
              buttonText={'RETURNS'}
              buttonTextStyle={disableReturns && { color: '#C8C8C8' }}
              onPress={() => {
                dispatch(receiveUiData({
                  scanEvent: null,
                  showModal: 'returns'
                }))
              }}
            />
            : shim}
          {(isAdyen && authenticated && featureFlags?.includes('CreditEnrollment') && selectedLoyaltyCustomer)
            ? (
              <IconAboveTextButton
                testId={'credit-enrollment-footer'}
                icon={<CreditFooterSvg disabled={disableCreditEnrollment}/>}
                buttonText={'CREDIT'}
                disabled={disableCreditEnrollment}
                onPress={() => {
                  console.info('ACTION: components > Footer > onPress CREDIT ENROLLMENT')
                  dispatch(receiveUiData({
                    showModal: 'creditEnrollment'
                  }))
                  dispatch(receiveCreditEnrollmentData({ creditLookupActive: false, creditModalFlow: 'enrollment' }))
                }}
                buttonTextStyle={[
                  {
                    marginTop: -2
                  },
                  closeRegisterLoading && { color: '#C8C8C8' }
                ]}
              />
            )
            : (shim)}
          {(
            <IconAboveTextButton
              testId={'teammate-footer'}
              icon={<TeammateSvg disabled={disableTeammate} selected={showItemLevelSap || showAddAssociateDiscount}/>}
              buttonText={'TEAMMATE'}
              disabled={disableTeammate}
              onPress={() => {
                console.info('OnPress > Footer > Teammate')
                dispatch(receiveUiData({
                  footerOverlayActive: footerOverlayActive === 'None' ? 'Teammate' : 'None',
                  autofocusTextbox: 'ItemLevelSap',
                  showItemLevelSap: showItemLevelSap === true ? false : showItemLevelSap,
                  showAddAssociateDiscount: showAddAssociateDiscount === true ? false : showAddAssociateDiscount,
                  scanEvent: null
                }))
              }}
              buttonTextStyle={[{ marginTop: -5 }, disableTeammate && { color: '#C8C8C8' }]}
            />
          )}
          {(
            <IconAboveTextButton
              testId={'feedback-modal-button'}
              icon={<FeedbackSvg disabled={disableFeedback} circled={showModal === 'feedback'}/>}
              buttonTextStyle={[
                {
                  marginTop: 18
                },
                disableFeedback && { color: '#C8C8C8' }
              ]}
              disabled={disableFeedback}
              buttonText={'FEEDBACK'}
              onPress={() => {
                dispatch(receiveUiData({
                  showModal: 'feedback'
                }))
              }}
            />
          )}
        </>
      )}
      {!authenticated && (
        <>
          {shim}
          {shim}
          {shim}
          {shim}
          {featureFlags?.includes('ItemLookup') || featureFlags?.includes('LowestPriceInquiry')
            ? (
              <IconAboveTextButton
                testId={'item-lookup-footer'}
                icon={<LookupSvg disabled={disableItemLookup} circled={productLookupPanelSelected || lowestPriceInquiryPanelSelected}/>}
                style={{
                  marginTop: 8
                }}
                buttonTextStyle={[
                  {
                    marginTop: 3
                  },
                  disableItemLookup && {
                    color: '#C8C8C8'
                  }
                ]}
                disabled={disableItemLookup}
                buttonText={'LOOKUP'}
                onPress={() => {
                  console.info('ACTION: components > Footer > onPress PRODUCT LOOKUP')
                  if (footerOverlayActive === 'None') {
                    dispatch(receiveUiData({
                      autofocusTextbox: 'ItemLookup',
                      footerOverlayActive: 'ItemLookup'
                    }))
                    sendRumRunnerEvent('Product Lookup Menu', {
                      authenticated
                    })
                  } else {
                    dispatch(receiveUiData({
                      autofocusTextbox: 'OmniSearch',
                      footerOverlayActive: 'None'
                    }))
                    dispatch(clearProductLookupData())
                  }
                }}
              />
            )
            : shim}
          {shim}
          {shim}
          {shim}
          {shim}
        </>
      )}
    </View>
  )
}

Footer.propTypes = {
  authenticated: PropTypes.bool,
  clearAssociateData: PropTypes.func,
  closeRegister: PropTypes.func,
  associateData: PropTypes.object,
  registerData: PropTypes.object,
  transactionData: PropTypes.object
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 2,
    borderColor: '#a7a7a7',
    height: 99,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  text: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4

  },
  feedbackText: {
    marginTop: 16
  },
  feedbackCentering: {
    justifyContent: 'center'
  },
  logout: {
    alignItems: 'center'
  },
  closeRegister: {
    alignItems: 'center'
  },
  closeRegisterTextContainer: {
    alignItems: 'center',
    marginTop: 16
  }
})

export default Footer
