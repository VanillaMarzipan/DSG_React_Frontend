import { View } from 'react-native'

interface TriangleSvgProps {
  pointDirection: 'up' | 'down'
}
const TriangleSvg = ({ pointDirection }: TriangleSvgProps) => (
  <View style={{
    transform: [{ rotate: pointDirection === 'up' ? '180deg' : '0deg' }]
  }}>
    <svg width='21' height='18' viewBox='0 0 21 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M10.5 18L0.107697 0L20.8923 0L10.5 18Z' fill='black' />
    </svg>
  </View>
)

export default TriangleSvg
