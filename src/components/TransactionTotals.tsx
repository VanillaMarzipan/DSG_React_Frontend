import { StyleSheet, View } from 'react-native'
import Text from './StyledText'
import PropTypes from 'prop-types'
import { ThemeTypes } from '../reducers/theme'
import { TaxSummary } from '../reducers/transactionData'
import { TaxSection } from './TaxSection'

interface TransactionTotalsProps {
  subTotal: number
  discounts: number
  tax: number
  taxSummaries: TaxSummary[]
  grandTotal: number
  theme: ThemeTypes
  change: boolean
  triplePointsApplied: boolean
  taxExempt: boolean
}

const TransactionTotals = ({
  subTotal,
  discounts,
  tax,
  taxSummaries,
  grandTotal,
  theme,
  change,
  triplePointsApplied,
  taxExempt
}: TransactionTotalsProps) => {
  const styles = StyleSheet.create({
    totals: {
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'wrap',
      borderColor: '#979797',
      borderTopWidth: 1,
      paddingTop: 24,
      paddingBottom: 32,
      marginHorizontal: 32,
      minHeight: 192
    },
    totalLine: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      marginBottom: 4
    },
    totalLabel: { color: theme.fontColor, fontSize: 16 },
    exemptLabel: { color: '#006554' },
    exemptText: { color: '#006554', fontWeight: '700' },
    grandTotalLine: { marginTop: 16, marginBottom: 0 },
    redText: { color: '#ab2635' },
    superBold: { fontWeight: '900' },
    totalAmt: {
      flex: 1,
      textAlign: 'right',
      color: theme.fontColor
    },
    grandTotal: {
      fontSize: 24
    }
  })
  const _discounts = ((discounts > 0) ? '-' : '') + discounts?.toFixed(2).toString()
  return (
    <View style={styles.totals}>
      {!change && (
        <>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>
              Coupons and Rewards
              {
                triplePointsApplied && (
                  <Text testID='triple-points-applied'>
                    {' (3x Points Day Applied)'}
                  </Text>
                )
              }
            </Text>
            <Text testID='discounts' style={[styles.totalAmt, styles.redText]}>
              {_discounts}
            </Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text testID='subtotal' style={[styles.totalAmt, subTotal < 0 && styles.redText]}>
              {subTotal?.toFixed(2)}
            </Text>
          </View>
          <TaxSection taxSummaries={taxSummaries} taxExempt={taxExempt} tax={tax} styles={styles} />
          <View style={[styles.totalLine, styles.grandTotalLine]}>
            <Text
              style={[styles.totalLabel, styles.superBold, styles.grandTotal]}
            >
              Total
            </Text>
            <Text
              testID='total'
              style={[styles.totalAmt, styles.grandTotal, styles.superBold, grandTotal < 0 && styles.redText]}
            >
              {grandTotal?.toFixed(2)}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

TransactionTotals.propTypes = {
  subTotal: PropTypes.number,
  discounts: PropTypes.number,
  tax: PropTypes.number,
  grandTotal: PropTypes.number,
  theme: PropTypes.object,
  change: PropTypes.bool
}

export default TransactionTotals
