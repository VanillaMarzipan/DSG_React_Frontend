import { useEffect, useState } from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import ModalBase from './Modal'
import * as CefSharp from '../../utils/cefSharp'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../actions/uiActions'
import { featureFlagEnabled } from '../../reducers/featureFlagData'

interface GiftCardBalanceInquiryModalProps {
  uiData
  transactionData
  storeInfo
  associateData
}

const GiftCardBalanceInquiryModal = ({ uiData, transactionData, storeInfo, associateData }: GiftCardBalanceInquiryModalProps): JSX.Element => {
  const dispatch = useDispatch()
  const [titleText, setTitleText] = useState('')
  const [displayText, setDisplayText] = useState('Have athlete swipe giftcard on the pinpad to check balance')
  const [giftCardInquiryBalance, setGiftCardInquiryBalance] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const balanceInquiryChitEnabled = featureFlagEnabled('GiftCardBalanceInquiryChit')

  useEffect(() => {
    if (uiData.giftCardBalanceInquiryResponse?.length > 0) {
      const json = JSON.parse(uiData.giftCardBalanceInquiryResponse)
      if (json.Result.Status > 0) {
        setTitleText('SWIPE FAILED')
        setDisplayText(json.Result.PaymentErrorResponse?.RefusalReason)
      } else {
        setTitleText('SWIPE ACCEPTED')
        setDisplayText('Your giftcard has a balance of')
        setGiftCardInquiryBalance(Number(json.Tender.Card.AvailableBalance).toFixed(2))
        setAccountNumber(json.Tender.Card.MaskedPan)
      }
    }
  }, [uiData.giftCardBalanceInquiryResponse])

  return (
    <ModalBase
      modalName='giftCardBalanceInquiry'
      modalHeading={'GIFT CARD BALANCE INQUIRY'}
      headingSize={30}
      modalWidth={636}
      minModalHeight={384}
      dismissable={true}
      backdropDismissable={false}
      backgroundColor='#EDEDED'
      onDismiss={() => {
        console.info('OnDismiss > GiftCardBalanceInquiryModal')
        setTitleText('')
        setDisplayText('Have athlete swipe giftcard on the pinpad to check balance')
        setGiftCardInquiryBalance('')
        setAccountNumber('')
        CefSharp.abortGiftCardOperation()
        dispatch(receiveUiData({ giftCardBalanceInquiryResponse: null }))
      }}
      onShow={() => {
        CefSharp.beginGiftCardBalanceInquiry()
      }}
    >
      <Text style={styles.titleTextStyle}>
        {titleText}
      </Text>
      <Text style={[styles.displayTextStyle, balanceInquiryChitEnabled && { marginTop: 25 }]}>
        {displayText}
      </Text>
      {giftCardInquiryBalance !== '' && (
        <>
          <Text style={[styles.giftCardInquiryBalanceStyle, balanceInquiryChitEnabled && { marginTop: 25 }]}>
            {giftCardInquiryBalance}
          </Text>
          {balanceInquiryChitEnabled &&
            <TouchableOpacity
              style={styles.printInquiryButton}
              onPress={() => {
                CefSharp.printGiftCardBalanceInquiryChit(
                  JSON.stringify(transactionData),
                  JSON.stringify(storeInfo),
                  JSON.stringify(associateData),
                  giftCardInquiryBalance,
                  accountNumber
                )
              }}
            >
              <Text style={styles.printInquiryButtonText}>print inquiry</Text>
            </TouchableOpacity>
          }
        </>
      )}
    </ModalBase>
  )
}

export default GiftCardBalanceInquiryModal

const styles = StyleSheet.create({
  titleTextStyle: {
    marginTop: 50,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '700'
  },
  displayTextStyle: {
    marginTop: 50,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '400'
  },
  giftCardInquiryBalanceStyle: {
    marginTop: 50,
    alignSelf: 'center',
    fontSize: 64,
    fontWeight: '700',
    fontFamily: 'DSG-Sans-Bold'
  },
  printInquiryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    alignSelf: 'center',
    height: 50,
    width: 230,
    backgroundColor: '#BB5811'
  },
  printInquiryButtonText: {
    textTransform: 'uppercase',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.5
  }
})
