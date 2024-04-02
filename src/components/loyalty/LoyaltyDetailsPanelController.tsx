import { View } from 'react-native'
import PropTypes from 'prop-types'
import LoyaltyCardsList from './LoyaltyCardsList'
import LoyaltyCustomerPanel from './LoyaltyCustomerPanel'
import LoyaltyAdvancedSearch from './LoyaltyAdvancedSearch'
import LoyaltyScoreCardConfirmation from './LoyaltyScoreCardConfirmation'
import LoyaltyCustomerInfoPanel from './LoyaltyCustomerInfoPanel'
import { connect } from 'react-redux'
import {
  CityStateResponse,
  fetchCityStateByZip,
  createAccount,
  fetchLoyaltyAdvanced,
  modifyAccount,
  selectItemPanel,
  selectLoyaltyAccount,
  selectLoyaltyEditPanel,
  setAdvancedSearch,
  setEnrollment
} from '../../actions/loyaltyActions'
import { formatPhoneNumber } from '../../utils/formatters'
import LoyaltyAvailableRewardCards from './LoyaltyAvailableRewardCards'
import { Customer, LoyaltyDataTypes } from '../../reducers/loyaltyData'
import { TransactionDataTypes } from '../../reducers/transactionData'
import { UiDataTypes } from '../../reducers/uiData'
import { ThemeTypes } from '../../reducers/theme'

interface LoyaltyDetailsPanelControllerInterface {
  loyaltyData: LoyaltyDataTypes
  fetchLoyaltyAdvanced: (firstName: string, lastName: string, zip: string, lastItem: string | number) => void
  fetchCityStateByZip: (zip: string) => Promise<CityStateResponse>
  createAccount: (firstName?: string, lastName?: string, street?: string, apartment?: string, city?: string, state?: string, zip?: string, phone?: string, email?: string, storeNumber?: number) => void
  modifyAccount: (firstName: string, lastName: string, street: string, apartment: string, city: string, state: string, zip: string, phone: string, email: string, storeNumber: number, accountId: string, selectedItem: string, selectedCustomer: Customer) => void
  setEnrollment: () => void
  theme: ThemeTypes
  transactionData: TransactionDataTypes
  selectLoyaltyEditPanel: (phoneNumber: string) => void
  setAdvancedSearch: () => void
  selectLoyaltyAccount: (index: number, loyaltyCustomers: Customer[]) => void
  selectItemPanel: (number: number) => void
  uiData: UiDataTypes
}

