import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'

const LogoutSvg = ({ disabled }) => {
  return (
    <View style={styles.root}>
      <svg width='40' height='33' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M15.7556 27.9778L18.8889 31.1111L30 20L18.8889 8.88889L15.7556 12.0222L21.4889 17.7778H0V22.2222H21.4889L15.7556 27.9778ZM35.5556 0H4.44444C1.97778 0 0 2 0 4.44444V13.3333H4.44444V4.44444H35.5556V35.5556H4.44444V26.6667H0V35.5556C0 38 1.97778 40 4.44444 40H35.5556C38 40 40 38 40 35.5556V4.44444C40 2 38 0 35.5556 0Z'
          fill={disabled ? '#C8C8C8' : 'black'}/>
      </svg>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    marginBottom: -7
  }
})

LogoutSvg.propTypes = {
  disabled: PropTypes.bool
}

export default LogoutSvg
