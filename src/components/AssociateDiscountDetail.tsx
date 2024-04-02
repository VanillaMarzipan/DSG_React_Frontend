import Text from './StyledText'
import { View, StyleSheet } from 'react-native'
import TeammateCheckSvg from './svg/TeammateCheckSvg'

interface AssociateDiscountDetailProps {
  isFamilyNight: boolean
}

const AssociateDiscountDetail = ({ isFamilyNight }: AssociateDiscountDetailProps): JSX.Element => {
  return (
    <View style = {styles.container} testID='associateDiscount-panel'>
      <View testID='associateDiscount-icon' style={styles.iconContainer}>
        <TeammateCheckSvg />
        <Text style={styles.iconText}>{isFamilyNight ? 'Teammate and Family Sale coupon ' : 'Associate discount '}is successfully applied.</Text>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexGrow: 1,
    minHeight: 320,
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

export default AssociateDiscountDetail
