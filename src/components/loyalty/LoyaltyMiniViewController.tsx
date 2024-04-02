import { useEffect } from 'react'
import LoyaltyPhoneLookup from './LoyaltyPhoneLookup'
import ScorecardSvg from '../svg/ScorecardSvg'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import CloseSvg from '../svg/CloseSvg'
import { useDispatch } from 'react-redux'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import {
  clearCustomer,
  createAccount,
  fetchLoyalty,
  fetchLoyaltyAdvanced,
  fetchLoyaltyByAccountNumber,
  removeLoyaltyAccount,
  selectLoyaltyPanel,
  setAdvancedSearch,
  UPDATE_LOYALTY_DATA,
  updateLoyaltyData,
  receiveLoyaltyData,
  clearInvalidReward
} from '../../actions/loyaltyActions'
import RetryButton from './RetryButton'
import { ThemeTypes } from '../../reducers/theme'
import { UiDataTypes } from '../../reducers/uiData'
import { LoyaltyDataTypes } from '../../reducers/loyaltyData'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import { RewardCertificates, TransactionCustomerType } from '../../reducers/transactionData'
import { back, checkForLoading, receiveUiData } from '../../actions/uiActions'
import { featureFlagEnabled } from '../../reducers/featureFlagData'
import { sendAppInsightsEvent } from '../../utils/appInsights'
import NikeSwooshLogo from '../svg/NikeSwooshLogo'
import { getConfigurationValue } from '../../actions/configurationActions'
import { clearTransactionData } from '../../actions/transactionActions'

interface LoyaltyMiniViewControllerState {
  theme: ThemeTypes
  loyaltyData: LoyaltyDataTypes
  uiData: UiDataTypes
  appliedRewards: RewardCertificates[]
  transactionCustomer: TransactionCustomerType
  transactionStatus: number
}

interface LoyaltyMiniViewControllerProps {
  // eslint-disable-next-line
  tenders: any[]
}

