import ScanPanel from './ScanPanel'
import ProductDetail from './ProductDetail'
import LoyaltyDetailsPanelController from './loyalty/LoyaltyDetailsPanelController'
import PropTypes from 'prop-types'
import { ThemeTypes } from '../reducers/theme'
import WarrantyPanel from './WarrantyPanel'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { UiDataTypes } from '../reducers/uiData'
import { TransactionDataTypes } from '../reducers/transactionData'
import CouponOrRewardDetail from './CouponOrRewardDetail'
import { useDispatch } from 'react-redux'
import GiftCardDetail from './GiftCardDetail'
import ErrorBoxSvg from './svg/ErrorBoxSvg'
import Text from './StyledText'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import AssociateDiscountDetail from './AssociateDiscountDetail'
import TaxExemptDetail from './TaxExemptDetail'
import { useEffect } from 'react'
import { receiveUiData } from '../actions/uiActions'
import { checkIfOmniSearchQueryIsCoupon } from '../utils/transactionHelpers'
import PinpadEntryEnabledSvg from './svg/PinpadEntryEnabledSvg'
import * as CefSharp from '../utils/cefSharp'

interface DetailsPanelControllerProps {
  transactionData: TransactionDataTypes
  uiData: UiDataTypes
  theme: ThemeTypes
  fetchItem: (string) => void
  omniSearchInput: string
  setOmniSearchInput: (input: string) => void
}

