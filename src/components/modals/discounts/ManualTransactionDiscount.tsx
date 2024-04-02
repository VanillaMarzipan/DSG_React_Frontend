import { useEffect, useRef, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import Modal from '../Modal'
import { useTypedSelector as useSelector } from '../../../reducers/reducer'
import { Picker } from '@react-native-picker/picker'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../../actions/uiActions'
import SubmitButton from '../../reusable/SubmitButton'
import PercentOrDollarPanel from '../../reusable/PercentOrDollarPanel'
import { applyManualTransactionDiscountAction } from '../../../actions/transactionActions'
import Breadcrumbs from '../../Breadcrumbs'
import BackButton from '../../BackButton'

export const manualDiscountReasons = [
  {
    enum: '0',
    label: 'Manager Discount',
    testID: 'manual-transaction-discount-reason-manager'
  },
  {
    enum: '1',
    label: 'Coupon Discount',
    testID: 'manual-transaction-discount-reason-coupon'
  },
  {
    enum: '2',
    label: 'Package Price Discount',
    testID: 'manual-transaction-discount-package'
  }
]

const ManualDiscount = (): JSX.Element => {
  const dispatch = useDispatch()
  const textInputRef = useRef(null)
  const [transactionDiscountStep, setTransactionDiscountStep] = useState(1)
  const { loadingStates } = useSelector(state => state.uiData)
  const associateData = useSelector(state => state.associateData)
  useEffect(() => {
    setTimeout(() => textInputRef?.current?.focus(), 1)
  })

  const [discountReasonInput, setDiscountReasonInput] = useState('')

  const [discountReasonEnum, setDiscountReasonEnum] = useState('-1') // 0 - manager | 1 - coupon | 2 - package

  useEffect(() => {
    if (discountReasonEnum !== '1') {
      setDiscountReasonInput('')
    }
  }, [discountReasonEnum])

  const handleCloseModal = () => {
    setTransactionDiscountStep(1)
    dispatch(receiveUiData({
      manualDiscountError: false,
      scanErrorMessage: null,
      scanError: false,
      autofocusTextbox: 'OmniSearch',
      clearUpc: true
    }))
    setDiscountReasonEnum('-1')
    setDiscountReasonInput('')
  }

  const discountMethodIsPackagePrice = discountReasonEnum === '2'

  const panelStepDictionary = {
    1: (
      <View style={[styles.container]}>
        <Picker
          testID='identification-picker'
          onValueChange={value => setDiscountReasonEnum(value)}
          selectedValue={discountReasonEnum}
          style={styles.discountReasonPicker}
        >
          <Picker.Item testID='manual-discount-reason-default' key='-1' label='Select Reason Why' value='-1' />
          {manualDiscountReasons.map((reason, index) => (
            <Picker.Item testID={reason.testID} key={`manual-discount-reason-${index}`} label={reason.label} value={reason.enum} />
          ))}
        </Picker>
        {(discountReasonEnum === '1') &&
          <View style={[styles.textInputWrapper, discountReasonInput === '' && styles.disabledTextInput]}>
            <TextInput
              ref={textInputRef}
              placeholder={'Enter Coupon Number'}
              testID='coupon-code-input'
              autoFocus={true}
              value={discountReasonInput}
              style={[styles.textInput, discountReasonInput === '' && styles.emptyTextInput]}
              onChange={e => setDiscountReasonInput(e.nativeEvent.text)}
            />
          </View>
        }
        <SubmitButton
          testID='submit-manual-discount-reason-button'
          disabled={discountReasonEnum === '-1' || (discountReasonEnum === '1' && discountReasonInput === '')}
          onSubmit={() => {
            setTransactionDiscountStep(2)
          }}
          buttonLabel='NEXT'
        />
      </View>
    ),
    2: (
      <View style={styles.percentDollarWrapper}>
        <PercentOrDollarPanel
          loadingStates={loadingStates}
          disablePercentButton={loadingStates.manualDiscount || discountReasonEnum === '2'}
          discountAmountDescription={(percentSelected, discountAmountInput) => (
            discountReasonEnum === '2'
              ? `This will set the transaction subtotal to $${discountAmountInput}`
              : `This will apply a ${percentSelected ? discountAmountInput + '%' : '$' + discountAmountInput} discount off the entire transaction`
          )
          }
          discountInputTestID='manual-discount-amount'
          percentButtonTestID='select-discount-percent-button'
          dollarButtonTestID='select-manual-dollar-button'
          applyButtonTestID='apply-discount-button'
          onSubmitDiscount={(percentSelected, discountAmountInput) => {
            let additionalDetail = null
            if (discountReasonEnum === '0') { // Manager Discount
              if (associateData.isManager) {
                additionalDetail = associateData.associateId
              } else {
                additionalDetail = 'pendingManagerID' // intentional placeholder to have request return original transaction subtotal
              }
            } else if (discountReasonEnum === '1') {
              additionalDetail = discountReasonInput
            }

            let transactionDiscountType = 0 // Manager Discount
            if (percentSelected) transactionDiscountType = 1 // Coupon Discount
            else if (discountReasonEnum === '2') transactionDiscountType = 2 // Package Price

            dispatch(applyManualTransactionDiscountAction({
              reason: Number(discountReasonEnum),
              type: transactionDiscountType,
              amount: Number(discountAmountInput),
              additionalDetail: additionalDetail
            }))
          }}
          textInputRef={textInputRef}
          maxPercentAmount={100}
          maxDollarAmount={null}
          dollarAmountPurpose={discountMethodIsPackagePrice ? 'newPrice' : 'discount'}
        />
      </View>
    )
  }
  return (
    <>
      <Modal
        modalHeading={transactionDiscountStep === 1 ? 'REASON FOR DISCOUNTING?' : ' DISCOUNT ON TRANSACTION'}
        modalName={'manualTransactionDiscount'}
        headingSize={32}
        onDismiss={() => handleCloseModal()}
        dismissable={!loadingStates.manualDiscount}
      >
        <Breadcrumbs
          breadcrumbCount={2}
          currentProcessStep={transactionDiscountStep}
          customContainerStyles={styles.customBreadCrumbs}
          customLineWidth={36}
        />
        {panelStepDictionary[transactionDiscountStep]}
        {
          transactionDiscountStep > 1 &&
          <BackButton
            back={() => {
              setTransactionDiscountStep(transactionDiscountStep - 1)
              if (transactionDiscountStep === 2) dispatch(receiveUiData({ manualDiscountError: false }))
            }}
            position='bottom'
          />
        }
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: 636,
    alignItems: 'center'
  },
  percentDollarWrapper: {
    height: 275
  },
  customBreadCrumbs: {
    marginLeft: 34,
    marginTop: 12
  },
  textInputWrapper: {
    borderColor: '#191F1C',
    borderWidth: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: 340,
    marginTop: 12,
    marginBottom: 32
  },
  textInput: {
    fontFamily: 'Archivo',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 32,
    color: '#191F1C',
    height: 52,
    width: 340
  },
  disabledTextInput: {
    borderColor: '#c8c8c8'
  },
  emptyTextInput: {
    fontWeight: '400',
    fontSize: 14,
    color: '#4F4F4F'
  },
  discountReasonPicker: {
    marginTop: 14,
    height: 52,
    minWidth: 343,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e3e4e4',
    fontSize: 18,
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5
  }
})

export default ManualDiscount
