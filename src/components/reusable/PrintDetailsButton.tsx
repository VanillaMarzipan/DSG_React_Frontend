import { StyleSheet, TouchableOpacity } from 'react-native'
import Text from '../StyledText'
import PrintDetailsSvg from '../svg/PrintDetailsSvg'

interface PrintButtonProps {
  testID: string
  onPress: () => void
  marginTop?: number
  marginRight?: number
}

const PrintButton = ({
  testID,
  onPress,
  marginTop = 19,
  marginRight = 24
}: PrintButtonProps): JSX.Element => (
  <TouchableOpacity
    testID={testID}
    style={[styles.printContainer, { marginTop, marginRight }]}
    onPress={() => { onPress() }}>
    <PrintDetailsSvg/>
    <Text>Print Details</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  printContainer: {
    alignItems: 'center'
  }
})

export default PrintButton
