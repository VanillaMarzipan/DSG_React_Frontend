import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import Svg, { G, Path } from 'react-native-svg'

const LogoutSvg = ({ color, height }) => (
  <View style={styles.root}>
    <Svg viewBox='0 0 512 640' x='0px' y='0px' height={height || 40}>
      <G fill={color || '#000'}>
        <Path
          d='M401.292,88h-134.2C245.033,88,227,106.27,227,128.326v35.643a10,10,0,0,0,20,0V128.326A20.38,20.38,0,0,1,267.089,108h134.2C412.32,108,421,117.3,421,128.326V386.917A19.846,19.846,0,0,1,401.393,407h-134.3A20.171,20.171,0,0,1,247,386.917v-34.9a10,10,0,0,0-20,0v34.9A40.192,40.192,0,0,0,267.089,427h134.2A39.866,39.866,0,0,0,441,386.978V128.326C441,106.27,423.348,88,401.292,88Z'/>
        <Path
          d='M105.033,268H341.7a10,10,0,1,0,0-20H102.811l51.306-59.307a10.116,10.116,0,0,0-1-14.2,9.994,9.994,0,0,0-14.1.944l0,.006L74.349,249.928a9.969,9.969,0,0,0,.467,15.767l64.677,64.674a10,10,0,0,0,14.142,0h0a9.774,9.774,0,0,0,.131-13.822c-.043-.044-.087-.088-.131-.131Z'/>
      </G>
    </Svg>
  </View>
)

const styles = StyleSheet.create({
  root: {
    marginTop: 8,
    marginBottom: -14
  }
})

LogoutSvg.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number
}

export default LogoutSvg
