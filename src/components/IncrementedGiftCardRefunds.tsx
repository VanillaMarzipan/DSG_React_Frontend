import { StyleSheet, View, Text, ActivityIndicator } from 'react-native'
import { TransactionDataTypes } from '../reducers/transactionData'
import { getSumOfGiftCardTenders, splitAmountUnderMax } from '../utils/transactionHelpers'
import { useTypedSelector } from '../reducers/reducer'
import CheckMarkUncircledSvg from './svg/CheckMarkUncircled'
import DottedLineCircleSvg from './svg/DottedLineCircleSvg'
import DecoratorLine from './reusable/DecoratorLine'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { receiveReturnData } from '../actions/returnActions'

interface IncrementedGiftCardRefundsProps {
  transactionData: TransactionDataTypes
  creditPanelError
}

const IncrementedGiftCardRefunds = ({
  transactionData,
  creditPanelError
}: IncrementedGiftCardRefundsProps): JSX.Element => {
  const dispatch = useDispatch()
  const sumOfGiftCardTenders = getSumOfGiftCardTenders(transactionData?.tenders)
  const giftCardRefundTracker = useTypedSelector(state => state.returnData.giftCardRefundTracker)
  const { loadingStates } = useTypedSelector(state => state.uiData)
  useEffect(() => {
    if (transactionData.total) {
      const refundAmountSplitForGiftCards = splitAmountUnderMax(transactionData.total.grandTotal * -1, 500)
      const giftCardRefundTracker = []
      const tendersWithEqualAmounts = transactionData?.tenders?.filter(tender => tender.amount === (refundAmountSplitForGiftCards[0] * -1))
      const tendersWithEqualAmountsCount = tendersWithEqualAmounts.length
      refundAmountSplitForGiftCards.forEach((increment, index) => {
        giftCardRefundTracker.push({
          incrementedAmount: increment,
          refunded: index < tendersWithEqualAmountsCount,
          giftCardListNumber: index + 1,
          giftCardIdentifier: (index < tendersWithEqualAmountsCount) ? tendersWithEqualAmounts[index]?.accountNumber?.slice(-4) : 'n/a'
        })
      })
      dispatch(receiveReturnData({
        giftCardRefundTracker: giftCardRefundTracker
      }))
    }
  }, [])
  return (
    <View style={{ alignItems: 'center', marginTop: 8 }}>
      {sumOfGiftCardTenders < 0 && <Text style={[styles.creditText, { paddingTop: 0, paddingBottom: 16 }]}>Amount Returned: ${(sumOfGiftCardTenders * -1).toFixed(2)}</Text>}
      <View style={styles.giftCardIncrementsContainer}>
        {
          giftCardRefundTracker?.map((incrementItem, index) => {
            const textStylesArray = [
              styles.giftCardIncrementText,
              giftCardRefundTracker
                ?.find(element => element.refunded === false)
                ?.giftCardListNumber === (index + 1) && { fontWeight: '700' } as const
            ]
            if (incrementItem) {
              return (
                <View key={'giftcard-refund-amount-' + index}>
                  <View
                    style={[
                      styles.giftCardIncrementRow,
                      (giftCardRefundTracker
                        ?.find(element => element.refunded === false)
                        ?.giftCardListNumber) === (index + 1) && { backgroundColor: '#E0F1EE' }
                    ]}
                  >
                    <Text style={[...textStylesArray, { minWidth: 82 }]}>
                      Gift Card #{incrementItem.giftCardListNumber}
                    </Text>
                    <Text style={[textStylesArray, { minWidth: 58 }]}>
                      ${incrementItem.incrementedAmount.toFixed(2)}
                    </Text>
                    <Text style={[textStylesArray, { minWidth: 22 }]}>
                      {incrementItem.giftCardIdentifier}
                    </Text>
                    {
                      incrementItem.refunded === true
                        ? (
                          <CheckMarkUncircledSvg />
                        )
                        : (
                          <DottedLineCircleSvg />
                        )
                    }
                  </View>
                  {index !== (giftCardRefundTracker.length - 1) &&
                    <View style={{ alignItems: 'center', width: '100%' }}>
                      <DecoratorLine customStyles={{ width: 280 }} />
                    </View>
                  }
                </View>
              )
            } else {
              return null
            }
          })
        }
      </View>
      <Text style={{ textAlign: 'center' }}>
        {
          getSumOfGiftCardTenders(transactionData.tenders) < 0
            ? 'Please swipe additional gift card(s) until completed.'
            : 'Multiple gift cards are needed to complete this return.\nPlease swipe gift card #1 for the amount shown above.'
        }
      </Text>
      {
        !creditPanelError && (
          (loadingStates.giftCardActivation || loadingStates.newTender)
            ? (
              <View style={{ marginTop: 40 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>PROCESSING</Text>
                <ActivityIndicator size={80} />
              </View>
            )
            : <Text style={[styles.creditText, { marginTop: 40 }]}>SWIPE GIFT CARD ON REGISTER</Text>
        )
      }
      {
        creditPanelError &&
        (
          <View>
            <Text
              testID='credit-panel-error'
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                fontSize: 18,
                color: '#B10216',
                paddingTop: 40,
                fontWeight: 'bold',
                width: 400
              }}
            >
              {creditPanelError}
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                fontSize: 16,
                paddingTop: 30,
                color: '#333333',
                fontWeight: 'bold'
              }}
            >
              Please try again
            </Text>
          </View>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  creditText: {
    alignSelf: 'center',
    fontSize: 20,
    paddingTop: 40,
    fontWeight: '700'
  },
  giftCardIncrementsContainer: {
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    width: 312,
    marginBottom: 16,
    overflow: 'hidden'
  },
  giftCardIncrementRow: {
    height: 33,
    width: 312,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row'
  },
  giftCardIncrementText: {
    fontWeight: '400',
    textAlign: 'center'
  }
})

export default IncrementedGiftCardRefunds
