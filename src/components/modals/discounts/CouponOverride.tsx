import { useEffect, useRef } from 'react'
import Modal from '../Modal'
import { useTypedSelector as useSelector } from '../../../reducers/reducer'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../../../actions/uiActions'
import PercentOrDollarPanel from '../../reusable/PercentOrDollarPanel'
import { overrideCoupon } from '../../../actions/transactionActions'

const CouponOverride = (): JSX.Element => {
  const dispatch = useDispatch()
  const textInputRef = useRef(null)
  const { loadingStates, couponToDisplayIndex } = useSelector(state => state.uiData)

  useEffect(() => {
    setTimeout(() => textInputRef?.current?.focus(), 1)
  })

  const handleCloseModal = () => {
    dispatch(receiveUiData({
      manualDiscountError: false,
      scanErrorMessage: null,
      scanError: false,
      autofocusTextbox: 'OmniSearch',
      clearUpc: true
    }))
  }

  const coupons = useSelector(state => state.transactionData?.coupons)
  return (
    <>
      <Modal
        modalHeading={'MANUAL DISCOUNT'}
        modalName={'couponOverride'}
        headingSize={32}
        onDismiss={() => handleCloseModal()}
        dismissable={!loadingStates.manualDiscount}
      >
        <PercentOrDollarPanel
          loadingStates={loadingStates}
          discountAmountDescription={(percentSelected, discountAmountInput) => (
            `This will apply a ${percentSelected ? (discountAmountInput + '%') : ('$' + discountAmountInput)} coupon off the entire transaction`
          )
          }
          discountInputTestID='coupon-override-amount'
          percentButtonTestID='select-percent-button'
          dollarButtonTestID='select-dollar-button'
          applyButtonTestID='apply-coupon-button'
          onSubmitDiscount={(percentSelected, discountAmount) => {
            dispatch(overrideCoupon({
              couponCode: coupons?.length > 0 ? coupons[couponToDisplayIndex].couponCode : null,
              couponOverrideDetail: {
                overrideType: percentSelected ? 2 : 3,
                dollarOrPercentOff: Number(discountAmount)
              }
            }))
          }}
          disablePercentButton={false}
          textInputRef={textInputRef}
          maxPercentAmount={100}
          maxDollarAmount={100}
          dollarAmountPurpose='discount'
        />
      </Modal>
    </>
  )
}

export default CouponOverride
