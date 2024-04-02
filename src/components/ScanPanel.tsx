import { createRef, Component, RefObject } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import TextInput from './TextInput'
import BarcodeScanner from './BarcodeScanner'
import { connect } from 'react-redux'
import { checkForLoading, receiveUiData } from '../actions/uiActions'
import { receiveLoyaltyData } from '../actions/loyaltyActions'
import { UiDataTypes } from '../reducers/uiData'
import { ThemeTypes } from '../reducers/theme'
import { RegisterDataTypes } from '../reducers/registerData'
import { AssociateDataTypes } from '../reducers/associateData'
import { LoyaltyDataTypes } from '../reducers/loyaltyData'
import * as CefSharp from '../utils/cefSharp'
import Queue from '../utils/queue'
import { Item, TransactionCustomerType } from '../reducers/transactionData'
import { AppThunk } from '../reducers'
import AddScorecardSvg from './svg/AddScorecardSvg'
import { featureFlagEnabled } from '../reducers/featureFlagData'

// Related to allowing cefSharp to call methods for item scanning
declare global {
  interface Window {
    scanPanel
  }
}

interface ScanPanelProps {
  registerData: RegisterDataTypes
  associateData: AssociateDataTypes
  receiveUiData: (data: UiDataTypes) => AppThunk
  receiveLoyaltyData: (data: LoyaltyDataTypes) => AppThunk
  uiData: UiDataTypes
  theme: ThemeTypes
  home?: boolean
  loyaltyData: LoyaltyDataTypes
  transactionItems: Item[]
  msrAccountNumber?: string
  msrExpiryDate?: string
  omniSearchInput: string
  fetchItem: (input: string) => void
  setOmniSearchInput: (input: string) => void
  transactionCustomer: TransactionCustomerType
}

class ScanPanel extends Component<ScanPanelProps> {
  public static propTypes = {}
  private _textInput: RefObject<TextInput>
  private _isMounted = false

  constructor (props) {
    super(props)
    this._textInput = createRef()
  }

  state = {
    scan: false,
    focus: null
  }

  /**
   * Sets the value for the scan input and resets the scanError and errorMessage to false in Redux if they are not already false
   * @param {string} value Input value
   */
  handleInput = (value: string): void => {
    this.props.setOmniSearchInput(value)
    if (this.props.uiData.scanError || this.props.uiData.errorMessage) {
      this.props.receiveUiData({ scanError: false, errorMessage: null })
    }
  }

