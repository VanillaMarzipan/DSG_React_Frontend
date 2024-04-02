import Text from '../StyledText'
import { Customer } from '../../reducers/loyaltyData'
import LoyaltyRewardsInfo from './LoyaltyRewardsInfo'
import { sendRumRunnerEvent } from '../../utils/rumrunner'
import ProfileSvg from '../svg/ProfileSvg'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { receiveLoyaltyData } from '../../actions/loyaltyActions'
import { receiveUiData } from '../../actions/uiActions'
import { featureFlagEnabled } from '../../reducers/featureFlagData'

interface LoyaltyAccountOptionCardsProps {
  customer: Customer
  selectLoyaltyEditPanel: (phoneNumber: string) => void
}

const LoyaltyAccountOptionCards = ({
  customer,
  selectLoyaltyEditPanel
}: LoyaltyAccountOptionCardsProps) => {
  const dispatch = useDispatch()
  const appliedRewards = useSelector((state) => state.transactionData?.rewardCertificates)
  const pickYourPointsApplied = appliedRewards.some(reward => reward.rewardTypeDescription === 'PickYourPointsOffer')
  const pickYourPointsAvailable = useSelector(state => state.loyaltyData.pickYourPointsAvailable)
  const totalRewardsAvailable = useSelector(state => state.loyaltyData.rewardCountToDisplay)
  const pickYourPointsEnabled = featureFlagEnabled('PickYourPoints')
  let countToDisplay = (pickYourPointsAvailable && pickYourPointsEnabled && !pickYourPointsApplied) ? totalRewardsAvailable - 1 : totalRewardsAvailable
  if (countToDisplay < 0) {
    countToDisplay = 0
  }

  return (
    <>
      <LoyaltyRewardsInfo
        testID='user-profile-card'
        footerText=' User Profile'
        buttonAction={() => {
          console.info('ACTION: components > loyalty > LoyaltyAccountOptionCards > buttonAction (Edit Profile clicked)')
          sendRumRunnerEvent('Edit Profile Clicked', {
            click: 1
          })
          dispatch(receiveUiData({ autofocusTextbox: 'LoyaltyCreateAccount' }))
          selectLoyaltyEditPanel(customer.homePhone)
        }}
      >
        <ProfileSvg/>
      </LoyaltyRewardsInfo>
      <View style={[(countToDisplay === 0 || countToDisplay === undefined) && styles.noRewards]}>
        <LoyaltyRewardsInfo
          testID='rewards-available-card'
          footerText={` Reward${countToDisplay === 1 ? '' : 's'} Available`}
          disabled={countToDisplay === 0 || countToDisplay === undefined}
          buttonAction={() => {
            console.info('ACTION: components > loyalty > LoyaltyAccountOptionCards > buttonAction (Rewards clicked)')
            dispatch(receiveLoyaltyData({
              altScreenName: 'rewards'
            }))
          }}
        >
          <Text testID='reward-count-card'
            style={[styles.rewardsAvailable, countToDisplay === 0 && { color: '#797979' }]}>
            {countToDisplay}
          </Text>
        </LoyaltyRewardsInfo>

      </View>
      {(pickYourPointsAvailable && !appliedRewards?.some(reward => reward?.rewardTypeDescription === 'PickYourPointsOffer') && pickYourPointsEnabled) &&
      <View>
        <LoyaltyRewardsInfo
          testID='pick-your-points-available-card'
          footerText={'3x Points Available'}
          disabled={!pickYourPointsAvailable}
          buttonAction={() => {
            console.info('ACTION: components > loyalty > LoyaltyAccountOptionCards > buttonAction (PickYourPoints clicked)')
            dispatch(receiveLoyaltyData({
              altScreenName: 'pickYourPoints'
            }))
          }}
        >
          <Text testID='pick-your-points-count-card'
            style={styles.rewardsAvailable}>
            {1}
          </Text>
        </LoyaltyRewardsInfo>
      </View>
      }
    </>
  )
}

const styles = StyleSheet.create({
  rewardsAvailable: {
    fontSize: 64,
    fontFamily: 'DSG-Sans-Bold',
    color: '#D76B00'
  },
  noRewards: {
    backgroundColor: '#C8C8C8',
    width: 200,
    height: 192,
    marginRight: 32
  }
})

export default LoyaltyAccountOptionCards
