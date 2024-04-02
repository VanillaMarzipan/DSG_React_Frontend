import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { CssStyleType } from '../BackButton'
import Text from '../StyledText'

interface SubmitButtonProps {
  testID: string
  disabled?: boolean
  onSubmit: () => void
  loading?: boolean
  buttonLabel: string
  customStyles?: CssStyleType | Array<CssStyleType>
  customTextStyles?: CssStyleType | Array<CssStyleType>
  loadingIndicatorColor?: string
}

const SubmitButton = ({
  testID,
  disabled,
  onSubmit,
  loading,
  buttonLabel,
  customStyles,
  customTextStyles,
  loadingIndicatorColor
}: SubmitButtonProps): JSX.Element => {
  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled || loading}
      style={[styles.container, customStyles && customStyles, (disabled || loading) && { backgroundColor: '#c8c8c8' }]}
      onPress={() => {
        onSubmit()
      }}
    >
      <Text style={[styles.buttonText, disabled && { color: '#4F4F4F' }, customTextStyles && customTextStyles]}>
        {loading
          ? <ActivityIndicator color={loadingIndicatorColor !== undefined ? loadingIndicatorColor : '#FFFFFF'}/>
          : (
            buttonLabel
          )}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 230,
    height: 44,
    backgroundColor: '#C57135',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 45
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }
})

export default SubmitButton
