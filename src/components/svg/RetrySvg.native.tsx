import Svg, { Path } from 'react-native-svg'

const RetrySvg = props => (
  <Svg width={18} height={20} fill='none' {...props}>
    <Path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M14 5H4v4H2V3h12V0l4 4-4 4V5zM4 15h10v-4h2v6H4v3l-4-4 4-4v3z'
      fill='#191F1C'
    />
  </Svg>
)

export default RetrySvg
