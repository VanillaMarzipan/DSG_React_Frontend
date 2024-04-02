import { StyleSheet, View } from 'react-native'
import { CssStyleType } from '../BackButton'

interface DecoratorLineProps {
  customStyles?: CssStyleType
}

const DecoratorLine = ({
  customStyles
}: DecoratorLineProps): JSX.Element => (
  <View style={[styles.decoratorLine, customStyles]}/>
)

const styles = StyleSheet.create({
  decoratorLine: {
    backgroundColor: '#797979',
    height: 1,
    width: '80%'
  }
})

export default DecoratorLine
