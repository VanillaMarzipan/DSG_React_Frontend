import { useState } from 'react'
import { View } from 'react-native'
import { ReturnOrderType } from '../../../reducers/returnData'
import { UiDataTypes } from '../../../reducers/uiData'
import LoyaltyOrderSelectionView from './LoyaltyOrderSelectionView'
import ScanCreditCardPanel from './ScanCreditCardPanel'

interface OrderLookupByCreditCardProps {
  uiData: UiDataTypes
  handleBackButton: () => void
}

const OrderLookupByCreditCard = ({ uiData, handleBackButton }: OrderLookupByCreditCardProps): JSX.Element => {
  const [step, setStep] = useState('swipe')
  const [orders, setOrders] = useState([])

  return (
    <View>
      {step === 'swipe' && (
        <ScanCreditCardPanel handleOrderList={function (orders: ReturnOrderType[]): void {
          setOrders(orders)
          setStep('orderList')
        }} />)}
      {step === 'orderList' && (
        <LoyaltyOrderSelectionView orders={orders} uiData={uiData} returnOriginationType={6} orderLookupIdentifier={'A1234509876'} handleBackButton={handleBackButton}/>
      )}
    </View>
  )
}

export default OrderLookupByCreditCard
