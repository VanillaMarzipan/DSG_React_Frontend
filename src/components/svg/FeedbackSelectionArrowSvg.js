import { View } from 'react-native'
import PropTypes from 'prop-types'

const FeedbackSelectionArrowSvg = ({ color }) => {
  return (
    <View>
      <svg
        width='19'
        height='12'
        viewBox='0 0 19 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M9.23524 11.9466L0.352457 0.0280037L18.1984 0.0883122L9.23524 11.9466Z'
          fill={color}
        />
      </svg>
    </View>
  )
}

FeedbackSelectionArrowSvg.propTypes = {
  color: PropTypes.string
}

export default FeedbackSelectionArrowSvg
