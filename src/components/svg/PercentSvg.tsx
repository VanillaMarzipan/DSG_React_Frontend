import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { CssStyleType } from '../BackButton'

interface PercentSvgProps {
  style?: CssStyleType
  disabled: boolean
}

function PercentSvg ({ style, disabled }: PercentSvgProps) {
  const fillColor = disabled ? '#C8C8C8' : 'black'
  return (
    <View style={style}>
      <Svg width='20' height='18' viewBox='0 0 14 12' fill='none'>
        <Path d='M12.18 0.420001C11.62 -0.14 10.78 -0.14 10.22 0.420001L1.81993 8.82003C1.25992 9.31003 1.18992 10.22 1.67992 10.78C2.16993 11.34 3.07993 11.41 3.63993 10.92C3.70993 10.85 3.77993 10.85 3.77993 10.78L12.18 2.38001C12.74 1.82 12.74 0.980003 12.18 0.420001Z' fill={fillColor} />
        <Path d='M4.20001 2.10001C4.20001 0.910002 3.29001 0 2.10001 0C0.910003 0 0 0.910002 0 2.10001C0 3.29001 0.910003 4.20001 2.10001 4.20001C3.29001 4.20001 4.20001 3.29001 4.20001 2.10001Z' fill={fillColor} />
        <Path d='M11.9 7.00003C10.71 7.00003 9.79996 7.91004 9.79996 9.10004C9.79996 10.29 10.71 11.2001 11.9 11.2001C13.09 11.2001 14 10.29 14 9.10004C14 7.91004 13.09 7.00003 11.9 7.00003Z' fill={fillColor} />
      </Svg>
    </View>
  )
}

export default PercentSvg
