import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

interface RadioButtonLabelProps {
  children: JSX.Element
  style?: StyleProp<ViewStyle>
}

const RadioButtonLabel = ({
  children,
  style = null
}: RadioButtonLabelProps) => (
  <View
    style={[style, styles.labelWrapStyle]}
  >
    {children}
  </View>
)

export default RadioButtonLabel

const styles = StyleSheet.create({
  labelWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center'
  }
})
