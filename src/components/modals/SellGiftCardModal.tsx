import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../actions/uiActions'
import { UiDataTypes } from '../../reducers/uiData'
import Text from '../StyledText'
import ModalBase from './Modal'

interface SellGiftCardModalProps {
  uiData: UiDataTypes
}

// eslint-disable-next-line
const SellGiftCardModal = ({ uiData }: SellGiftCardModalProps): JSX.Element => {
  const dispatch = useDispatch()
  const defaultErrorView = () => {
    if (uiData.storeCreditError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Sorry, store credit cannot be activated for sale.</Text>
          <Text style={[styles.errorText, { marginTop: '1em' }]}>Please use another gift card to continue.</Text>
        </View>
      )
    } else if (uiData.scanError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Sorry, something went wrong.</Text>
          <Text style={styles.errorText}>Please wait a moment and try again.</Text>
          <Text style={[styles.errorText, { marginTop: '1em' }]}>If problem persists, please try another gift card.</Text>
        </View>
      )
    }
  }

  return (
    <ModalBase
      modalName='sellGiftCard'
      modalHeading='Sell a Gift Card'
      headingSize={32}
      modalWidth={636}
      minModalHeight={384}
      dismissable={true}
      onDismiss={() => {
        dispatch(receiveUiData({
          scanError: false,
          scanErrorMessage: null,
          storeCreditError: false
        }))
      }}
    >
      <View testID='sell-gift-card-modal' style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Swipe the gift card on the register.
          </Text>
          {
            uiData.loadingStates.sellGiftCard === true
              ? <ActivityIndicator color={'#000'} style={styles.activityIndicator} />
              : defaultErrorView()
          }
        </View>
      </View>
    </ModalBase>
  )
}

export default SellGiftCardModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    marginTop: -30.25
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 32
  },
  errorText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B10216'
  },
  activityIndicator: {
    marginTop: 32
  }
})
