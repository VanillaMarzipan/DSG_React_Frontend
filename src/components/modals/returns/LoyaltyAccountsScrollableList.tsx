import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { getReturnsByLoyaltyAction, receiveReturnData } from '../../../actions/returnActions'
import { Customer } from '../../../reducers/loyaltyData'
import { useTypedSelector } from '../../../reducers/reducer'
import { LoadingStatesTypes } from '../../../reducers/uiData'
import BackButton from '../../BackButton'
import Text from '../../StyledText'

interface LoyaltyAccountsScrollableListProps {
  loyaltyAccountsFound: Array<Customer>
  phoneInput: string
  loadingStates: LoadingStatesTypes
}

const LoyaltyAccountsScrollableList = ({
  loyaltyAccountsFound,
  phoneInput,
  loadingStates
}: LoyaltyAccountsScrollableListProps): JSX.Element => {
  const dispatch = useDispatch()
  const { returnsLoyaltyAccountsFoundError, selectedReturnsLoyaltyAccount } = useTypedSelector(state => state.returnData)
  return (
    <View style={styles.container}>
      <View style={styles.decoratorLine}/>
      {loadingStates.getReturns
        ? (
          <ActivityIndicator style={styles.activityIndicator}/>
        )
        : (
          <BackButton
            back={() => { dispatch(receiveReturnData({ returnsLoyaltyAccountsFound: null, returnsLoyaltyAccountsFoundError: null })) }}
            size='small'
            style={styles.backButtonCustom}
            customFontSize={16}
          />
        )}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCountText}>
          Showing {loyaltyAccountsFound?.length} results for {phoneInput}
        </Text>
      </View>
      {returnsLoyaltyAccountsFoundError
        ? (
          <Text style={styles.errorText}>
            No orders found for {selectedReturnsLoyaltyAccount.firstName} {selectedReturnsLoyaltyAccount.lastName}
          </Text>)
        : <View style={styles.errorTextSpacer}/>}
      <FlatList
        data={loyaltyAccountsFound}
        scrollEnabled={true}
        style={styles.flatListCustom}
        extraData={{ loyaltyAccountsFound }}
        keyExtractor={(item, index) => 'loyalty-account-returns' + index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            key={`loyalty-customer-returns-${index}`}
            style={styles.athleteTouchableOpacity}
            disabled={loadingStates.getReturns}
            onPress={() => {
              dispatch(getReturnsByLoyaltyAction(item.loyalty))
              dispatch(receiveReturnData({ selectedReturnsLoyaltyAccount: item, returnsLoyaltyAccountsFoundError: null }))
            }}
          >
            <View
              style={styles.athleteDetailsContainer}
              testID={'loyalty-customer' + index}>
              <Text style={styles.boldText}>
                {item.firstName + ' ' + item.lastName}
              </Text>
              <Text>
                {item.emailAddress}
              </Text>
              <Text>
                {item.street}
              </Text>
              <Text>
                {item.city + ', ' + item.state + ' ' + item.zip}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    minHeight: 500
  },
  errorText: {
    color: '#B10216',
    marginBottom: 8,
    fontWeight: '700'
  },
  resultsCountContainer: {
    marginTop: 20,
    width: '90%',
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 19
  },
  decoratorLine: {
    height: 1,
    backgroundColor: '#797979',
    width: '90%'
  },
  activityIndicator: {
    position: 'absolute',
    left: 50,
    top: 20
  },
  backButtonCustom: {
    left: 20
  },
  resultsCountText: {
    color: '#666666'
  },
  errorTextSpacer: {
    height: 23
  },
  athleteDetailsContainer: {
    padding: 16
  },
  flatListCustom: {
    height: 400
  },
  athleteTouchableOpacity: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 460
  },
  boldText: {
    fontWeight: '700'
  }
})

export default LoyaltyAccountsScrollableList
