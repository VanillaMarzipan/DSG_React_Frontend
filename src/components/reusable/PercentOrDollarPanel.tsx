import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import CouponOverrideButton from '../CouponOverrideButton'
import CouponDollarSvg from '../svg/CouponDollarSvg'
import CouponPercentSvg from '../svg/CouponPercentSvg'
import { useTypedSelector as useSelector } from '../../reducers/reducer'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../actions/uiActions'
import { formatNumber } from '../../utils/formatters'

interface PercentOrDollarPanelProps {
  textInputRef
  loadingStates
  disablePercentButton
  discountAmountDescription
  onSubmitDiscount
  maxPercentAmount
  discountInputTestID
  percentButtonTestID
  dollarButtonTestID
  applyButtonTestID
  maxDollarAmount
  dollarAmountPurpose: 'discount' | 'newPrice'
}

const PercentOrDollarPanel = ({
  textInputRef,
  loadingStates,
  disablePercentButton,
  discountAmountDescription,
  onSubmitDiscount,
  maxPercentAmount,
  discountInputTestID,
  percentButtonTestID,
  dollarButtonTestID,
  applyButtonTestID,
  maxDollarAmount,
  dollarAmountPurpose
}: PercentOrDollarPanelProps): JSX.Element => {
  const dispatch = useDispatch()
  const [percentSelected, setPercentSelected] = useState(!disablePercentButton)
  const [discountAmountInput, setDiscountAmountInput] = useState('')
  const checkIfStringAmountExceedsThreshold = (val, threshold) => {
    if (Number(val) > threshold) return true
  }
  const handleDiscountAmountInput = (val) => {
    if (manualDiscountError) dispatch(receiveUiData({ manualDiscountError: false }))
    const reg = /^[0-9\b]+$/
    if (percentSelected || dollarAmountPurpose === 'discount') {
      // allows only whole numbers to be typed, deletion of single digit & no leading 0's
      if ((reg.test(val) || val === '') && val[0] !== '0') {
        setDiscountAmountInput(val)
      }
    } else {
      setDiscountAmountInput(formatNumber(val))
    }
  }
  const { manualDiscountError } = useSelector(state => state.uiData)

  const handleDiscountTypeSelection = (percentSelected) => {
    setPercentSelected(percentSelected)
    textInputRef?.current?.focus()
  }

  return (
    <View style={styles.container}>
      <View style={[styles.textInputWrapper, manualDiscountError && { borderWidth: 0 }, discountAmountInput === '' && { borderColor: '#c8c8c8' }]}>
        <TextInput
          ref={textInputRef}
          placeholder={'Input amount'}
          testID={discountInputTestID}
          autoFocus={true}
          value={discountAmountInput}
          style={[styles.textInput, discountAmountInput === '' && styles.emptyTextInput, manualDiscountError && { borderWidth: 2, borderColor: '#AB2635', color: '#AB2635' }]}
          onChange={e => handleDiscountAmountInput(e.nativeEvent.text)}
        />
      </View>
      <View style={styles.couponTypeWrapper}>
        <CouponOverrideButton
          buttonText='PERCENT'
          onPress={() => handleDiscountTypeSelection(true)}
          testId={percentButtonTestID}
          couponTypeIcon={<CouponPercentSvg disabled={disablePercentButton} isSelected={percentSelected} />}
          isSelected={percentSelected}
          disabled={disablePercentButton}
        />
        <CouponOverrideButton
          buttonText='DOLLAR'
          onPress={() => handleDiscountTypeSelection(false)}
          testId={dollarButtonTestID}
          couponTypeIcon={<CouponDollarSvg disabled={loadingStates.manualDiscount} isSelected={!percentSelected} />}
          isSelected={!percentSelected}
          disabled={loadingStates.manualDiscount}
        />
      </View>
      <View style={styles.discountMessageWrapper}>
        {manualDiscountError
          ? (
            <Text style={[styles.discountMessageText, { color: '#AB2635' }]}>
              {manualDiscountError}
            </Text>
          )
          : (
            <Text style={[styles.discountMessageText, manualDiscountError && { color: '#AB2635' }]}>
              {discountAmountInput !== '' &&
                discountAmountDescription(percentSelected, discountAmountInput)
              }
            </Text>
          )}
      </View>
      <TouchableOpacity
        onPress={() => {
          if (!percentSelected && maxDollarAmount && dollarAmountPurpose === 'newPrice' && checkIfStringAmountExceedsThreshold(discountAmountInput, Math.ceil(maxDollarAmount))) {
            dispatch(receiveUiData({ manualDiscountError: `Price cannot be set above original amount ($${maxDollarAmount.toFixed(2)})` }))
            return
          } else if (percentSelected && checkIfStringAmountExceedsThreshold(discountAmountInput, maxPercentAmount)) {
            dispatch(receiveUiData({ manualDiscountError: 'Percent discount cannot be set above 100%' }))
            return
          } else {
            dispatch(receiveUiData({ manualDiscountError: false }))
          }
          onSubmitDiscount(percentSelected, discountAmountInput)
        }}
        disabled={discountAmountInput === '' || loadingStates.manualDiscount}
        testID={applyButtonTestID}
        style={[styles.submitButtonContainer, discountAmountInput === '' && { backgroundColor: '#C8C8C8' }]}>
        {(loadingStates.manualDiscount || loadingStates.manualDiscount)
          ? <ActivityIndicator color='#FFFFFF' />
          : <Text style={styles.buttonText}>
            APPLY DISCOUNT
          </Text>
        }
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    width: 636,
    alignItems: 'center'
  },
  discountLimitExceeded: {
    marginBottom: 16,
    textAlign: 'center',
    width: '89%',
    color: '#AB2635'
  },
  textInputWrapper: {
    borderColor: '#191F1C',
    borderWidth: 1,
    height: 52,
    width: 134,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput: {
    fontFamily: 'Archivo',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 32,
    color: '#191F1C',
    height: 52,
    width: 134
  },
  emptyTextInput: {
    fontWeight: '400',
    fontSize: 14,
    color: '#4F4F4F'
  },
  couponTypeWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 24
  },
  discountMessageWrapper: {
    minHeight: 24,
    marginVertical: 16
  },
  discountMessageText: {
    color: '#006554',
    fontSize: 16,
    fontWeight: '400'
  },
  submitButtonContainer: {
    height: 44,
    width: 290,
    backgroundColor: '#bb5811',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Archivo-Bold'
  }
})

export default PercentOrDollarPanel
