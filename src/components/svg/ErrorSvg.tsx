import PropTypes from 'prop-types'

function ErrorSvg ({ height, width, color }) {
  return (
    <svg width={width} height={height} viewBox='0 0 218 218' fill={'none'}>
      <path
        d='M109 18.167c-50.14 0-90.833 40.693-90.833 90.833S58.86 199.833 109 199.833 199.833 159.14 199.833 109 159.14 18.167 109 18.167zm9.083 136.25H99.917V136.25h18.166v18.167zm0-36.334H99.917v-54.5h18.166v54.5z'
        fill={color}
      />
    </svg>
  )
}

ErrorSvg.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  color: PropTypes.string
}

export default ErrorSvg
