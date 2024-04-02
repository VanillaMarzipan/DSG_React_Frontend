import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import * as CefSharp from '../utils/cefSharp'
import SubmitButton from './reusable/SubmitButton'
import IncrementedGiftCardRefunds from './IncrementedGiftCardRefunds'
import { GetCardDataEventType } from '../reducers/uiData'
import { TransactionDataTypes } from '../reducers/transactionData'

interface CreditPanelProps {
  creditPanelError: string
  creditPanelErrorInstructions: string
  getCardDataEvent: GetCardDataEventType
  isGiftCard: boolean
  processingTempPass: boolean
  transactionData: TransactionDataTypes
  displayInsertCard: boolean
  amount: number
  manuallyEnterGiftCardEnabled: boolean
  isStoreCredit: boolean
  isRefundingOver500OnGiftCards: boolean
}

const CreditPanel = ({
  creditPanelError,
  creditPanelErrorInstructions,
  getCardDataEvent,
  isGiftCard,
  processingTempPass,
  transactionData,
  displayInsertCard,
  amount,
  manuallyEnterGiftCardEnabled,
  isStoreCredit,
  isRefundingOver500OnGiftCards
}: CreditPanelProps) => {
  const [manualEntryClicked, setManualEntryClicked] = useState(false)
  const [manualEntryAborting, setManualEntryAborting] = useState(false)

  useEffect(() => {
    if (creditPanelError) {
      CefSharp.displayProcessingOnPinPad()
    }
  }, [creditPanelError])

  return (
    <View style={styles.mainContainer}>
      {
        isRefundingOver500OnGiftCards &&
        !manualEntryClicked &&
          <IncrementedGiftCardRefunds transactionData={transactionData} creditPanelError={creditPanelError}/>
      }
      {!creditPanelError && !isRefundingOver500OnGiftCards && transactionData && Object.keys(transactionData).length > 0 && (
        <View>
          {transactionData.total.remainingBalance < 0 && getCardDataEvent && (
            <Text style={styles.pinpadText}>
              {`Returning to ${getCardDataEvent.cardBrand} ********${getCardDataEvent.lastFour}`}
            </Text>
          )}
          {isGiftCard && !manualEntryClicked && (
            <Text style={[styles.creditText, { marginTop: 120 }]}>SWIPE GIFT CARD ON {`${transactionData.total.grandTotal < 0 ? 'TERMINAL' : 'PINPAD'}`}</Text>
          )}
          {isGiftCard && manualEntryClicked && (
            <Text style={styles.pinpadText}>HAVE ATHLETE ENTER GIFTCARD NUMBER ON PINPAD</Text>
          )}
          {processingTempPass &&
            <Text style={styles.pinpadText}>Authorizing Temporary Shopping Pass, Please Wait...</Text>
          }
          {displayInsertCard && !getCardDataEvent &&
            <Text style={styles.creditText}>INSERT CARD INTO PINPAD</Text>
          }
          {displayInsertCard && getCardDataEvent && transactionData.total.remainingBalance > 0 &&
            <Text style={styles.pinpadText}>
              {`Tendering with ${getCardDataEvent.cardBrand} ********${getCardDataEvent.lastFour}`}
            </Text>
          }
          {isStoreCredit &&
            <Text style={styles.creditText}>SWIPE STORE CREDIT ON TERMINAL</Text>
          }
          {isGiftCard && manuallyEnterGiftCardEnabled && !manualEntryClicked && transactionData.total.grandTotal > 0 &&
            <View style={styles.manualGiftCardEntryContainer}>
              <SubmitButton
                testID='trigger-manual-giftcard-entry'
                buttonLabel='Gift card won&apos;t swipe'
                disabled={manualEntryAborting}
                onSubmit={async () => {
                  setManualEntryAborting(true)
                  await CefSharp.abortGiftCardOperation()
                    .then(successful => {
                      if (successful) {
                        setManualEntryClicked(true)
                        CefSharp.beginGiftCardTender(
                          amount,
                          transactionData,
                          true
                        )
                      } else {
                        window.reduxStore.dispatch({
                          type: 'UPDATE_UI_DATA',
                          data: {
                            creditPanelError: 'Unable to abort PINpad operation',
                            creditPanelErrorInstructions: 'Press Red X on PINpad and try again.'
                          }
                        })
                      }
                    })
                }}
                customStyles={{
                  width: 333
                }}
              />
            </View>
          }
        </View>
      )}
      {creditPanelError && !isRefundingOver500OnGiftCards && (
        <View>
          <Text
            testID='credit-panel-error'
            style={styles.errorText}
          >
            {creditPanelError}
          </Text>
          <Text
            style={styles.errorMessageText}
          >
            {creditPanelErrorInstructions}
          </Text>
        </View>
      )}
    </View>
  )
}

export default CreditPanel

CreditPanel.propTypes = {
  creditPanelError: PropTypes.string,
  creditPanelErrorInstructions: PropTypes.string,
  getCardDataEvent: PropTypes.object,
  isGiftCard: PropTypes.bool,
  processingTempPass: PropTypes.bool,
  displayInsertCard: PropTypes.bool,
  transactionData: PropTypes.object,
  amount: PropTypes.number,
  manuallyEnterGiftCardEnabled: PropTypes.bool,
  isStoreCredit: PropTypes.bool
}

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    height: 100,
    width: 546
  },
  creditText: {
    alignSelf: 'center',
    fontSize: 20,
    paddingTop: 40,
    fontWeight: '700'
  },
  pinpadText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 128
  },
  manualEntryWait: {
    alignSelf: 'center',
    paddingTop: 40
  },
  manualEntryWaitText: {
    fontSize: 12,
    fontWeight: '700',
    paddingBottom: 20
  },
  manualGiftCardEntryContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 112
  },
  errorText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 18,
    color: '#B10216',
    paddingTop: 40,
    fontWeight: 'bold',
    width: 400
  },
  errorMessageText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 30,
    color: '#333333',
    fontWeight: 'bold'
  }
})
