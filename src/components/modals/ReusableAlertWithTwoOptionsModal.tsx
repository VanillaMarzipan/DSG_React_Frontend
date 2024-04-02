import { StyleSheet, View } from 'react-native'
import SubmitButton from '../reusable/SubmitButton'
import Text from '../StyledText'
import ModalBase from './Modal'

interface ReusableAlertWithTwoOptionsModalProps {
  firstSubHeading: string | JSX.Element
  secondSubHeading?: string | JSX.Element
  belowButtonText?: string | JSX.Element
  leftButtonText: string
  rightButtonText: string
  leftButtonTestID: string
  rightButtonTestID: string
  headingText: string
  onClickLeftButton
  onClickRightButton
  modalName: string
  error: boolean
  errorMessage: string
  onDismiss?: () => void
  leftButtonLoading?: boolean
  rightButtonLoading?: boolean
}

const ReusableAlertWithTwoOptionsModal = ({
  firstSubHeading,
  secondSubHeading,
  belowButtonText,
  leftButtonText,
  rightButtonText,
  leftButtonTestID,
  rightButtonTestID,
  headingText,
  onClickLeftButton,
  onClickRightButton,
  modalName,
  error,
  errorMessage,
  onDismiss,
  leftButtonLoading,
  rightButtonLoading
}: ReusableAlertWithTwoOptionsModalProps): JSX.Element => {
  return (
    <ModalBase
      modalName={modalName}
      modalHeading={headingText}
      headingSize={32}
      modalWidth={636}
      dismissable={false}
      onDismiss={onDismiss}
    >
      <View>
        <Text style={[styles.centeredText]}>
          {firstSubHeading}
        </Text>
        <View style={styles.mainWarningContainer}>
          <Text style={[styles.centeredText, styles.mainWarningText]}>
            {error ? errorMessage : secondSubHeading}
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <SubmitButton
            testID={leftButtonTestID}
            onSubmit={onClickLeftButton}
            buttonLabel={leftButtonText}
            loading={leftButtonLoading}
            disabled={leftButtonLoading || rightButtonLoading}
          />
          <SubmitButton
            testID={rightButtonTestID}
            onSubmit={onClickRightButton}
            buttonLabel={rightButtonText}
            loading={rightButtonLoading}
            customStyles={styles.rightButton}
            customTextStyles={styles.rightButtonText}
            loadingIndicatorColor={'#797979'}
            disabled={leftButtonLoading || rightButtonLoading}
          />
        </View>
        {belowButtonText && (
          <Text style={styles.centeredText}>
            {belowButtonText}
          </Text>
        )}
      </View>
    </ModalBase>
  )
}

export default ReusableAlertWithTwoOptionsModal

const styles = StyleSheet.create({
  centeredText: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 46,
    marginBottom: 25,
    fontSize: 14
  },
  mainWarningContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  mainWarningText: {
    color: '#B10216',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 66,
    maxWidth: 480,
    textAlign: 'center',
    marginTop: 0
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 40
  },
  rightButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4E4C4C',
    borderWidth: 1
  },
  rightButtonText: {
    color: '#191F1C'
  }
})
