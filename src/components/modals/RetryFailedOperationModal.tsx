import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import Text from '../StyledText'
import ModalBase from './Modal'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { GetModalTimeout, GetModalTitle, GetModalUserMessage } from '../../utils/retryModalHelpers'

export interface FinalizeFailingTypes {
  showModal: string | boolean
}

const RetryFailedOperationModal = ({
  showModal
}: FinalizeFailingTypes): JSX.Element => {
  const [timeToCallServiceDesk, setTimeToCallServiceDesk] = useState(false)

  const failedOperation = useSelector(state => state.uiData.failedOperation)
  const registerData = useSelector(state => state.registerData)
  const transactionNumber = useSelector(state => state.transactionData?.header?.transactionNumber)

  useEffect(() => {
    if (showModal === 'retryFailedOperation') {
      setTimeout(() => setTimeToCallServiceDesk(true), GetModalTimeout(failedOperation))
    }
  }, [showModal])

  return (
    <ModalBase
      modalName='retryFailedOperation'
      modalHeading={GetModalTitle(failedOperation)}
      headingSize={32}
      modalWidth={636}
      dismissable={false}>
      <View testID='error-modal' style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            {GetModalUserMessage(failedOperation, timeToCallServiceDesk)}
          </Text>
          <Text style={styles.boldText}>
            Please do not reboot your register during this time.
          </Text>
        </View>
        {timeToCallServiceDesk
          ? (
            <View style={styles.largeTextContainer}>
              <Text style={styles.largeText}>
              Please Call the Service Desk at
              </Text>
              <Text style={[styles.largeText, { marginBottom: 35 }]}>
              866-418-3456
              </Text>
              <Text style={styles.smallText}>
                <Text style={styles.registerDetails}>
                Store: {registerData?.storeNumber}
                </Text>
                <Text style={styles.registerDetails}>
                Register: {registerData?.registerNumber}
                </Text>
                {transactionNumber && (
                  <Text>
                  Transaction: {transactionNumber}
                  </Text>
                )}
              </Text>
            </View>
          )
          : (
            <View style={{ display: 'flex', height: '30%', marginBottom: 30 }}>
              <ActivityIndicator
                color='#2E2E2E'
                size='large'
              />
            </View>
          )}
      </View>
    </ModalBase>
  )
}

export default RetryFailedOperationModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'center'
  },
  text: {
    fontSize: 14,
    marginTop: 46,
    marginBottom: 35,
    marginLeft: 60,
    marginRight: 60,
    lineHeight: 24,
    fontFamily: 'Archivo'
  },
  largeText: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 50,
    marginLeft: 20,
    marginRight: 20,
    textAlign: 'center'
  },
  smallText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 35,
    textAlign: 'center'
  },
  largeTextContainer: {
    justifyContent: 'flex-start'
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B10216',
    marginRight: 60,
    marginLeft: 60,
    marginBottom: 35
  },
  registerDetails: {
    marginRight: 12
  }
})