const LoyaltyDetailsPanelController = ({
  loyaltyData,
  fetchLoyaltyAdvanced,
  fetchCityStateByZip,
  createAccount,
  modifyAccount,
  setEnrollment,
  theme,
  transactionData,
  selectLoyaltyEditPanel,
  setAdvancedSearch,
  selectLoyaltyAccount,
  selectItemPanel,
  uiData
}: LoyaltyDetailsPanelControllerInterface) => (
  <>
    {loyaltyData.selectedLoyaltyCustomer == null
      ? (
        <>
          {' '}
          {(loyaltyData.altScreenName === 'advanced' ||
                    (loyaltyData.loyaltyCustomers !== null &&
                        loyaltyData.loyaltyCustomers.length === 0 &&
                        loyaltyData.altScreenName !== 'enrollment')) && (
            <LoyaltyAdvancedSearch
              fetchLoyaltyAdvanced={fetchLoyaltyAdvanced}
              setEnrollment={setEnrollment}
              theme={theme}
              lastItem={uiData.lastItem}
              loyaltyData={loyaltyData}
              uiData={uiData}
            />
          )}
          {loyaltyData.altScreenName === 'enrollment' && (
            <LoyaltyCustomerInfoPanel
              storeNumber={transactionData.header?.storeNumber}
              loyaltyData={loyaltyData}
              theme={theme}
              firstName={loyaltyData.firstNameInput}
              lastName={loyaltyData.lastNameInput}
              street={''}
              apartment={''}
              zip={loyaltyData.zipInput}
              email={''}
              city={''}
              state={''}
              selectedCustomer={null}
              accountId={''}
              isVisible={loyaltyData.isNoAccountFound}
              phone={loyaltyData.phoneInput.toUpperCase().startsWith('L') ? '' : loyaltyData.phoneInput}
              phoneOutput={loyaltyData.phoneOutput.toUpperCase().startsWith('L') ? '' : loyaltyData.phoneOutput}
              fetchCityStateByZip={fetchCityStateByZip}
              titleMessage='ScoreCard Enrollment'
              errorMessage='No Account Found'
              createAccount={createAccount}
              modifyAccount={modifyAccount}
              mode='ENROLL'
            />
          )}
          {loyaltyData.loyaltyCustomers !== null &&
                    loyaltyData.loyaltyCustomers.length > 1 &&
                    loyaltyData.altScreenName === null && (
            <View>
              <LoyaltyCardsList
                loyaltyCustomers={loyaltyData.loyaltyCustomers}
                setAdvancedSearch={setAdvancedSearch}
                selectLoyaltyAccount={selectLoyaltyAccount}
                selectItemPanel={selectItemPanel}
                lastItem={uiData.lastItem}
              />
            </View>
          )}
        </>
      )
      : (
        <>
          {loyaltyData.altScreenName === 'confirmation' && (
            <LoyaltyScoreCardConfirmation
              customer={loyaltyData.selectedLoyaltyCustomer}
            />
          )}
          {loyaltyData.altScreenName === 'details' && (
            <LoyaltyCustomerPanel
              customer={loyaltyData.selectedLoyaltyCustomer}
              selectLoyaltyEditPanel={selectLoyaltyEditPanel}
              customerAccountLevelDetails={loyaltyData.accountLevelDetails}
            />
          )}
          {(loyaltyData.altScreenName === 'rewards' || loyaltyData.altScreenName === 'pickYourPoints') && (
            <LoyaltyAvailableRewardCards
              customer={loyaltyData.selectedLoyaltyCustomer}
              screenName={loyaltyData.altScreenName}
            />
          )}
          {loyaltyData.altScreenName === 'edit' && (
            <LoyaltyCustomerInfoPanel
              storeNumber={transactionData.header?.storeNumber}
              loyaltyData={loyaltyData}
              theme={theme}
              firstName={loyaltyData.selectedLoyaltyCustomer.firstName}
              lastName={loyaltyData.selectedLoyaltyCustomer.lastName}
              street={loyaltyData.selectedLoyaltyCustomer.street}
              apartment={loyaltyData.selectedLoyaltyCustomer.apartment}
              zip={
                typeof loyaltyData.selectedLoyaltyCustomer.zip === 'string'
                  ? loyaltyData.selectedLoyaltyCustomer.zip.substring(0, 5)
                  : ''
              }
              city={loyaltyData.selectedLoyaltyCustomer.city}
              state={loyaltyData.selectedLoyaltyCustomer.state}
              email={loyaltyData.selectedLoyaltyCustomer.emailAddress}
              phone={loyaltyData.selectedLoyaltyCustomer.homePhone}
              phoneOutput={formatPhoneNumber(
                loyaltyData.selectedLoyaltyCustomer.homePhone
              )}
              isVisible={loyaltyData.didCreatedAccountExist}
              fetchCityStateByZip={fetchCityStateByZip}
              titleMessage='Edit Account'
              errorMessage='Customer Already Exists, Validate Info'
              createAccount={createAccount}
              modifyAccount={modifyAccount}
              accountId={loyaltyData.selectedLoyaltyCustomer.loyalty}
              mode='MODIFY'
              selectedCustomer={loyaltyData.selectedLoyaltyCustomer}
            />
          )}
        </>
      )}
  </>
)

LoyaltyDetailsPanelController.propTypes = {
  theme: PropTypes.object,
  fetchLoyaltyAdvanced: PropTypes.func,
  transactionData: PropTypes.object,
  loyaltyData: PropTypes.object,
  fetchCityStateByZip: PropTypes.func,
  fetchEnrollment: PropTypes.func,
  modifyAccount: PropTypes.func,
  setEnrollment: PropTypes.func,
  cancelEnrollment: PropTypes.func,
  cancelEdit: PropTypes.func,
  selectLoyaltyEditPanel: PropTypes.func,
  selectLoyaltyAccount: PropTypes.func,
  selectItemPanel: PropTypes.func,
  setAdvancedSearch: PropTypes.func,
  registerData: PropTypes.object,
  uiData: PropTypes.object
}

const mapStateToProps = state => ({
  theme: state.theme,
  transactionData: state.transactionData,
  loyaltyData: state.loyaltyData,
  uiData: state.uiData
})

const mapDispatchToProps = {
  fetchLoyaltyAdvanced,
  fetchCityStateByZip,
  createAccount,
  modifyAccount,
  setEnrollment,
  selectLoyaltyEditPanel,
  setAdvancedSearch,
  selectLoyaltyAccount,
  selectItemPanel
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoyaltyDetailsPanelController)
