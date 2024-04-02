import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ModalBase from './Modal'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import * as UiActions from '../../actions/uiActions'
import { useDispatch } from 'react-redux'
import { postVoidTransaction } from '../../actions/transactionActions'

const PostVoidModal = (): JSX.Element => {
  const errorMessage = useSelector(state => state.uiData.modalErrorMessage)
  const loadingStates = useSelector(state => state.uiData.loadingStates)
  const serializedTransaction = useSelector(state => state.printReceiptData?.serializedTransaction)
  const storeInfo = useSelector(state => state.storeInfo)
  const associateData = useSelector(state => state.associateData)

  const dispatch = useDispatch()

  return (
    <ModalBase
      modalName={'postVoid'}
      modalHeading='POST VOID'
      headingSize={32}
      modalWidth={636}
      dismissable={true}
      onDismiss={() => dispatch(UiActions.updateLoadingStates({ postVoid: false }))}>
      <View testID='post-void-modal'>
        <Text style={styles.text}>Are you sure you want to post-void the last transaction</Text>
        {errorMessage != null && <Text style={styles.errorText}>{errorMessage}</Text>}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            disabled={UiActions.checkForLoading(loadingStates)}
            onPress={() => dispatch({
              type: 'UPDATE_UI_DATA',
              data: { showModal: false, modalErrorMessage: null }
            })}
          >
            <View
              testID='cancel-button'
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>NO, CANCEL</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={UiActions.checkForLoading(loadingStates)}
            onPress={() => dispatch(postVoidTransaction(serializedTransaction, storeInfo, associateData))}
          >
            <View
              testID='submit-button'
              style={styles.submitButton}>
              <Text style={styles.submitButtonText}>YES, POST-VOID</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ModalBase>
  )
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    alignSelf: 'center',
    marginBottom: 85,
    marginTop: 51,
    fontSize: 16,
    fontWeight: '400'
  },
  buttonsContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 129
  },
  cancelButton: {
    backgroundColor: 'white',
    width: 181,
    height: 44,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#191f1c',
    borderWidth: 2
  },
  submitButton: {
    backgroundColor: '#BB5811',
    width: 181,
    height: 44,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#191f1c',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  submitButtonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  errorText: {
    flex: 1,
    fontSize: 16,
    color: 'red',
    alignSelf: 'center'
  }
})

export default PostVoidModal
