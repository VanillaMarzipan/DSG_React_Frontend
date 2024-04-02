import { StyleSheet, View } from 'react-native'
import Text from './StyledText'
import BarcodeSvg from './svg/BarcodeSvg'

const ProductLookupLanding = () => {
  return (
    <>
      <View style={styles.orArea}>
        <View style={styles.orLine}></View>
        <Text style={{ color: '#666' }}>{'or'}</Text>
        <View style={styles.orLine}></View>
      </View>
      <View style={{ marginHorizontal: 'auto' }}>
        <BarcodeSvg />
      </View>
      <Text style={{ marginTop: 23, marginHorizontal: 'auto' }}>
        {'Scan an Item'}
      </Text>
    </>
  )
}
export default ProductLookupLanding

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 56
  },
  orArea: {
    marginTop: 56,
    marginBottom: 56,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  orLine: {
    width: 126,
    height: 1,
    backgroundColor: '#C5C5C5',
    marginLeft: 10,
    marginRight: 10
  }
})
