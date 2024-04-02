import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../StyledText'
import { useDispatch } from 'react-redux'
import ModalBase from './Modal'
import { UiDataTypes } from '../../reducers/uiData'
import { UPDATE_UI_DATA, updateUiData } from '../../actions/uiActions'

export interface ErrorTypes {
  uiData: UiDataTypes
}

/**
 *  Error Modal
 */
const ErrorModal = ({
  uiData
}: ErrorTypes): JSX.Element => {
  /**
   * Validate inputs are not blank or in an error state. Dispatch authenticate action
   * @param {string} associateNum
   * @param {string} pin
   */
  const refresh = (): void => {
    window.location.reload()
  }

  const dispatch = useDispatch()

  return (
    <ModalBase
      modalName='error'
      modalHeading={uiData.shutdownEndzone ? 'Out of Order' : 'Unexpected Error'}
      headingSize={32}
      modalWidth={636}
      dismissable={false}
      onDismiss={() => {
        dispatch(updateUiData({ clearUpc: true }, UPDATE_UI_DATA))
      }}
    >
      <View testID='error-modal' style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { paddingLeft: 60, paddingRight: 60 }]}>
            {uiData.shutdownEndzone ? 'Endzone is currently disabled.' : "We've run into an unexpected error! Please try clicking refresh and we'll try to recover."}
          </Text>
          <Text style={[styles.text, { paddingLeft: 30, paddingRight: 30 }]}>
            Details: {uiData.modalErrorMessage}
          </Text>
          <Text style={styles.boldText}>
            {uiData.shutdownEndzone ? 'Please use another register.' : 'If this issue persists, please try ringing the transaction on another register.'}
          </Text>
          {uiData.shutdownEndzone
            ? <View style={{ height: 40, marginVertical: 40 }}/>
            : (
              <TouchableOpacity
                testID='refresh-submit'
                onPress={() => {
                  refresh()
                }}
                disabled={uiData.loadingStates.signIn}
              >
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Refresh</Text>
                </View>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </ModalBase>
  )
}

export default ErrorModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'center'
  },
  text: {
    fontSize: 14,
    marginTop: 40,
    lineHeight: 24,
    fontFamily: 'Archivo'
  },
  subheading: {
    fontSize: 16,
    marginTop: 50,
    lineHeight: 24,
    fontFamily: 'Archivo'
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B10216',
    marginTop: 25
  },
  button: {
    width: 260,
    height: 40,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    marginTop: 40,
    marginBottom: 40
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  }
})