const LoyaltyMiniViewController = ({ tenders }: LoyaltyMiniViewControllerProps) => {
  const dispatch = useDispatch()
  const {
    theme,
    loyaltyData,
    uiData,
    appliedRewards,
    transactionCustomer,
    transactionStatus
  }: LoyaltyMiniViewControllerState = useSelector(state => ({
    theme: state.theme,
    loyaltyData: state.loyaltyData,
    uiData: state.uiData,
    appliedRewards: state.transactionData.rewardCertificates,
    transactionCustomer: state.transactionData.customer,
    transactionStatus: state.transactionData.header?.transactionStatus
  }))
  const priceEditActive = useSelector(state => state.uiData.priceEditActive)

  const styles = StyleSheet.create({
    root: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: 20,
      display: !loyaltyData.selectedLoyaltyCustomer && uiData.activePanel !== 'scanDetailsPanel' && uiData.activePanel !== 'initialScanPanel' ? 'none' : 'flex',
      borderLeftWidth:
        loyaltyData.altScreenName === 'advanced' &&
        uiData.selectedItem === 'LOYALTY_PANEL'
          ? 8
          : 0,
      borderLeftColor: '#006554'
    },
    innerContainer: {
      flex: 1,
      borderBottomWidth: 1,
      borderColor: '#979797',
      marginRight: 32,
      marginLeft:
        loyaltyData.altScreenName === 'advanced' &&
        uiData.selectedItem === 'LOYALTY_PANEL'
          ? 24
          : 32,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      height: 80
    },
    clearButton: {
      marginTop: 8,
      marginRight: 16
    },
    clearText: {
      color: priceEditActive ? '#C8C8C8' : '#DA1600',
      fontSize: 10,
      textTransform: 'uppercase',
      fontWeight: 'bold'
    },
    loyaltyCard: {
      marginTop: 5,
      marginLeft: 10,
      marginRight: 32
    },
    athleteName: {
      fontSize: 16,
      fontWeight: '700'
    },
    errorContainer: {
      flex: 1,
      flexDirection: 'column',
      flexWrap: 'wrap'
    },
    error: {
      fontSize: 16,
      color: '#DA1600',
      letterSpacing: 0.5,
      marginLeft: -8,
      maxWidth: 200
    },
    badgeContainer: {
      backgroundColor: '#C50C21',
      height: 20,
      width: 20,
      position: 'absolute',
      left: 0,
      top: -4,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 4
    },
    badgeText: {
      color: 'white',
      fontFamily: 'Archivo',
      fontSize: 16,
      fontWeight: '700'
    },
    pointsBalance: {
      fontSize: 14,
      lineHeight: 18,
      marginTop: 8
    },
    nameAndLogoContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    blackCircularBackdrop: {
      width: 20,
      height: 20,
      backgroundColor: '#000000',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8
    }
  })
  const pickYourPointsAvailable = loyaltyData.accountLevelDetails?.rewards?.some(reward => reward?.rewardTypeDescription === 'PickYourPointsOffer')
  // Clears no account found message if teammate clicks complete transaction and abandons loyalty search
  useEffect(() => {
    if (loyaltyData.isNoAccountFound && checkForLoading(uiData.loadingStates) && uiData.selectedItem !== 'LOYALTY_PANEL') {
      dispatch(
        clearCustomer(loyaltyData.altScreenName, uiData.lastItem)
      )
    }
  }, [uiData.loadingStates])

  let rewardCountToDisplay = loyaltyData.accountLevelDetails?.rewards?.length
  if (pickYourPointsAvailable && !featureFlagEnabled('PickYourPoints')) rewardCountToDisplay -= 1
  if (appliedRewards) {
    appliedRewards.forEach(appliedReward => {
      const rewards = loyaltyData.accountLevelDetails?.rewards
      rewards && rewards.forEach(availableReward => {
        if (availableReward.rewardCertificateNumber === appliedReward.rewardCertificateNumber) {
          rewardCountToDisplay--
        }
      })
    })
  }

  useEffect(() => {
    dispatch(
      updateLoyaltyData({
        rewardCountToDisplay: rewardCountToDisplay || 0,
        pickYourPointsAvailable: pickYourPointsAvailable
      }, UPDATE_LOYALTY_DATA))
  }, [loyaltyData.selectedLoyaltyCustomer, appliedRewards, rewardCountToDisplay])

  const disableScorecardIcon = (
    tenders?.length > 0 ||
    (uiData.activePanel !== 'scanDetailsPanel' && uiData.activePanel !== 'paymentPanel') ||
    priceEditActive ||
    uiData.pinpadPhoneEntryEnabled ||
    uiData.loadingStates.loyaltyLookup
  )

  const handlePressScoreCardIcon = () => {
    console.info('ACTION: components > loyalty > LoyaltyMiniViewController > onPress (loyalty-card)', { priceEditActive: priceEditActive })
    dispatch(receiveUiData({ selectedItem: 'LOYALTY_PANEL' }))
    if (uiData.activePanel !== 'scanDetailsPanel') {
      dispatch(back('warrantyPanel'))
      dispatch(selectLoyaltyPanel())
    } else {
      if (transactionCustomer && Object.keys(transactionCustomer).length > 0) {
        dispatch(selectLoyaltyPanel())
      } else if (loyaltyData.loyaltyCustomers === null || loyaltyData.loyaltyCustomers.length === 0) {
        dispatch(setAdvancedSearch())
      } else {
        dispatch(receiveLoyaltyData({ altScreenName: null }))
        dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
      }
    }
  }
  return (
    <View testID='loyalty-mini-controller' style={styles.root}>
      <View style={styles.innerContainer}>

        {(loyaltyData.loyaltyCustomers?.length >= 0 || loyaltyData.selectedLoyaltyCustomer) &&
        !loyaltyData.loyaltyError &&
        uiData.activePanel === 'scanDetailsPanel' &&
        !uiData.loadingStates.addLoyaltyToTransaction && !uiData.loadingStates.removeLoyaltyAccount
          ? (
            <TouchableOpacity
              testID='loyalty-clear-button'
              disabled={disableScorecardIcon}
              onPress={() => {
                console.info('ACTION: components > loyalty > LoyaltyMiniViewController > onPress (loyalty-clear-button)', { priceEditActive: priceEditActive })
                if (!priceEditActive) {
                  sendRumRunnerEvent('Scorecard Lookup Cleared', { cleared: 1 })
                  sendAppInsightsEvent('ScorecardLookupCleared')
                  dispatch(clearInvalidReward())
                  if (transactionCustomer && Object.keys(transactionCustomer).length > 0) {
                    dispatch(
                      removeLoyaltyAccount(
                        loyaltyData.altScreenName,
                        uiData.lastItem
                      )
                    )
                  } else {
                    dispatch(clearCustomer(loyaltyData.altScreenName, uiData.lastItem))
                    dispatch(receiveUiData({ autofocusTextbox: 'OmniSearch' }))
                    dispatch(receiveLoyaltyData({ loyaltyCustomers: null }))
                    if (transactionStatus === 0) {
                      dispatch(clearTransactionData())
                      dispatch(receiveUiData({ activePanel: 'initialScanPanel', selectedItem: null }))
                    }
                  }
                }
              }}
              style={styles.clearButton}
            >
              <CloseSvg color={priceEditActive ? '#C8C8C8' : '#C50C21'}/>
              <Text style={styles.clearText}>clear</Text>
            </TouchableOpacity>
          )
          : <View style={{ height: 41, width: 49 }}/>}

        {loyaltyData.loyaltyError && (
          <RetryButton
            retryParameters={loyaltyData.retryParameters}
            retryType={loyaltyData.retryType}
            createAccount={createAccount}
            fetchLoyaltyAdvanced={(firstName, lastName, zip, lastItem) =>
              dispatch(fetchLoyaltyAdvanced(firstName, lastName, zip, lastItem))
            }
            fetchLoyaltyByAccountNumber={accountNumber =>
              dispatch(fetchLoyaltyByAccountNumber(accountNumber))
            }
            fetchLoyalty={phoneInput => dispatch(fetchLoyalty(phoneInput))}
          />
        )}

        {(uiData.loadingStates.loyaltyLookup ||
          uiData.loadingStates.addLoyaltyToTransaction ||
          uiData.loadingStates.removeLoyaltyAccount) && (
          <View style={{ position: 'absolute', width: 50 }}>
            <ActivityIndicator/>
          </View>)}

        <View>
          {loyaltyData.selectedLoyaltyCustomer &&
            rewardCountToDisplay > 0 &&
            !disableScorecardIcon &&
              <View testID='reward-count-badge' style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {rewardCountToDisplay}
                </Text>
              </View>
          }
          <TouchableOpacity
            style={styles.loyaltyCard}
            testID='loyalty-card'
            disabled={disableScorecardIcon}
            onPress={() => {
              handlePressScoreCardIcon()
            }}>
            {ScorecardSvg(loyaltyData?.accountLevelDetails?.tier?.tier, disableScorecardIcon)}
          </TouchableOpacity>
        </View>

        {loyaltyData.loyaltyError && (
          <View style={styles.errorContainer}>
            <Text style={styles.error} numberOfLines={1}>
              Cannot lookup Scorecards at this time
            </Text>
          </View>
        )}

        {!loyaltyData.selectedLoyaltyCustomer &&
         !loyaltyData.loyaltyError &&
         !loyaltyData.loyaltyCustomers &&
         (
           <LoyaltyPhoneLookup
             selectedItem={uiData.selectedItem}
             altScreenName={loyaltyData.altScreenName}
             phoneInput={loyaltyData.phoneInput}
             phoneOutput={loyaltyData.phoneOutput}
             theme={theme}
             fetchLoyalty={phoneInput => {
               sendRumRunnerEvent('Scorecard Phone Lookup - Scorecard bar', { phone: phoneInput })
               sendAppInsightsEvent('ScorecardBarPhoneLookup', { phone: phoneInput })
               dispatch(fetchLoyalty(phoneInput))
             }}
           />
         )}

        {
          loyaltyData.loyaltyCustomers?.length === 0 && !loyaltyData.selectedLoyaltyCustomer && (
            <Text style={styles.error} numberOfLines={2}>
              {`No Account Found for ${loyaltyData.lastPhoneLookup ||
              loyaltyData.lastCustomerLookup}`}
            </Text>
          )
        }

        {
          loyaltyData.loyaltyCustomers?.length > 1 && !loyaltyData.selectedLoyaltyCustomer && (
            <TouchableOpacity
              disabled={uiData.activePanel !== 'scanDetailsPanel' && uiData.activePanel !== 'initialScanPanel'}
              style={{ flex: 1 }}
              onPress={() => {
                handlePressScoreCardIcon()
              }}
            >
              <Text style={styles.error}>
                Multiple Accounts Found for
              </Text>
              <Text style={styles.error}>
                {`${loyaltyData.phoneOutput}`}
              </Text>
            </TouchableOpacity>)
        }

        {
          loyaltyData.selectedLoyaltyCustomer && !uiData.loadingStates.addLoyaltyToTransaction &&
            <TouchableOpacity
              disabled={(uiData.activePanel !== 'scanDetailsPanel' && uiData.activePanel !== 'initialScanPanel') || disableScorecardIcon}
              testID='loyalty-select-athlete'
              onPress={() => {
                console.info('ACTION: components > loyalty > LoyaltyMiniViewController > onPress (loyalty-select-athlete)', { activePanel: uiData?.activePanel })
                uiData.activePanel === 'scanDetailsPanel' &&
                  dispatch(selectLoyaltyPanel())
              }}
            >
              <View style={styles.nameAndLogoContainer}>
                <Text style={styles.athleteName}>
                  {loyaltyData?.selectedLoyaltyCustomer?.firstName +
                      ' ' +
                      loyaltyData?.selectedLoyaltyCustomer?.lastName}
                </Text>
                {
                  getConfigurationValue('nikeconnectcampaign', 'enableLoyaltyTags') &&
                  loyaltyData.accountLevelDetails?.partyAttributes?.attributes?.nike_connected &&
                    <View
                      testID='nike-connected-miniview-icon'
                      style={styles.blackCircularBackdrop}>
                      <NikeSwooshLogo height={5.5} width={15.4} />
                    </View>
                }
              </View>
              {
                uiData.loadingStates.accountLevelDetails && (
                  <ActivityIndicator/>
                )
              }
              <View style={{ flex: 1, flexDirection: 'row' }}>
                {
                  loyaltyData?.accountLevelDetails?.points?.currentPointBalance > 0 && (
                    <Text testID='points-balance' style={styles.pointsBalance}>
                      Points Balance: {
                        loyaltyData?.accountLevelDetails && (
                          loyaltyData.accountLevelDetails?.points.currentPointBalance
                        )
                      }
                    </Text>
                  )
                }
              </View>
            </TouchableOpacity>
        }
      </View>
    </View>
  )
}

export default LoyaltyMiniViewController
