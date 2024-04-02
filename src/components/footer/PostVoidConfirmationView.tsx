import { View, StyleSheet } from 'react-native'
import { useTypedSelector } from '../../reducers/reducer'
import { TransactionDataTypes } from '../../reducers/transactionData'
import { returnListOfNonRepeatingTenders } from '../../utils/formatters'
import SubmitButton from '../reusable/SubmitButton'
import Text from '../StyledText'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { receivePrintReceiptData } from '../../actions/printReceiptActions'
import { postVoidTransaction } from '../../actions/transactionActions'
import { receiveUiData } from '../../actions/uiActions'
import { receiveManagerOverrideInfo } from '../../actions/managerOverrideActions'
import { featureFlagEnabled } from '../../reducers/featureFlagData'

interface PostVoidConfirmationViewProps {
  transactionFoundViaBarcode: TransactionDataTypes
  setPostVoidLastTransactionSelected: (boolean) => void
  postVoidLoading: boolean
}

const PostVoidConfirmationView = ({
  transactionFoundViaBarcode,
  setPostVoidLastTransactionSelected,
  postVoidLoading
}: PostVoidConfirmationViewProps): JSX.Element => {
  const dispatch = useDispatch()
  const serializedLastTransaction = useTypedSelector(state => state.printReceiptData.serializedTransaction)
  const parsedLastTransaction: TransactionDataTypes = JSON.parse(serializedLastTransaction)
  const storeInfo = useTypedSelector(state => state.storeInfo)
  const associateData = useTypedSelector(state => state.associateData)
  const [transactionToDisplay, setTransactionToDisplay] = useState<TransactionDataTypes>(parsedLastTransaction)
  useEffect(() => {
    if (transactionFoundViaBarcode) {
      setTransactionToDisplay(transactionFoundViaBarcode)
    }
    console.info('PostVoidConfirmationView > transactionDisplayed: ', JSON.stringify(transactionFoundViaBarcode))
  }, [])
  return (
    <View>
      {
        transactionToDisplay
          ? (
            <>
              <Text
                style={[styles.dateText, styles.centeredText]}
              >
                {moment(transactionToDisplay.header.endDateTime).format('M/D/YYYY, h:mm A')}
              </Text>
              <Text style={[styles.totalText, styles.standardVerticalMargin, styles.centeredText]}>
                TOTAL: ${transactionToDisplay.total.grandTotal.toFixed(2)}
              </Text>
              <View style={styles.transactionOriginInfo}>
                <Text style={[styles.centeredText]}>
                  STORE: {transactionToDisplay.header.storeNumber}
                </Text>
                <Text style={{ marginHorizontal: 32 }}>
                  TRANS: {transactionToDisplay.header.transactionNumber}
                </Text>
                <Text>
                  REGISTER: {transactionToDisplay.header.registerNumber}
                </Text>
              </View>
              <Text style={[styles.centeredText, { marginBottom: 40 }]}>
                TENDERS: {returnListOfNonRepeatingTenders(transactionToDisplay.tenders)}
              </Text>
            </>
          )
          : (
            <></>
          )
      }
      <Text
        style={styles.centeredText}
      >
        Are you sure you want to post-void this transaction?
      </Text>
      <View style={{ alignItems: 'center' }}>
        <SubmitButton
          testID='confirm-enhanced-post-void'
          onSubmit={() => {
            console.info('PostVoidConfirmationView > onPress > Confirm Post Void')
            // TODO: Deploy manager override modal here instead and call postVoidTransaction after manager override
            if (featureFlagEnabled('PostVoidManagerOverride') && !associateData.isManager) {
              const managerOverrideInfo = {
                ManagerOverrideData: JSON.stringify(transactionToDisplay),
                ManagerOverrideType: 4
              }
              dispatch(receiveManagerOverrideInfo([managerOverrideInfo]))
            } else {
              dispatch(postVoidTransaction(JSON.stringify(transactionToDisplay), storeInfo, associateData))
            }
          }}
          loading={postVoidLoading}
          disabled={postVoidLoading || transactionToDisplay?.tenders?.length === 0}
          buttonLabel='YES, POST-VOID'
          customStyles={styles.confirmPostVoid}
        />
        <SubmitButton
          testID='cancel-enhanced-post-void'
          onSubmit={() => {
            console.info('PostVoidConfirmationView > onPress > Cancel Post Void')
            dispatch(receivePrintReceiptData({
              transactionFoundViaBarcode: null
            }))
            setPostVoidLastTransactionSelected(false)
            dispatch(receiveUiData({
              scanEvent: null
            }))
          }}
          buttonLabel='NO, GO BACK'
          disabled={postVoidLoading}
          customStyles={styles.cancelPostVoid}
          customTextStyles={{
            color: '#2C2C2C'
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centeredText: {
    textAlign: 'center'
  },
  standardVerticalMargin: {
    marginVertical: 20
  },
  dateText: {
    fontSize: 16,
    marginTop: 86
  },
  totalText: {
    fontSize: 24,
    fontWeight: '700'
  },
  transactionOriginInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  confirmPostVoid: {
    marginTop: 31,
    marginBottom: 20
  },
  cancelPostVoid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2C2C2C'
  }
})

export default PostVoidConfirmationView
