import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Text from '../../StyledText'
import { getReturnsFromCreditCardLookup } from '../../../actions/returnActions'
import { ReturnOrderType } from '../../../reducers/returnData'
import SubmitButton from '../../reusable/SubmitButton'
import PinpadCreditCardSvg from '../../svg/PinpadCreditCardSvg'

interface ScanCreditCardPanelProps {
  handleOrderList: (orders: ReturnOrderType[]) => void
}

const ScanCreditCardPanel = ({ handleOrderList }: ScanCreditCardPanelProps): JSX.Element => {
  const [orderList, setOrderList] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  let parsed = []

  useEffect(() => {
    getReturnsFromCreditCardLookup(['20230626008881069103', '35301064035', '35301064033', '35301064036', '35301064032', '35301064031'])
      .then(orders => {
        parsed = orders
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
    setupOrderListWatcher(setOrderList)
    console.log(orderList)
  }, [])

  return (
    <View style={styles.swipeCreditContainer}>
      <View style={styles.separatorLine}/>
      <PinpadCreditCardSvg height={80} width={110}></PinpadCreditCardSvg>
      <Text style={styles.swipeInstructions}>Waiting for the athlete to swipe/tap/insert their card<br/>on the PIN Pad.</Text>
      {errorMessage ? (<Text style={styles.errorMessage}>{errorMessage}</Text>) : <></>}
      <SubmitButton
        testID='return-credit-lookup-go-back-button'
        buttonLabel='Go Back'
        onSubmit={() => { handleOrderList(parsed) }}
        customStyles={styles.noReceiptButton}
        customTextStyles={styles.noReceiptText}
      />
    </View>
  )
}

const setupOrderListWatcher = (setOrders: (string) => void): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.getOrderList = (orders: string): void => {
    setOrders(orders)
  }
}

const styles = StyleSheet.create({
  separatorLine: {
    backgroundColor: '#797979',
    height: 1,
    width: 480,
    marginLeft: 7,
    marginTop: 18,
    marginBottom: 88

  },
  swipeCreditContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 475
  },
  swipeInstructions: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 108
  },
  noReceiptButton: {
    position: 'absolute',
    bottom: 20,
    borderWidth: 2,
    borderColor: '#2C2C2C',
    backgroundColor: '#EDEDED',
    width: 303
  },
  noReceiptText: {
    color: '#191F1C',
    fontSize: 16
  },
  errorMessage: {
    color: '#B10216',
    fontSize: 16,
    position: 'absolute',
    top: 280
  }
})

export default ScanCreditCardPanel
