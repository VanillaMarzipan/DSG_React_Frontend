import { ReactFragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'
import Text from '../StyledText'
import { useTypedSelector as useSelector } from '../../reducers/reducer'

interface LoyaltyRewardsInfoProps {
  footerText: string
  headerText?: string
  testID: string
  buttonAction: () => void
  children?: ReactFragment
  rewardCertificateNumber?: string
  aboutToExpire?: boolean
  disabled?: boolean
}

const LoyaltyRewardsInfo = ({
  footerText,
  headerText,
  testID,
  buttonAction,
  children,
  rewardCertificateNumber,
  aboutToExpire,
  disabled
}: LoyaltyRewardsInfoProps): JSX.Element => {
  const appliedRewardCertificates = useSelector((state) => state.transactionData.rewardCertificates)
  const [rewardApplied, setRewardApplied] = useState(false)
  useEffect(() => {
    if (appliedRewardCertificates && appliedRewardCertificates.length > 0) {
      let rewardFound = false
      for (let i = 0; i < appliedRewardCertificates.length; i++) {
        if (rewardCertificateNumber === appliedRewardCertificates[i].rewardCertificateNumber) {
          rewardFound = true
          break
        }
      }
      setRewardApplied(rewardFound)
    } else {
      setRewardApplied(false)
    }
  }, [appliedRewardCertificates])
  let centerTextColor = '#006554'
  if (rewardApplied) {
    centerTextColor = '#797979'
  } else if (aboutToExpire || headerText) {
    centerTextColor = '#D76B00'
  }
  return (
    <TouchableOpacity
      onPress={() => {
        console.info('ACTION: components > loyalty > LoyaltyRewardsInfo > onPress', { rewardApplied: rewardApplied })
        if (!rewardApplied) {
          buttonAction()
        }
      }}
      disabled={rewardApplied || disabled}
      style={[styles.card, rewardApplied && { backgroundColor: '#C8C8C8' }]}
      testID={testID}
    >
      {headerText && <Text style={[styles.text, { width: 150 }, rewardApplied && { color: '#797979' }]}>{headerText}</Text>}
      {rewardCertificateNumber
        ? (
          <Text
            style={[styles.enabledRewardText, { color: centerTextColor }]}>
            {children}
          </Text>
        )
        : (children)}
      <Text style={[styles.text, rewardApplied && { color: '#797979' }]}>{footerText}</Text>
    </TouchableOpacity>
  )
}

LoyaltyRewardsInfo.propTypes = {
  footerText: PropTypes.string,
  testID: PropTypes.string,
  buttonText: PropTypes.string
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 192,
    width: 200,
    borderColor: '#EDEDED',
    borderWidth: 1,
    marginRight: 32
  },
  text: {
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 0.5,
    marginVertical: 8,
    width: 110,
    textAlign: 'center'
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
    width: 126,
    borderWidth: 2
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  featureDisabled: {
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3px rgba(64, 64, 64, 0.7)'
      }
    }),
    justifyContent: 'center',
    alignItems: 'center',
    height: 192,
    width: 200,
    borderColor: '#5E6260',
    borderWidth: 1,
    marginRight: 32,
    backgroundColor: '#BABCBB'
  },
  enabledRewardText: {
    fontSize: 64,
    fontFamily: 'DSG-Sans-Bold',
    color: '#D76B00'
  }
})

export default LoyaltyRewardsInfo
