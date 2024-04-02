import Svg, { Path } from 'react-native-svg'

type CheckMarkSvgProps = {
  width?: number
  height?: number
  size?: 'small' | 'large'
  props?
}

const CheckMarkSvg = ({
  width = 64,
  height = 64,
  size = 'small',
  props
}: CheckMarkSvgProps) => (
  <Svg width={width} height={height} fill='none' {...props}>
    {size === 'small'
      ? (
        <Path
          d='M32 5.333C17.28 5.333 5.333 17.28 5.333 32 5.333 46.72 17.28 58.667 32 58.667c14.72 0 26.666-11.947 26.666-26.667C58.666 17.28 46.72 5.333 32 5.333zm-5.334 40L13.333 32l3.76-3.76 9.573 9.547 20.24-20.24 3.76 3.786-24 24z'
          fill='#008D75'
        />
      )
      : (
        <Path
          d='M109 18.167c-50.14 0-90.833 40.693-90.833 90.833S58.86 199.833 109 199.833 199.833 159.14 199.833 109 159.14 18.167 109 18.167zm-18.167 136.25L45.417 109l12.807-12.808 32.61 32.519 68.942-68.943 12.807 12.899-81.75 81.75z'
          fill='#008D75'
        />
      )}
  </Svg>
)

export default CheckMarkSvg
