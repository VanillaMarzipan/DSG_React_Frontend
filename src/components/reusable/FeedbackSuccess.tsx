import { useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import Text from '../StyledText'

interface FeedbackSuccessProps {
  onClose: () => void
}

const FeedbackSuccess = ({ onClose }: FeedbackSuccessProps) => {
  const [timeoutIdentifier, setTimeoutIdentifier] = useState(null)

  useEffect(() => {
    setTimeoutIdentifier(setTimeout(onClose, 5000))
  }, [])

  return (
    <>
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultText}>
          Thank you! Your feedback has been submitted successfully.
        </Text>
        <Text style={styles.resultText}>
          This popup will close in 5 seconds...
        </Text>
      </View>
      <View style={styles.resultButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.resultButton]}
          onPress={() => {
            onClose()
            if (timeoutIdentifier) {
              clearTimeout(timeoutIdentifier)
            }
          }}
          testID={'transaction-feedback-success-close'}
        >
          <Text style={styles.sendButtonText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default FeedbackSuccess

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
