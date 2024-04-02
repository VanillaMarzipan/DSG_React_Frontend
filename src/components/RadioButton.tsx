import { useEffect } from 'react'
import { LayoutAnimation, StyleSheet, View } from 'react-native'

interface RadioButtonProps {
  animation: boolean
  children: JSX.Element
  marginBottom?: number
}

const RadioButton = ({
  animation,
  children,
  marginBottom = 14
}: RadioButtonProps) => {
  useEffect(() => animation && LayoutAnimation.spring(), [animation])

  return (
    <View
      style={[styles.radioWrap, { marginBottom }]}
    >
      {children}
    </View>
  )
}
export default RadioButton

const styles = StyleSheet.create({
  radioWrap: {
    flexDirection: 'row'
  }
})
