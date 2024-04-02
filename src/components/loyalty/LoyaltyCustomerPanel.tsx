import PropTypes from 'prop-types'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import { AccountLevelDetails, Customer } from '../../reducers/loyaltyData'
import LoyaltyAccountOptionCards from './LoyaltyAccountOptionCards'
import NikeConnectedLoyaltyTag from '../reusable/NikeConnectedLoyaltyTag'

interface LoyaltyCustomerPanelProps {
  selectLoyaltyEditPanel: (phoneNumber: string) => void
  customer: Customer
  customerAccountLevelDetails: AccountLevelDetails
}

const LoyaltyCustomerPanel = ({
  selectLoyaltyEditPanel,
  customer,
  customerAccountLevelDetails
}: LoyaltyCustomerPanelProps) => {
  return (
    <View style={styles.panel}>
      <View style={styles.nameAndTagWrapper}>
        <TouchableOpacity
          testID='loyalty-edit-athlete'
          onPress={() => {
            console.info('ACTION: components > loyalty > LoyaltyCustomerPanel > onPress (loyalty-edit-athlete)')
            selectLoyaltyEditPanel(customer.homePhone)
          }}
        >
          <Text
            style={styles.name}
          >{`${customer.firstName} ${customer.lastName}`}</Text>
        </TouchableOpacity>
        {
          customerAccountLevelDetails?.partyAttributes?.attributes?.nike_connected &&
            <View style={{ marginLeft: 12 }}>
              <NikeConnectedLoyaltyTag popupPosition='bottom'/>
            </View>
        }
      </View>
      <View style={styles.cards}>
        <LoyaltyAccountOptionCards
          customer={customer}
          selectLoyaltyEditPanel={selectLoyaltyEditPanel}
        />
      </View>
    </View>
  )
}
LoyaltyCustomerPanel.propTypes = {
  customer: PropTypes.object,
  selectLoyaltyEditPanel: PropTypes.func
}

const styles = StyleSheet.create({
  panel: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%'
  },
  nameAndTagWrapper: {
    flexDirection:
    'row',
    marginTop: 16,
    marginBottom: 32,
    zIndex: 1
  },
  name: {
    fontFamily: 'Archivo',
    fontWeight: 'bold',
    fontSize: 24
  },
  cards: {
    flexDirection: 'row'
  },
  count: {
    fontFamily: 'DSG-Sans-Bold',
    fontSize: 64,
    color: '#D76B00'
  }
})

export default LoyaltyCustomerPanel
