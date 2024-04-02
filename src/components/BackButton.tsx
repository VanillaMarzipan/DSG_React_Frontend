import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from './StyledText'
import PropTypes from 'prop-types'
import ChevronSvg from './svg/ChevronSvg'
import { PanelsType } from '../reducers/uiData'

export interface CssStyleType {
  [index: string]: number | string | boolean
}

interface BackButtonProps {
  size?: string
  position?: string
  back: (activePanel: PanelsType, splitTender: boolean, setSplitTender: (shouldSet: boolean) => void) => void
  activePanel?: PanelsType
  splitTender?: boolean
  setSplitTender?: (shouldSet: boolean) => void
  warrantiesAdded?: boolean
  testID?: string
  style?: CssStyleType
  customFontSize?: number
}

const BackButton = ({
  size,
  position,
  back,
  activePanel,
  splitTender,
  setSplitTender,
  testID,
  style,
  customFontSize
}: BackButtonProps): JSX.Element => (
  <TouchableOpacity
    testID={testID || 'back-button'}
    style={[styles.iconContainer, position && { bottom: 0 }, style && style]}
    onPress={() => {
      console.info('ACTION: components > BackButton > onPress')
      back(activePanel, splitTender, setSplitTender)
    }}
  >
    <View aria-label='Edit' style={{ transform: [{ rotate: '180deg' }] }}>
      <ChevronSvg style={size === 'small' ? { height: 42, width: 42 } : { height: 84, width: 84 }}/>
    </View>
    <Text style={[styles.text, size === 'small' && { fontSize: 8, marginLeft: -10 }, customFontSize && { fontSize: customFontSize }]}>Back</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    zIndex: 1
  },

  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginLeft: -26
  }
})

BackButton.propTypes = {
  back: PropTypes.func,
  uiData: PropTypes.any
}

export default BackButton
