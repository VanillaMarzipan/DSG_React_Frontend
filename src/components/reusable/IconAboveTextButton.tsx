import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import Text from '../StyledText'

export interface IconAboveTextButtonProps {
  style?
  ref?
  icon
  buttonText
  onPress?
  buttonTextStyle?
  testId?
  disabled?
  loading?
}

const IconAboveTextButton = ({
  style,
  ref,
  icon,
  buttonText,
  onPress,
  buttonTextStyle,
  testId,
  disabled,
  loading
}: IconAboveTextButtonProps) => {
  return (
    <TouchableOpacity
      testID={testId}
      style={[styles.container, style]}
      onPress={onPress}
      ref={ref}
      disabled={disabled}
    >
      {icon}
      {loading
        ? (
          <ActivityIndicator style={{ marginTop: '8px', marginBottom: '8px' }}/>
        )
        : (
          <Text style={[styles.text, buttonTextStyle, disabled && { color: '#C8C8C8' }]}>{buttonText}</Text>
        )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 100,
    zIndex: 3
  },
  text: {
    width: 116,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16
  }
})

export default IconAboveTextButton
