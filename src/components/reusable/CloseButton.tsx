import { StyleSheet, TouchableOpacity } from 'react-native'
import { CssStyleType } from '../BackButton'
import Text from '../StyledText'
import CloseModalButtonSvg from '../svg/CloseModalSvg'

interface CloseButtonProps {
  dismissable?: boolean
  dismisser: () => void
  testID: string
  marginTop?: number
  marginRight?: number
  customStyles?: CssStyleType | Array<CssStyleType>
}

const CloseButton = ({
  dismissable = true,
  dismisser,
  testID,
  marginTop = 19,
  marginRight = 24,
  customStyles
}: CloseButtonProps): JSX.Element => (
  <TouchableOpacity
    testID={testID}
    style={[styles.closeContainer, { marginTop, marginRight }, customStyles]}
    onPress={() => {
      dismissable && dismisser()
    }}>
    <CloseModalButtonSvg/>
    <Text>Close</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  closeContainer: {
    alignItems: 'center'
  }
})

export default CloseButton
