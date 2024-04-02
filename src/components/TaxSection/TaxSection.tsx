import { TextStyle, View, ViewStyle } from 'react-native'
import { TaxSummary } from '../../reducers/transactionData'
import { TaxSummariesControl } from './TaxSummariesControl'
import Text from '../StyledText'

interface TaxSectionStyles {
  totalLine: ViewStyle
  totalLabel: TextStyle
  exemptLabel: TextStyle
  totalAmt: TextStyle
  redText: TextStyle
  exemptText: TextStyle
}

export const TaxSection = ({ taxSummaries, taxExempt, tax, styles }: { taxSummaries: TaxSummary[]; taxExempt: boolean; tax: number; styles: TaxSectionStyles }) => {
  if ((taxSummaries || []).length > 0) {
    return <TaxSummariesControl taxSummaries={taxSummaries} styles={styles} />
  }

  return (
    <View style={styles.totalLine}>
      <Text style={[styles.totalLabel, taxExempt && styles.exemptLabel]}>Tax</Text>
      <Text testID='tax' style={[styles.totalAmt, tax < 0 && styles.redText, taxExempt && styles.exemptText]}>
        {taxExempt ? 'Exempt' : tax?.toFixed(2)}
      </Text>
    </View>
  )
}
