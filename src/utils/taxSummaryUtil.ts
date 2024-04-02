import { featureFlagEnabled } from '../reducers/featureFlagData'
import { TransactionDataTypes } from '../reducers/transactionData'

// TODO: This method can be removed when the tax summary feature goes away.
export const removeTaxSummaryIfDisabled = (data: TransactionDataTypes) => {
  const total = data?.total
    ? ({
      total: {
        ...data.total,
        taxSummaries: featureFlagEnabled('TaxSummary') ? data.total?.taxSummaries : undefined
      }
    })
    : ({})

  return ({
    ...data,
    ...total
  })
}
