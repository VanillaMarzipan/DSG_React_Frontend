import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import * as Svg from 'react-native-svg'

const { Path, G } = Svg

const CreditSvg = ({ color, height }) => {
  return (
    <View style={styles.root}>
      <Svg height={height || 40} viewBox='0 0 512 354'>
        <G
          id='Page-1'
          stroke='none'
          strokeWidth='1'
          fill='none'
          fillRule='evenodd'
        >
          <G
            id='noun_Credit-Card_1894758'
            fill={color || '#000'}
            fillRule='nonzero'
          >
            <Path
              d='M472.739,0.381 L39.276,0.381 C17.589,0.381 0.012,17.974 0.012,39.63 L0.012,314.402 C0.012,336.054 17.59,353.619 39.276,353.619 L472.739,353.619 C494.41,353.619 511.987,336.055 511.987,314.402 L511.987,39.63 C511.987,17.975 494.41,0.381 472.739,0.381 Z M472.739,39.63 L472.739,78.91 L39.276,78.91 L39.276,39.63 L472.739,39.63 Z M39.276,314.402 L39.276,157.376 L472.739,157.376 L472.739,314.402 L39.276,314.402 Z'
              id='Shape'
            />
          </G>
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    marginTop: 16
  }
})

CreditSvg.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number
}

export default CreditSvg
