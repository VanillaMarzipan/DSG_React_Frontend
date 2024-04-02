import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import CouponCheckSvg from './svg/CouponCheckSvg'

export interface CouponOverrideButtonProps {
  buttonText
  onPress
  testId
  couponTypeIcon
  isSelected
  disabled
}

const CouponOverrideButton = ({
  buttonText,
  onPress,
  testId,
  couponTypeIcon,
  isSelected,
  disabled
}: CouponOverrideButtonProps) => {
  return (
    <TouchableOpacity
      disabled={isSelected || disabled}
      testID={testId}
      style={[styles.container, isSelected && styles.isSelectedContainer, disabled && { backgroundColor: '#C8C8C8', borderWidth: 0 }]}
      onPress={onPress}
    >
      <View style={{ marginLeft: 8 }}>
        {couponTypeIcon}
      </View>
      <Text style={[styles.text, isSelected && styles.isSelectedText, disabled && { color: '#4F4F4F' }]}>{buttonText}</Text>
      <View style={{ height: 24, width: 24, marginRight: 8 }}>
        {isSelected && <CouponCheckSvg/>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 182,
    height: 46,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#FFFFFE',
    border: '1px solid #000000',
    justifyContent: 'space-around'
  },
  isSelectedContainer: {
    backgroundColor: '#006554'

  },
  text: {
    width: 116,
    fontSize: 14,
    letterSpacing: 1.5,
    textAlign: 'center',
    color: '#000000',
    fontFamily: 'Archivo-Bold'
  },
  isSelectedText: {
    color: '#FFFFFE'
  }
})

export default CouponOverrideButton
