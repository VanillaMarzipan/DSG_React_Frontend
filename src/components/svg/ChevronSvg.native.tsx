import Svg, { Path } from 'react-native-svg'
import { CssStyleType } from '../BackButton'

interface ChevronSvgProps {
  width?: number
  height?: number
  viewBox?: string
  style?: CssStyleType
  fill?: string
}

const ChevronSvg = ({
  width = 40,
  height = 40,
  viewBox = '0 0 24 24',
  style,
  ...props
}: ChevronSvgProps) => (
  <Svg width={width} height={height} viewBox={viewBox} style={style} {...props}>
    <Path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/>
    <Path d='M0 0h24v24H0z' fill='none'/>
  </Svg>
)

export default ChevronSvg
