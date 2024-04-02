import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { CssStyleType } from '../BackButton'

interface PencilSvgProps {
  style: CssStyleType
  disabled: boolean
}
function PencilSvg ({ style, disabled }: PencilSvgProps) {
  const fillColor = disabled ? '#C8C8C8' : '#005343'
  return (
    <View style={ style }>
      <Svg width='12' height='12' viewBox='0 0 13 13' fill='none'>
        <Path fill-rule='evenodd' clip-rule='evenodd' d='M12.6696 1.98792C12.9458 2.26417 12.9458 2.71042 12.6696 2.98667L11.3733 4.28292L8.71708 1.62667L10.0133 0.330417C10.2896 0.0541675 10.7358 0.0541675 11.0121 0.330417L12.6696 1.98792ZM0.125 12.875V10.2188L7.95917 2.38458L10.6154 5.04083L2.78125 12.875H0.125Z' fill={fillColor}/>
      </Svg>
    </View>
  )
}

export default PencilSvg
