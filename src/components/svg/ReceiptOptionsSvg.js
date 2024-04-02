import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'

const ReceiptOptionsSvg = ({ disabled, receiptOptionSelected }) => {
  let fillColor = '#333'
  if (disabled) fillColor = '#C8C8C8'
  else if (receiptOptionSelected) fillColor = '#F6841F'
  let svgToDisplay = (
    <svg width='42' height='56' viewBox='0 0 36 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M30 30H6V26H30V30ZM30 22H6V18H30V22ZM30 14H6V10H30V14ZM0 40L3 37L6 40L9 37L12 40L15 37L18 40L21 37L24 40L27 37L30 40L33 37L36 40V0L33 3L30 0L27 3L24 0L21 3L18 0L15 3L12 0L9 3L6 0L3 3L0 0V40Z'
        fill={fillColor} />
    </svg>
  )
  if (receiptOptionSelected) {
    svgToDisplay = (
      <View style={{ marginBottom: 0, marginTop: 6 }}>
        <svg width='50' height='50' viewBox='0 0 54 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='25' cy='25' r='25' fill={fillColor} />
          <path d='M35.6667 33H14.3333V29.8H35.6667V33ZM35.6667 26.6H14.3333V23.4H35.6667V26.6ZM35.6667 20.2H14.3333V17H35.6667V20.2ZM9 41L11.6667 38.6L14.3333 41L17 38.6L19.6667 41L22.3333 38.6L25 41L27.6667 38.6L30.3333 41L33 38.6L35.6667 41L38.3333 38.6L41 41V9L38.3333 11.4L35.6667 9L33 11.4L30.3333 9L27.6667 11.4L25 9L22.3333 11.4L19.6667 9L17 11.4L14.3333 9L11.6667 11.4L9 9V41Z' fill='white' />
        </svg>
      </View>
    )
  }
  return (
    <View style={styles.root}>
      {svgToDisplay}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    marginTop: 8,
    marginBottom: -14
  }
})

ReceiptOptionsSvg.propTypes = {
  disabled: PropTypes.bool,
  receiptOptionSelected: PropTypes.bool
}

export default ReceiptOptionsSvg