  // Sets input focus on mount
  componentDidMount = async () => {
    this._isMounted = true
    if (this.props.uiData.showModal === false && this.props.uiData.autofocusTextbox === 'OmniSearch') this.props.receiveUiData({ autofocusTextbox: 'OmniSearch' })
    setTimeout(() => {
      this._textInput &&
      this._textInput.current &&
      this._textInput.current.focus()
    }, 10)

    if (Platform.OS === 'web') {
      await CefSharp.setBarcodeScannerEnabled(true)
    }
    // Clears previous UI errors when a new transaction begins
    this.props.receiveUiData({ scanError: false, error: false, errorMessage: null, priceEditActive: false })
    if (this.props.loyaltyData.accountLevelDetails && !this.props.loyaltyData.selectedLoyaltyCustomer) {
      this.props.receiveLoyaltyData({ accountLevelDetails: null })
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false
  }

  componentDidUpdate = (prevProps) => {
    const shouldTakeFocus = () => {
      return (
        (this.props.uiData.autofocusTextbox === 'OmniSearch' || this.props.uiData.autofocusTextbox === null) &&
        !this.props.uiData.priceEditActive &&
        (
          this.props.uiData.showModal === false ||
          (prevProps.transactionItems?.length !== this.props.transactionItems?.length) ||
          (prevProps.loyaltyData.selectedLoyaltyCustomer !== this.props.loyaltyData.selectedLoyaltyCustomer)
        )
      )
    }
    if (
      prevProps.uiData.showModal &&
      !this.props.uiData.showModal &&
      !this.props.uiData.priceEditActive
    ) {
      this.props.receiveUiData({
        autofocusTextbox: 'OmniSearch'
      })
    }
    // Clear input if item was added successfully; keep value if there was an error
    if (this.props.uiData.clearUpc) {
      if (this.props.omniSearchInput !== '') {
        this.props.setOmniSearchInput('')
      } else {
        this.props.receiveUiData({ clearUpc: false })
      }
    }
    if (Queue.allowDequeue && (this.props.uiData.loadingStates.omniSearch !== null || this.props.uiData.loadingStates.addLoyaltyToTransaction)) {
      setTimeout(() => Queue.dequeue(), 1)
    }
    if (shouldTakeFocus()) {
      setTimeout(() => {
        if (shouldTakeFocus()) {
          this._textInput &&
          this._textInput.current &&
          this._textInput.current.focus()
        }
      }, 500)
    }
  }

  render () {
    const { home, theme, uiData } = this.props
    const { scan, focus } = this.state
    const isWeb = Platform.OS !== 'ios' && Platform.OS !== 'android'
    return (
      <View
        nativeID='scan-panel'
        style={[
          styles.root,
          {
            borderBottomWidth: !home ? 2 : 0,
            height: !home ? 206 : '100%'
          }
        ]}
      >
        <View
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {
            featureFlagEnabled('AddScorecardPrompt') && !this.props.transactionCustomer &&
            <View style={styles.scorecardPromptContainer}>
              <View style={styles.scorecardPromptIconContainer}>
                <AddScorecardSvg/>
              </View>
              <Text style={styles.scorecardPromptText}>PLEASE ASK THE ATHLETE FOR THEIR SCORECARD.</Text>
            </View>
          }
          {!scan
            ? (
              <View style={styles.container}>
                <View
                  style={{ marginBottom: 14 }}
                >
                  <TextInput
                    nativeID='scan'
                    disabled={this.props.uiData.priceEditActive}
                    ref={this._textInput}
                    labelBackgroundColor={theme.backgroundColor}
                    label='Scan or Type Phone, Scorecard, Associate ID, or UPC'
                    style={[
                      (home && styles.textField) || styles.textFieldNonHome,
                      {
                        borderColor: uiData.scanError
                          ? '#8d0d02'
                          : focus && '#006554'
                      }
                    ]}
                    error={!uiData.showAddAssociateDiscount && uiData.scanError}
                    value={this.props.omniSearchInput}
                    onChangeText={text => this.handleInput(text)}
                    mode='outlined'
                    onSubmitEditing={() => {
                      !checkForLoading(uiData.loadingStates) && this.props.fetchItem(this.props.omniSearchInput)
                    }}
                    color={theme.fontColor}
                  />
                  {uiData.scanError && !uiData.showAddAssociateDiscount && (
                    <View style={{ position: 'absolute', bottom: -10 }}>
                      <Text testID='barcode-error' style={styles.scanErrorMessage}>
                        {uiData.scanErrorMessage}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    width: '100%',
                    maxWidth: 440,
                    flexDirection: 'row',
                    justifyContent: 'flex-end'
                  }}
                >
                  {!isWeb && (
                    <TouchableOpacity
                      onPress={() => this.setState({ scan: !scan })}
                    >
                      <View style={styles.button}>
                        <Text style={styles.buttonText}>
                          {scan ? 'Cancel' : 'Scan'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {uiData.errorMessage && (
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        flex: 1,
                        marginRight: 8
                      }}
                    >
                      <Text testID='barcode-error' style={{ color: '#8d0d02' }}>
                        {uiData.errorMessage}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    testID='submit'
                    onPress={() => {
                      if (!checkForLoading(uiData.loadingStates)) {
                        this.props.fetchItem(this.props.omniSearchInput)
                      }
                    }}
                    disabled={uiData.loadingStates.omniSearch !== null || this.props.uiData?.priceEditActive}
                  >
                    <View
                      style={[(home && styles.button) || styles.smallerButton, (this.props.uiData?.priceEditActive || uiData.loadingStates.omniSearch !== null) && { backgroundColor: '#C8C8C8' }]}
                    >
                      {uiData.loadingStates.omniSearch !== null
                        ? (
                          <ActivityIndicator color='#ffffff'/>
                        )
                        : (
                          <Text style={styles.buttonText}>Enter</Text>
                        )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )
            : (
              <BarcodeScanner/>
            )}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    borderColor: '#a7a7a7',
    minHeight: 248,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  container: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  textField: {
    minWidth: 414,
    height: 64,
    marginBottom: 5,
    borderRadius: 0
  },
  textFieldNonHome: {
    minWidth: 414,
    height: 64,
    marginBottom: 5,
    borderRadius: 0
  },
  smallerButton: {
    minWidth: 207,
    height: 42,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  button: {
    minWidth: 414,
    height: 52,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  scanErrorMessage: {
    fontSize: 10,
    color: '#8d0d02'
  },
  scorecardPromptContainer: {
    backgroundColor: '#E0F1EE',
    height: 44,
    width: 413,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#006554',
    borderWidth: 2
  },
  scorecardPromptIconContainer: {
    marginHorizontal: 14
  },
  scorecardPromptText: {
    fontSize: 12,
    color: '#006554',
    fontWeight: '700'
  }
})

ScanPanel.propTypes = {
  home: PropTypes.bool,
  loading: PropTypes.bool,
  receiveUiData: PropTypes.func,
  receiveLoyaltyData: PropTypes.func,
  uiData: PropTypes.object,
  theme: PropTypes.object,
  registerData: PropTypes.object,
  associateData: PropTypes.object,
  loyaltyData: PropTypes.object,
  transactionItems: PropTypes.array,
  transactionCustomer: PropTypes.object
}

const mapStateToProps = state => ({
  associateData: state.associateData,
  theme: state.theme,
  registerData: state.registerData,
  storeInfo: state.storeInfo,
  uiData: state.uiData,
  loyaltyData: state.loyaltyData,
  transactionItems: state.transactionData.items,
  transactionCustomer: state.transactionData.customer
})

const mapDispatchToProps = {
  receiveUiData,
  receiveLoyaltyData
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanPanel)
