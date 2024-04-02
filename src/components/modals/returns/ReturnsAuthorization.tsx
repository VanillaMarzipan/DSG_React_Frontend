import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../../StyledText'
import PropTypes from 'prop-types'
import ModalBase from '../Modal'
import { TransactionDataTypes } from '../../../reducers/transactionData'
import { UiDataTypes } from '../../../reducers/uiData'
import { ReturnDataType } from '../../../reducers/returnData'
import { useDispatch } from 'react-redux'
import {
  voidTransaction
} from '../../../actions/transactionActions'
import * as UiActions from '../../../actions/uiActions'
import { completeTransaction } from '../../../actions/uiActions'
import NonReceiptedReturnAuthorization from './NonReceiptedReturnAuthorization'

export interface ReturnsAuthorizationModalProps {
  transactionData: TransactionDataTypes
  uiData: UiDataTypes
  returnData: ReturnDataType
}

const ReturnsAuthorizationModal = ({ ...props }: ReturnsAuthorizationModalProps): JSX.Element => {
  const dispatch = useDispatch()

  const handleReturnsAuthVoidTransaction = (transactionData: TransactionDataTypes, returnData: ReturnDataType, uiData: UiDataTypes) => {
    dispatch(
      UiActions.receiveUiData({
        showModal: false
      })
    )
    dispatch(
      voidTransaction(transactionData, returnData, uiData.loadingStates.void)
    )
  }

  const completeTransactionAction = () => {
    if (props.transactionData.total.grandTotal === 0) {
      dispatch(UiActions.receiveUiData({
        activePanel: 'changePanel',
        tenderType: 'Total',
        showModal: false
      }))
    } else {
      dispatch(
        UiActions.receiveUiData({
          showModal: false,
          callRefundMethodsAfterReturnsAuth: true
        })
      )
      dispatch(
        completeTransaction()
      )
    }
  }
  const isNonReceiptedReturn = props.transactionData.originalSaleInformation && props.transactionData.originalSaleInformation[0].returnOriginationType === 1
  const getBodyContent = (props: ReturnsAuthorizationModalProps) => {
    if (props.uiData.loadingStates.authorizeReturn) {
      return (
        <>
          <Text style={styles.subHeading}>
            {'Please wait while return is authorized'}
          </Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator color='#000'/>
          </View>
        </>
      )
    } else if (props.returnData && props.returnData.returnAuthorizationData && props.returnData.returnAuthorizationData.action.toLowerCase() === 'warned') {
      return (
        <View>
          <Text style={styles.title}>
            {props.returnData.returnAuthorizationData.screenMessage}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.sendButton]}
              onPress={() => { handleReturnsAuthVoidTransaction(props.transactionData, props.returnData, props.uiData) }}
            >
              <Text testID='return-auth-modal-void-btn' style={styles.sendButtonText}>VOID</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.sendButton]}
              onPress={() => {
                completeTransactionAction()
              }}
            >
              <Text testID='return-auth-modal-complete-btn' style={styles.sendButtonText}>COMPLETE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else if (props.returnData && props.returnData.returnAuthorizationData && props.returnData.returnAuthorizationData.action.toLowerCase() === 'denied') {
      return (
        <View>
          <Text style={styles.title}>
            {props.returnData.returnAuthorizationData.screenMessage}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.sendButton]}
              onPress={() => {
                handleReturnsAuthVoidTransaction(props.transactionData, props.returnData, props.uiData)
              }}
            >
              <Text testID='return-auth-modal-void-btn' style={styles.sendButtonText}>VOID</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else if (isNonReceiptedReturn) {
      return (
        <NonReceiptedReturnAuthorization
          returnData={props.returnData}
          grandTotal={props.transactionData.total.grandTotal}
          showModal={props.uiData.showModal}
        />
      )
    } else {
      return (<View>
        <Text style={styles.title}>
          Unexpected response from returns authorization
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.sendButton]}
            onPress={() => { completeTransactionAction() }}
          >
            <Text testID='return-auth-modal-complete-btn' style={styles.sendButtonText}>COMPLETE</Text>
          </TouchableOpacity>
        </View>
      </View>)
    }
  }
  return (
    <ModalBase
      modalHeading={isNonReceiptedReturn ? 'No Receipt Return' : 'Authorizing Return Transaction'}
      modalName='returnsAuthorization'
      headingSize={32}
      dismissable={
        isNonReceiptedReturn &&
        (props.returnData.returnAuthorizationData === null || (props.returnData.returnAuthorizationData?.action && props.returnData.returnAuthorizationData.action === 'manual-entry')) &&
        !props.uiData.loadingStates.authorizeReturn}
      backdropDismissable={false}
      onDismiss={() => {
        console.info('OnDismiss > ReturnsAuthorizationModal')
        if (props.returnData.returnAuthorizationData === null && isNonReceiptedReturn) {
          handleReturnsAuthVoidTransaction(props.transactionData, props.returnData, props.uiData)
        }
      }}
    >
      {getBodyContent(props)}
    </ModalBase>
  )
}

export default ReturnsAuthorizationModal

const styles = StyleSheet.create({
  modalPanel: {
    width: 603,
    height: 384,
    marginTop: 159,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingLeft: 20,
    borderRadius: 5
  },
  subHeading: {
    marginLeft: 34,
    marginTop: 8,
    fontSize: 12
  },
  title: {
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 50,
    fontSize: 18
  },
  button: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  sendButton: {
    backgroundColor: '#BB5811',
    marginTop: 15,
    marginBottom: 15,
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 7,
    marginRight: 7
  },
  sendButtonDisabled: {
    backgroundColor: '#666666'
  },
  sendButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold'
  },
  loadingContainer: {
    marginBottom: 100,
    marginTop: 100
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 7,
    marginRight: 7
  }
})

ReturnsAuthorizationModal.propTypes = {
  transactionData: PropTypes.object,
  uiData: PropTypes.object,
  returnData: PropTypes.object
}
