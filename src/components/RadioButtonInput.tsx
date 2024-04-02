import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface RadioButtonInputProps {
  buttonSize?: number
  buttonOuterSize?: number
  buttonOuterColor?: string
  borderWidth?: number
  buttonInnerColor?: string
  buttonColor?: string
  isSelected: boolean
  disabled?: boolean
  accessibilityLabel: string
  accessible: boolean
  testID?: string
  value: string | number
  index: number | string
  onPress: (value: string | number, index: number | string) => void
}

const RadioButtonInput = ({
  buttonSize = 20,
  buttonOuterSize,
  buttonOuterColor,
  borderWidth = 3,
  buttonInnerColor,
  buttonColor = '#191F1C',
  isSelected,
  disabled = false,
  accessibilityLabel,
  accessible,
  testID,
  value,
  index,
  onPress
}: RadioButtonInputProps) => {
  const styles = StyleSheet.create({
    radio: {
      justifyContent: 'center',
      alignItems: 'center',
      width: buttonOuterSize || buttonSize + 8,
      height: buttonOuterSize || buttonSize + 8,
      alignSelf: 'center',
      borderColor: buttonOuterColor || buttonColor,
      borderRadius: (buttonOuterSize || buttonSize + 8) / 2,
      borderWidth: borderWidth,
      marginRight: 8
    },
    radioInner: {
      borderRadius: buttonSize / 2,
      width: isSelected ? buttonSize : 0,
      height: isSelected ? buttonSize : 0,
      backgroundColor: buttonInnerColor || buttonColor
    }
  })

  return (
    <TouchableOpacity
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      testID={'radio:' + testID.toString()}
      style={styles.radio}
      onPress={() => {
        console.info('ACTION: components > RadioButtonInput > onPress', { testID: testID, value: value, index: index })
        onPress(value, index)
      }}
      disabled={disabled}
    >
      <View
        testID={'radio-select:' + testID.toString()}
        style={styles.radioInner}/>
    </TouchableOpacity>
  )
}

export default RadioButtonInput