const DetailsPanelController = ({
  transactionData,
  uiData,
  theme,
  fetchItem,
  omniSearchInput,
  setOmniSearchInput
}: DetailsPanelControllerProps) => {
  const dispatch = useDispatch()
  const featureFlagData = useSelector(state => state.featureFlagData)
  const invalidRewardData = useSelector(state => state.loyaltyData.invalidReward)

  useEffect(() => {
    if (checkIfOmniSearchQueryIsCoupon(uiData.loadingStates.omniSearch)) {
      dispatch(receiveUiData({ lastQueriedCouponCode: uiData.loadingStates.omniSearch.toLowerCase().trim() }))
    }
  }, [uiData.loadingStates.omniSearch])

  useEffect(() => {
    transactionData.coupons?.forEach((coupon, index) => {
      if (
        typeof coupon.couponCode === 'string' &&
        coupon.couponCode.toLowerCase().trim() === uiData.lastQueriedCouponCode
      ) {
        dispatch(receiveUiData({ couponToDisplayIndex: index, selectedItem: 'couponPanel' }))
      }
    })
  }, [transactionData.coupons, uiData.lastQueriedCouponCode])

  const returnItemsToParse = (returnItemsPresent) => {
    if (returnItemsPresent) return [...transactionData.originalSaleInformation[0].returnItems, ...transactionData.items]
    else return transactionData.items
  }

  let detailToDisplay = null
  if (uiData.activePanel === 'warrantyPanel') {
    detailToDisplay = <WarrantyPanel theme={theme} />
  } else {
    let scanPanelDetailToDisplay = null
    if (uiData.selectedItem === 'LOYALTY_PANEL') {
      scanPanelDetailToDisplay = (
        <LoyaltyDetailsPanelController />
      )
    } else if (uiData.selectedItem === 'GIFTCARD') {
      scanPanelDetailToDisplay = (
        <GiftCardDetail
          accountNumber={uiData.accountNumber}
          cardState={uiData.giftCardState}
          error={uiData.giftCardError}
        />
      )
    } else if (uiData.selectedItem === 'couponPanel' && transactionData.coupons && transactionData.coupons.length > 0) {
      scanPanelDetailToDisplay = (
        <CouponOrRewardDetail
          couponState={
            transactionData.coupons[uiData.couponToDisplayIndex]?.couponState
          }
          description={
            transactionData.coupons[uiData.couponToDisplayIndex]?.description
          }
          code={
            transactionData.coupons[uiData.couponToDisplayIndex]?.couponCode
          }
          expiration={
            transactionData.coupons[uiData.couponToDisplayIndex]?.expirationDate
          }
          couponPromotionStatus={
            transactionData.coupons[uiData.couponToDisplayIndex]?.couponPromotionStatus
          }
          loadingStates={uiData.loadingStates}
          isCoupon={true}
          featureFlags={featureFlagData && featureFlagData.features}
        />
      )
    } else if (uiData.selectedItem === 'rewardPanel' && invalidRewardData && Object.keys(invalidRewardData).length !== 0) {
      scanPanelDetailToDisplay = (
        <CouponOrRewardDetail
          description={
            invalidRewardData.rewardCertificate?.rewardAmount
          }
          code={
            invalidRewardData.upc
          }
          loadingStates={uiData.loadingStates}
          isCoupon={false}
          invalidReward={invalidRewardData}
          expiration={
            invalidRewardData.rewardCertificate?.expirationDate
          }
        />
      )
    } else if (uiData.selectedItem === 'rewardPanel' && transactionData.rewardCertificates && transactionData.rewardCertificates.length > 0) {
      const lastRewardAdded = transactionData.rewardCertificates[transactionData.rewardCertificates.length - 1]
      scanPanelDetailToDisplay = (
        <CouponOrRewardDetail
          couponState={
            lastRewardAdded?.expired
          }
          description={
            lastRewardAdded?.rewardAmount
          }
          code={
            lastRewardAdded?.rewardCertificateNumber
          }
          expiration={
            lastRewardAdded?.expirationDate
          }
          rewardCertificateType={
            lastRewardAdded?.rewardCertificateType
          }
          loadingStates={uiData.loadingStates}
          isCoupon={false}
        />
      )
    } else if (uiData.selectedItem === 'associateDiscountPanel') {
      scanPanelDetailToDisplay = (
        <AssociateDiscountDetail isFamilyNight={transactionData?.header?.associateDiscountDetails?.familyNight} />
      )
    } else if (uiData.selectedItem === 'taxExemptPanel') {
      scanPanelDetailToDisplay = (
        <TaxExemptDetail/>
      )
    } else if (uiData.scanError && uiData.scanErrorMessage === 'Returns Error') {
      scanPanelDetailToDisplay = (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ marginTop: 93, marginBottom: 24 }}>
            <ErrorBoxSvg/>
          </View>
          <Text style={{ color: '#B80818', fontSize: 20, lineHeight: 20, marginBottom: 8 }}>
            Sorry, only one receipt can be returned at a time.
          </Text>
          <Text style={{ color: '#B80818', fontSize: 20, lineHeight: 20 }}>
            First complete this transaction before returning more items.
          </Text>
        </View>
      )
    } else if (uiData.selectedItem === 'loyaltyPinpadPhoneLookup') {
      scanPanelDetailToDisplay = (
        <View style={styles.pinpadLoyaltyContainer}>
          <PinpadEntryEnabledSvg/>
          <Text style={{ color: '#000000', fontSize: 16, lineHeight: 24 }}>
              You may continue and scan items.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (uiData.selectedItem === 'loyaltyPinpadPhoneLookup') {
                CefSharp.cancelLoyaltyPhoneInput()
                window.reduxStore.dispatch(receiveUiData({ selectedItem: '' }))
              }
            }}>
            <Text style={styles.buttonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )
    } else if (transactionData && (transactionData.items || transactionData?.originalSaleInformation)) {
      scanPanelDetailToDisplay = (
        returnItemsToParse(transactionData.originalSaleInformation !== undefined)
          .filter(
            item =>
              item.transactionItemIdentifier === uiData.selectedItem
          )
          .map(item => <ProductDetail item={item} key={item.upc} />)
      )
    }
    detailToDisplay = (
      <>
        <ScanPanel
          omniSearchInput={omniSearchInput}
          fetchItem={input => dispatch(fetchItem(input))}
          setOmniSearchInput={setOmniSearchInput}
        />
        {scanPanelDetailToDisplay}
      </>
    )
  }
  return detailToDisplay
}

DetailsPanelController.propTypes = {
  uiData: PropTypes.object,
  transactionData: PropTypes.object,
  invalidRewardData: PropTypes.object
}

const styles = StyleSheet.create({
  pinpadLoyaltyContainer: {
    width: '100%',
    flexGrow: 1,
    flexDirection: 'column',
    minHeight: 300,
    maxHeight: 300,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    minWidth: 173,
    height: 44,
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#2C2C2C'
  },
  buttonText: {
    color: '#2C2C2C',
    fontFamily: 'Archivo',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  }
})

export default DetailsPanelController
