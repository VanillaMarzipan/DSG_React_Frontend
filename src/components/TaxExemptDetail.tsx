import Text from './StyledText'
import { View, StyleSheet } from 'react-native'
import TeammateCheckSvg from './svg/TeammateCheckSvg'

const TaxExemptDetail = (): JSX.Element => {
  return (
    <View style = {styles.container} testID='taxExemptDetail-panel'>
      <View testID='taxExemptDetail-icon' style={styles.iconContainer}>
        <TeammateCheckSvg />
        <Text style={styles.iconText}>Tax-Exempt Sale is successfully activated.</Text>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexGrow: 1,
    minHeight: 325,
    justifyContent: 'center'
  },
  iconContainer: {
    paddingRight: 32,
    alignItems: 'center'
  },
  iconText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#000000',
    letterSpacing: 0.5,
    marginTop: 19
  }
})

export default TaxExemptDetail
