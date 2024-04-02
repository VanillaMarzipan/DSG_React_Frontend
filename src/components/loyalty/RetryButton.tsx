import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import RetrySvg from '../svg/RetrySvg'
import { RetryLoyaltyEnrollOrLookupParams } from '../../reducers/loyaltyData'

interface RetryButtonProps {
  retryType: string
  retryParameters: RetryLoyaltyEnrollOrLookupParams
  fetchLoyalty: (phoneInput: string, callOrigin?: string, enrollmentLookupStep?: number) => void
  fetchLoyaltyAdvanced: (firstName: string, lastName: string, zip: string, lastItem?: string) => void
  fetchLoyaltyByAccountNumber: (accountNumber: string, updateTransaction: boolean) => void
  createAccount: (firstName?: string, lastName?: string, street?: string, apartment?: string, city?: string, state?: string, zip?: string, phone?: string, email?: string, storeNumber?: number) => void
}

const RetryButton = ({
  retryType,
  retryParameters,
  fetchLoyalty,
  fetchLoyaltyAdvanced,
  fetchLoyaltyByAccountNumber,
  createAccount
}: RetryButtonProps): JSX.Element => (
  <TouchableOpacity
    onPress={() => {
      console.info('ACTION: components > loyalty > RetryButton > onPress', { retryType: retryType })
      switch (retryType) {
      case 'phone':
        fetchLoyalty(retryParameters.phone)
        break
      case 'advanced':
        fetchLoyaltyAdvanced(retryParameters.firstName, retryParameters.lastName, retryParameters.zip, retryParameters.lastItem)
        break
      case 'accountNumber':
        fetchLoyaltyByAccountNumber(retryParameters.loyaltyAccount, true)
        break
      case 'enroll':
        createAccount(
          retryParameters.firstName,
          retryParameters.lastName,
          retryParameters.street,
          retryParameters.apartment,
          retryParameters.city,
          retryParameters.state,
          retryParameters.zip,
          retryParameters.phone,
          retryParameters.email,
          retryParameters.storeNumber
        )
        break
      }
    }}
    style={styles.retryButton}
  >
    <RetrySvg/>

    <Text style={styles.retryText}>retry</Text>
  </TouchableOpacity>
)
const styles = StyleSheet.create({
  retryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    marginLeft: -42
  },
  retryText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1.5
  }
})

RetryButton.propTypes = {
  retryType: PropTypes.string,
  retryParameters: PropTypes.array,
  fetchLoyalty: PropTypes.func,
  fetchLoyaltyAdvanced: PropTypes.func,
  fetchLoyaltyByAccountNumber: PropTypes.func,
  createAccount: PropTypes.func
}

export default RetryButton
