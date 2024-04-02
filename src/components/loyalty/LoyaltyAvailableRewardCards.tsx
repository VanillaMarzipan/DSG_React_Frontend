import LoyaltyRewardsInfo from './LoyaltyRewardsInfo'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import moment from 'moment'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { omniSearch } from '../../actions/transactionActions'
import { Customer } from '../../reducers/loyaltyData'
import { selectLoyaltyEditPanel, UPDATE_LOYALTY_DATA, updateLoyaltyData } from '../../actions/loyaltyActions'
import CloseModalButtonSvg from '../svg/CloseModalSvg'

interface LoyaltyAvailableRewardCardsProps {
  customer: Customer
  screenName: string
}

const LoyaltyAvailableRewardCards = ({
  customer,
  screenName
}: LoyaltyAvailableRewardCardsProps) => {
  const dispatch = useDispatch()
  const availableRewards = useSelector((state) => state.loyaltyData?.accountLevelDetails?.rewards)
  const todaysDate = new Date()
  const associateId = useSelector((state) => state.associateData.associateId)
  const { loadingStates } = useSelector(state => state.uiData)

  const handleDate = (date) => new Date(date)
  return (
    <View style={styles.mainContainer}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          testID='loyalty-edit-athlete'
          onPress={() => {
            console.info('ACTION: components > loyalty > LoyaltyAvailableRewardCards > onPress (selectLoyaltyEditPanel)')
            selectLoyaltyEditPanel(customer.homePhone)
          }}
        >
          <Text
            style={styles.name}
          >{`${customer.firstName} ${customer.lastName}`}</Text>
          <Text style={styles.panelTitle}>{screenName === 'rewards' ? 'Rewards Available' : 'Pick Your Own Points'} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID='reward-panel-exit-button'
          style={styles.closeContainer}
          onPress={() => dispatch(updateLoyaltyData({ altScreenName: 'details' }, UPDATE_LOYALTY_DATA))}>
          <CloseModalButtonSvg/>
        </TouchableOpacity>
      </View>
      <View style={styles.cardsContainer}>
        {
          availableRewards &&
          availableRewards.map((reward, index) => {
            if (screenName === 'rewards' && reward?.rewardTypeDescription === 'RewardCertificate') {
              return (<View key={'reward-card-' + index}>
                <LoyaltyRewardsInfo
                  testID={'reward-card-' + index}
                  footerText={' Expires ' +
                    moment(reward.expirationDate)
                      .local()
                      .format('MM/DD/YY')}
                  buttonAction={() => {
                    console.info('ACTION: components > loyalty > LoyaltyAvailableRewardCards > buttonAction (omniSearch)')
                    dispatch(omniSearch(reward.rewardCertificateNumber, associateId, 'loyaltyPanel'))
                  }}
                  disabled={loadingStates.omniSearch !== null}
                  rewardCertificateNumber={reward.rewardCertificateNumber}
                  aboutToExpire={(handleDate(reward.expirationDate).getTime() - todaysDate.getTime()) / (1000 * 3600 * 24) <= 14}
                >
                  <Text testID={'reward-cert-amount-' + index}>
                    {'$' + reward.rewardAmount}
                  </Text>
                </LoyaltyRewardsInfo>
              </View>
              )
            } else if (screenName === 'pickYourPoints' && reward?.rewardTypeDescription === 'PickYourPointsOffer') {
              return (
                <View key={'reward-card-' + index}>
                  <LoyaltyRewardsInfo
                    testID={'pick-your-points-card-' + index}
                    footerText={'Points'}
                    headerText={'Redeem For'}
                    buttonAction={() => {
                      console.info('ACTION: components > loyalty > LoyaltyAvailableRewardCards > buttonAction (omniSearch)')
                      dispatch(omniSearch(reward.rewardCertificateNumber, associateId, 'loyaltyPanel'))
                    }}
                    disabled={loadingStates.omniSearch !== null}
                    rewardCertificateNumber={reward.rewardCertificateNumber}
                    aboutToExpire={(handleDate(reward.expirationDate).getTime() - todaysDate.getTime()) / (1000 * 3600 * 24) <= 14}
                  >
                    <Text testID={'reward-cert-amount-' + index}>
                      3X
                    </Text>
                  </LoyaltyRewardsInfo>
                </View>
              )
            } else {
              return null
            }
          })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'column',
    width: '100%'
  },
  name: {
    fontFamily: 'Archivo',
    fontWeight: 'bold',
    color: '#000000DE',
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 26
  },
  closeContainer: {
    marginTop: 19,
    marginRight: 24,
    alignItems: 'center'
  }
})

export default LoyaltyAvailableRewardCards
