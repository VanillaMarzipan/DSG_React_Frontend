import { TaxSummary } from '../../reducers/transactionData'
import { TaxSummaryControl } from './TaxSummaryControl'
import { TaxBreakdownLineStyles } from './TaxBreakdownLineStyles'

export const TaxSummariesControl = ({ taxSummaries, styles }: { taxSummaries: TaxSummary[]; styles: TaxBreakdownLineStyles }) =>
  <>
    {(taxSummaries || [])
      .map((taxSummary, index) =>
        <TaxSummaryControl key={index} index={index} taxSummary={taxSummary} styles={styles} />)}
  </>
