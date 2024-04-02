import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import PropTypes from 'prop-types'
import CheckMarkSvg from './svg/CheckMarkSvg'
import CloseSvg from './svg/CloseSvg'
import { checkForLoading, receiveUiData } from '../actions/uiActions'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import { overrideCoupon } from '../actions/transactionActions'
import { FeatureFlagTypes } from '../reducers/featureFlagData'
import { LoadingStatesTypes } from '../reducers/uiData'
import { InvalidReward } from '../reducers/loyaltyData'
import BackButton from './BackButton'
import * as LoyaltyActions from '../actions/loyaltyActions'
interface CouponOrRewardDetailProps {
  couponState?: number | boolean
  description: string | number
  code: string
  expiration: string
  rewardCertificateType?: number
  couponPromotionStatus?: number
  isCoupon: boolean
  featureFlags?: FeatureFlagTypes
  loadingStates: LoadingStatesTypes
  invalidReward?: InvalidReward
}

/**
 * Converts date string to MM/DD/YYYY format
 * @param {string} dateString Date string
 * @returns {string} String MM/DD/YYYY
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

const CouponOrRewardDetail = ({
  couponState,
  description,
  code, // contains coupon barcode value
  expiration,
  rewardCertificateType,
  couponPromotionStatus,
  isCoupon,
  featureFlags,
  loadingStates,
  invalidReward
}: CouponOrRewardDetailProps): JSX.Element => {
  const dispatch = useDispatch()
  const isBounceback = !isCoupon && rewardCertificateType === 0
  const isReward = !isCoupon && rewardCertificateType === 1
  const transactionData = useSelector(state => state.transactionData)
  const handleCouponOverride = () => {
    const expiredCouponFeatureFlag = featureFlags.includes('ExpiredCouponManagerOverride')
    if (couponPromotionStatus === 3) {
      dispatch(receiveUiData({ showModal: 'couponOverride' }))
    } else if (couponPromotionStatus === 2) {
      dispatch(overrideCoupon({
        couponCode: code,
        couponOverrideDetail: {
          overrideType: 1
        }
      }, expiredCouponFeatureFlag))
    }
  }

  const hasNoOtherKeysBesidesTempUpc = () => {
    const transactionDataKeys = Object.keys(transactionData)
    if (
      (transactionDataKeys.length === 1 && transactionDataKeys[0] === 'tempUpc') ||
      transactionDataKeys.length === 0
    ) {
      return true
    }
    return false
  }

  return (
    <View style={ styles.container } testID='coupon-panel'>
      {(invalidReward && Object.keys(invalidReward).length !== 0 && hasNoOtherKeysBesidesTempUpc()) && (
        <BackButton
          back={() => {
            dispatch(LoyaltyActions.clearInvalidReward())
            dispatch(receiveUiData({ selectedItem: null }))
          }}
          style={ { top: 0 } }
        />
      )}
      <View style={styles.innerContainer}>
        <View testID='coupon-icon' style={styles.iconContainer}>
          {(couponState === 2 || couponState === 4 || isBounceback || isReward) && (
            <>
              <CheckMarkSvg height={218} width={218} size='large'/>
              <Text style={styles.iconText}>{`${isReward ? 'Reward' : 'Coupon'} Accepted`}</Text>
            </>
          )}
          {(!!invalidReward) && (
            <>
              <View style={styles.fab}>
                <CloseSvg height={140} width={140}/>
              </View>
              <Text style={[styles.iconText, styles.rejected]}>Reward Declined</Text>
              <Text style={[styles.iconText, styles.rejected]}>
                {(() => {
                  switch (invalidReward.reasonCode) {
                  case 1:
                    return 'Inactivated Reward'
                  case 2:
                    return 'Expired Reward'
                  case 3:
                    return 'Reward Already Used'
                  case 4:
                    return 'Reward Certificate Already Added'
                  case 5:
                    return 'Maximum Rewards Added'
                  case 6:
                    return 'Maximum Bounceback Coupons Added'
                  case 7:
                    return 'Maximum PYPDs Added'
                  default:
                    return 'Reward Not Found'
                  }
                })()}
              </Text>
            </>
          )}
          {couponState === 1 && (
            <>
              <View style={styles.fab}>
                <CloseSvg height={140} width={140}/>
              </View>
              <Text style={[styles.iconText, styles.rejected]}>
                Coupon declined
              </Text>
              <Text style={[styles.iconText, styles.rejected]}>
                {couponPromotionStatus === 2
                  ? 'Coupon Expired'
                  : 'Coupon Not Found'}
              </Text>
              {featureFlags?.includes('ManualCoupons') && (
                <TouchableOpacity
                  style={styles.overrideCouponButton}
                  onPress={() => handleCouponOverride()}
                  disabled={checkForLoading(loadingStates)}
                  testID='coupon-override-button'
                >
                  {loadingStates.manualDiscount
                    ? <ActivityIndicator color='#191F1C'/>
                    : (
                      <Text style={styles.overrideCouponButtonText}>
                        OVERRIDE
                      </Text>

                    )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        {couponPromotionStatus !== 0 && couponPromotionStatus !== 3 && (
          <View testID='coupon-detail-container' style={styles.detailContainer}>
            <View style={styles.row}>
              <Text>Description:</Text>
              <Text testID='coupon-detail-description' style={styles.detailValue}>
                {(isReward || !!invalidReward) ? `Reward Certificate${description ? ' ($' + description + ' off)' : ''}` : isBounceback ? `Bounceback Coupon ($${description} off)` : description}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>{(isReward || !!invalidReward) ? 'Reward Code:' : 'Coupon Code:'}</Text>
              <Text
                testID='coupon-detail-code'
                style={styles.detailValue}
              >
                {code}
              </Text>
            </View>
            {expiration && (
              <View style={styles.row}>
                <Text>Expiration:</Text>
                <Text testID='coupon-detail-expiration' style={styles.detailValue}>
                  {formatDate(expiration)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexGrow: 1,
    minHeight: 325,
    justifyContent: 'center'
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconContainer: {
    paddingRight: 32,
    alignItems: 'center',
    width: '50%'
  },
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#006554',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 8
  },
  partial: {
    color: '#BB5811'
  },
  rejected: {
    color: '#AB2635',
    marginBottom: 0,
    marginTop: 8
  },
  fab: {
    width: 160,
    height: 160,
    backgroundColor: '#AB2635',
    borderRadius: 91,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24
  },
  detailContainer: {
    width: '50%',
    marginTop: 86
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16
  },
  detailValue: {
    width: '60%',
    maxWidth: '60%'
  },
  invalid: {
    textTransform: 'uppercase',
    color: '#AB2635'
  },
  overrideCouponButton: {
    borderWidth: 2,
    borderColor: '#191F1C',
    height: 44,
    width: 300,
    display: 'flex',
    justifyContent: 'center',
    marginTop: 31
  },
  overrideCouponButtonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#191F1C',
    textAlign: 'center'
  }
})

CouponOrRewardDetail.propTypes = {
  item: PropTypes.object
}

export default CouponOrRewardDetail
