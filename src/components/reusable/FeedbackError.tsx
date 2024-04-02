import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Text from '../StyledText'

interface FeedbackErrorProps {
  errorMessage: string
  onClose: () => void
  onRetry: () => void
}

const FeedbackError = ({
  errorMessage,
  onClose,
  onRetry
}: FeedbackErrorProps) => {
  return (
    <>
      <View style={styles.resultTextContainer}>
        <Text style={[styles.resultText, { color: '#B10216' }]}>
          {errorMessage}
        </Text>
        <Text style={[styles.resultText, { color: '#B10216' }]}>
          Please wait a moment and try again later.
        </Text>
      </View>
      <View style={styles.resultButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.resultButton, {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#191F1C'
          }]}
          onPress={() => {
            onClose()
          }}
        >
          <Text style={[styles.sendButtonText, { color: '#191F1C' }]}>CLOSE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resultButton]}
          onPress={() => {
            onRetry()
          }}
          testID={'transaction-feedback-error-retry'}
        >
          <Text style={styles.sendButtonText}>SUBMIT AGAIN</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default FeedbackError

const styles = StyleSheet.create({
  resultTextContainer: {
    height: 191,
    justifyContent: 'center'
  },
  resultText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 8
  },
  resultButton: {
    backgroundColor: '#BB5811',
    marginHorizontal: 16,
    width: 230
  },
  resultButtonContainer: {
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    height: 52,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Archivo-Bold',
    letterSpacing: 1.5
  }
})
