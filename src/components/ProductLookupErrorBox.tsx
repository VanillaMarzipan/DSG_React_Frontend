import { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import Text from './StyledText'

interface ProductLookupErrorBoxProps {
  errorMessage: string
  onRetry: () => void
  marginTop?: number
}

const ProductLookupErrorBox = ({
  errorMessage,
  onRetry,
  marginTop = 0
}: ProductLookupErrorBoxProps) => {
  useEffect(() => {
    sendRumRunnerEvent('Product Lookup Error', {
      error: errorMessage
    })
  }, [])

  return (
    <View style={[styles.detailsBox, { paddingTop: 64, justifyContent: 'center', marginTop }]}>
      <View style={styles.errorMessage}>
        <Text style={[styles.errorText, { fontWeight: 'bold' }]}>ERROR</Text>
        <Text style={styles.errorText}>{ errorMessage }</Text>
        <Text style={styles.errorText}>Please wait a moment and try again.</Text>
        <TouchableOpacity
          testID='product-lookup-retry-button'
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={{ fontFamily: 'Archivo-Bold', letterSpacing: 1.5, textTransform: 'uppercase' }}>Retry</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 116, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, letterSpacing: 0.5, lineHeight: 24, textAlign: 'center' }}>
            {'If the problem persists, please call the service desk at (724)\u00A0273-3456, toll-free: (866)\u00A0418-3456'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  detailsBox: {
    backgroundColor: 'white',
    width: '100%',
    marginBottom: 16,
    padding: 16
  },
  errorMessage: {
    paddingLeft: 32,
    paddingRight: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 18,
    color: '#B10216',
    letterSpacing: 0.5,
    lineHeight: 42,
    textAlign: 'center'
  },
  retryButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 72,
    marginTop: 32,
    borderColor: '#191F1C',
    borderWidth: 1,
    borderRadius: 2
  }
})

export default ProductLookupErrorBox
