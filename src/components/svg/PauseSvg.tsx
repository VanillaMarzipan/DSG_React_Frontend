import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { CssStyleType } from '../BackButton'

interface PauseSvgProps {
  style: CssStyleType
  disabled: boolean
}

function PauseSvg ({ style, disabled }: PauseSvgProps) {
  const fillColor = disabled ? '#C8C8C8' : 'black'
  return (
    <View style={ style }>
      <Svg width='10' height='18' viewBox='0 0 10 18' fill='none'>
        <rect width='3' height='18' fill={fillColor}/>
        <Path d='M7 0H10V18H7V0Z' fill={fillColor}/>
      </Svg>
    </View>
  )
}

export default PauseSvg
