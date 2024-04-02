import PropTypes from 'prop-types'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import { Customer } from '../../reducers/loyaltyData'
import { sendAppInsightsEvent } from '../../utils/appInsights'

interface LoyaltyInfoCardProps {
  firstName: string
  lastName: string
  city: string
  state: string
  zip: string
  index: number
  street: string
  selectLoyaltyAccount: (index: number, loyaltyCustomers: Customer[]) => void
  selectItemPanel: (number) => void
  loyaltyCustomers: Customer[]
  testID: string
  lastItem: string | number
}

const LoyaltyInfoCard = ({
  selectLoyaltyAccount,
  selectItemPanel,
  index,
  loyaltyCustomers,
  city,
  state,
  zip,
  firstName,
  lastName,
  street,
  testID,
  lastItem
}: LoyaltyInfoCardProps) => (
  <TouchableOpacity
    testID={testID}
    onPress={() => {
      console.info('ACTION: components > loyalty > LoyaltyInfoCard > onPress (' + testID + ')')
      selectLoyaltyAccount(index, loyaltyCustomers)
      sendAppInsightsEvent('SelectLoyaltyAccount', {
        customer: loyaltyCustomers && loyaltyCustomers[index]
      })
      selectItemPanel(lastItem)
    }}
  >
    <View style={styles.card}>
      <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
      <View style={styles.divider}/>
      <View style={styles.address}>
        <Text style={styles.addressText}>{street}</Text>
        <Text style={styles.addressText}>{`${city}, ${state} ${zip.slice(
          0,
          5
        )}`}</Text>
      </View>
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
      }
    }),
    height: 164,
    width: 166,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EC8B23'
  },
  name: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 16,
    paddingHorizontal: 8
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E3E4E4'
  },
  address: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 4
  },
  addressText: {
    fontSize: 12,
    lineHeight: 20
  }
})

LoyaltyInfoCard.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  zip: PropTypes.string,
  index: PropTypes.number,
  street: PropTypes.string,
  selectLoyaltyAccount: PropTypes.func,
  selectItemPanel: PropTypes.func,
  loyaltyCustomers: PropTypes.array,
  lastItem: PropTypes.number,
  state: PropTypes.string,
  city: PropTypes.string
}

export default LoyaltyInfoCard
