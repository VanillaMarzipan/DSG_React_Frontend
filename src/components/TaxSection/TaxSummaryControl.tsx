import { View } from 'react-native'
import { TaxSummary } from '../../reducers/transactionData'
import Text from '../StyledText'
import { TaxBreakdownLineStyles } from './TaxBreakdownLineStyles'

/** Given a taxBreakdownItem, returns a formatted tax line
 * For 'TAX', it should just return 'Tax' (mixed case)
 * Example: Tax
 *
 * For 'PIF' and 'RSF', it should return {description} ({key})
 * Example: Public Improvement Fee (PIF)
 *
 * For anything else, it should just return the key in parantheses.
 * Example: (FUN)
 *
 * @param taxBreakdownItem The tax breakdown item
 */
const getTransactionLine = (taxBreakdownItem: TaxSummary) => {
  const comparisonTaxType = (taxBreakdownItem.taxType || '').trim().toUpperCase()

  if (comparisonTaxType === 'TAX') {
    return 'Tax'
  }

  const taxTypeDictionary = [
    { taxType: 'PIF', description: 'Public Improvement Fee' },
    { taxType: 'RSF', description: 'Retail Service Fee' }
  ]

  const matchingDictionaryItem = taxTypeDictionary.find(dictionaryItem => dictionaryItem.taxType === comparisonTaxType)

  const pieces = matchingDictionaryItem
    ? [matchingDictionaryItem.description, `(${matchingDictionaryItem.taxType})`]
    : [comparisonTaxType.trim().toLocaleUpperCase()]

  return pieces.filter(piece => piece).join(' ').trim()
}

export const TaxSummaryControl = ({ taxSummary, index, styles }: { taxSummary: TaxSummary; index: number; styles: TaxBreakdownLineStyles }) =>
  <View style={styles.totalLine}>
    <Text testID={`taxSummaryTypeLabel_${index}`} style={styles.totalLabel}>{getTransactionLine(taxSummary)}</Text>
    <Text testID={`taxSummaryValue_${index}`} style={styles.totalAmt}>{taxSummary.amount.toFixed(2)}</Text>
  </View>
