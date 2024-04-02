import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { convertISODateToMonthDayYear } from '../../../utils/formatters'
import Text from '../../StyledText'
import ChevronSvg from '../../svg/ChevronSvg'

interface AthleteOrderDetailsRowProps {
  setOrderSelected
  index
  order
}

const AthleteOrderDetailsRow = ({
  setOrderSelected,
  index,
  order
}: AthleteOrderDetailsRowProps): JSX.Element => {
  return (
    <TouchableOpacity
      key={`loyalty-customer-returns-${index}`}
      style={styles.container}
      onPress={() => {
        setOrderSelected(order)
      }}
    >
      <View style={styles.innerContainer}>
        <View
          style={styles.innerContainerChild}
          testID={'loyalty-order' + index}>
          <Text style={styles.headerText}>
            {order.originalSaleInfo.transactionDate ? convertISODateToMonthDayYear(order.originalSaleInfo.transactionDate) : 'Date N/A'} - ${order.calculatedTotal.toFixed(2)}
          </Text>
          <Text style={styles.orderNumber}>
            Order #: {order.customerOrderNumber}
          </Text>
          <Text>
            {order.originalSaleInfo.storeName ? order.originalSaleInfo.storeName : 'Online'}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <ChevronSvg />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF'
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  innerContainerChild: {
    padding: 16
  },
  headerText: {
    fontWeight: '700',
    fontSize: 20
  },
  orderNumber: {
    marginVertical: 4
  },
  chevronContainer: {
    width: 40,
    justifyContent: 'center'
  }
})

export default AthleteOrderDetailsRow
