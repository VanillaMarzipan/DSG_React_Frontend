import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import { useTypedSelector as useSelector } from '../../../reducers/reducer'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../../actions/uiActions'
import PercentOrDollarPanel from '../../reusable/PercentOrDollarPanel'
import Breadcrumbs from '../../Breadcrumbs'
import BackButton from '../../BackButton'
import { View, StyleSheet } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import SubmitButton from '../../reusable/SubmitButton'
import TextInput from '../../TextInput'
import { applyManualItemDiscountAction } from '../../../actions/transactionActions'
import { getPriceOfSelectedItemFromItemList } from '../../../utils/transactionHelpers'

export const itemDiscountReasonEnumLabelDictionary = [
  {
    enum: 13,
    label: 'Customer Service'
  },
  {
    enum: 2,
    label: 'Blemished Item'
  },
  {
    enum: 11,
    label: 'As-Is'
  },
  {
    enum: 1,
    label: 'Competitor Price Match'
  },
  {
    enum: 14,
    label: 'Website Match'
  },
  {
    enum: 4,
    label: 'Incorrect Sign'
  },
  {
    enum: 5,
    label: 'Incorrect Ticket'
  }
]

const CouponOverride = (): JSX.Element => {
  const dispatch = useDispatch()
  const textInputRef = useRef(null)
  const { loadingStates, selectedItem } = useSelector(state => state.uiData)
  const transactionItems = useSelector(state => state.transactionData?.items)

  const [itemDiscountStep, setItemDiscountStep] = useState(1)
  useEffect(() => {
    setTimeout(() => textInputRef?.current?.focus(), 1)
  })

  const handleCloseModal = () => {
    setItemDiscountStep(1)
    setDiscountReasonEnum('-1')
    setDiscountMethodIndex('-1')
    setCouponInput('')
    dispatch(receiveUiData({
      manualDiscountError: false,
      clearUpc: true
    }))
  }

  const manualItemDiscountMethods = [
    'Percent or Dollar Off',
    'Coupon Discount',
    'Manual Price Entry'
  ]

  const headingStepDictionary = {
    1: 'REASON FOR DISCOUNTING?',
    2: 'DISCOUNT ITEM METHOD',
    3: 'DISCOUNT ON ITEM'
  }

  const [discountReasonEnum, setDiscountReasonEnum] = useState('-1')
  const [discountMethodIndex, setDiscountMethodIndex] = useState('-1')
  const [couponInput, setCouponInput] = useState('')
  const handleSubmitDiscountMethod = () => {
    setItemDiscountStep(3)
  }

  useEffect(() => {
    if (discountMethodIndex !== '1') {
      setCouponInput('')
    }
  }, [discountMethodIndex])

  const panelStepDictionary = {
    1: (
      <View style={styles.pageContainer}>
        <Picker
          testID='discount-reason-picker'
          onValueChange={value => setDiscountReasonEnum(value)}
          selectedValue={discountReasonEnum}
          style={styles.discountReasonPicker}
        >
          <Picker.Item testID='manual-item-discount-reason-default' key='-1' label='Select Reason Why' value='-1'/>
          {itemDiscountReasonEnumLabelDictionary.map((reason, index) => (
            <Picker.Item testID={'manual-item-discount-reason-' + reason} key={`manual-discount-reason-${index}`} label={reason.label} value={reason.enum}/>
          ))}
        </Picker>
        <SubmitButton
          testID='manual-transaction-discount-next'
          buttonLabel='NEXT'
          onSubmit={() => setItemDiscountStep(2)}
          disabled={discountReasonEnum === '-1'}
          customStyles={{ marginTop: 16 }}
        />
      </View>
    ),
    2: (
      <View style={styles.pageContainer}>
        <Picker
          testID='discount-method-picker'
          onValueChange={value => setDiscountMethodIndex(value)}
          selectedValue={discountMethodIndex}
          style={styles.discountReasonPicker}
        >
          <Picker.Item testID='manual-discount-reason-default' key='-1' label='Select Method' value='-1'/>
          {manualItemDiscountMethods.map((reason, index) => (
            <Picker.Item
              testID={'transaction-discount-reason-' + reason}
              key={`manual-discount-reason-${index}`}
              label={reason}
              value={index}
            />
          ))}
        </Picker>
        {
          discountMethodIndex === '1' &&
          <TextInput
            ref={textInputRef}
            nativeID='manual-item-discount-coupon'
            testID='manual-item-discount-coupon'
            labelBackgroundColor={'white'}
            label={'Enter Coupon Number'}
            style={styles.textInput}
            value={couponInput}
            onChangeText={text => setCouponInput(text)}
            mode='outlined'
            maxLength={22}
            onSubmitEditing={handleSubmitDiscountMethod}
          />
        }
        <SubmitButton
          testID='manual-trx-discount-next'
          buttonLabel='NEXT'
          onSubmit={handleSubmitDiscountMethod}
          disabled={discountMethodIndex === '-1' || (discountMethodIndex === '1' && couponInput === '')}
          customStyles={{ marginTop: 16 }}
        />
      </View>
    ),
    3: (
      <PercentOrDollarPanel
        loadingStates={loadingStates}
        discountAmountDescription={(percentSelected, discountAmountInput) => (
          discountMethodIndex === '2'
            ? `This will set the price to $${discountAmountInput}`
            : `This will apply a ${percentSelected ? (discountAmountInput + '%') : ('$' + discountAmountInput)} discount off the single item`
        )
        }
        discountInputTestID='manual-item-discount-amount'
        percentButtonTestID='select-item-discount-percent-button'
        dollarButtonTestID='select-item-discount-dollar-button'
        applyButtonTestID='apply-manual-item-discount-button'
        onSubmitDiscount={(percentSelected, discountAmount) => {
          let discountTypeEnum = null
          if (discountMethodIndex === '2') discountTypeEnum = 2 // New price
          else {
            if (percentSelected) discountTypeEnum = 1 // Percent off
            else discountTypeEnum = 0 // Dollar off
          }
          dispatch(
            applyManualItemDiscountAction(
              {
                type: discountTypeEnum,
                amount: discountAmount,
                additionalDetail: couponInput.length > 0 ? couponInput : null,
                reason: Number(discountReasonEnum)
              },
              selectedItem
            )
          )
        }}
        disablePercentButton={discountMethodIndex === '2'}
        textInputRef={textInputRef}
        maxPercentAmount={100}
        maxDollarAmount={getPriceOfSelectedItemFromItemList(transactionItems, selectedItem, 'originalUnitPrice')}
        dollarAmountPurpose={discountMethodIndex === '2' ? 'newPrice' : 'discount'}
      />
    )
  }
  return (
    <>
      <Modal
        modalHeading={headingStepDictionary[itemDiscountStep]}
        modalName={'manualItemDiscount'}
        headingSize={32}
        minModalHeight={390}
        onDismiss={() => handleCloseModal()}
        dismissable={!loadingStates.manualDiscount}
      >
        <Breadcrumbs
          breadcrumbCount={3}
          currentProcessStep={itemDiscountStep}
          customContainerStyles={{ marginLeft: 34, marginTop: 12 }}
        />
        {panelStepDictionary[itemDiscountStep]}
        {
          itemDiscountStep > 1 &&
          <BackButton
            back={() => {
              setItemDiscountStep(itemDiscountStep - 1)
              if (itemDiscountStep === 3) dispatch(receiveUiData({ manualDiscountError: false }))
            }}
            position='bottom'
          />
        }
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  discountReasonPicker: {
    height: 52,
    minWidth: 343,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e3e4e4',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    marginTop: 48
  },
  textInput: {
    height: 64,
    width: 343,
    marginBottom: 11,
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    marginTop: 16
  },
  emptyTextInput: {
    fontWeight: '400',
    fontSize: 14,
    color: '#4F4F4F'
  },
  pageContainer: {
    height: 290,
    alignItems: 'center'
  }
})

export default CouponOverride
