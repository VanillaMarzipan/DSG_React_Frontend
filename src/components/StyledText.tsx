import { StyleSheet, Text, TextProps } from 'react-native'

interface StyledTextProps extends TextProps {
  // eslint-disable-next-line
  children: string | any
}

const StyledText = (props: StyledTextProps) => {
  const styles = StyleSheet.create({
    textStyle: {
      fontFamily: 'Archivo',
      color: 'rgba(0, 0, 0, 0.87)'
    }
  })
  return (
    <Text {...props} style={[styles.textStyle, props.style]}>
      {props.children}
    </Text>
  )
}

export default StyledText
