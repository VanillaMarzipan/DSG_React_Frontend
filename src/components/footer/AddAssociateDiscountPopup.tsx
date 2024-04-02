import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { addAssociateDiscount, receiveAssociateData, RECEIVE_ASSOCIATE_DATA } from '../../actions/associateActions'
import { omniSearch } from '../../actions/transactionActions'
import { receiveUiData } from '../../actions/uiActions'
import { useTypedSelector } from '../../reducers/reducer'
import { PanelsType } from '../../reducers/uiData'
import BackButton from '../BackButton'
import FooterOverlayModal from '../reusable/FooterOverlayModal'
import SubmitButton from '../reusable/SubmitButton'
import Text from '../StyledText'
import TextInput from '../TextInput'

interface AddAssociateDiscountPopupProps {
  activePanel: PanelsType
  isFamilyNight: boolean
}

const AddAssociateDiscountPopup = ({
  activePanel,
  isFamilyNight
}: AddAssociateDiscountPopupProps): JSX.Element => {
  const dispatch = useDispatch()
  const familyNightInputRef = useRef(null)
  const [associateDiscountNumber, setAssociateDiscountNumber] = useState('')
  const { familyNightModalStep, familyNightOmniSearchQuery, associateId } = useTypedSelector(state => state.associateData)
  const [familyNightAssociateID, setFamilyNightAssociateID] = useState('')
  const [familyNightCouponCode, setFamilyNightCouponCode] = useState('')
  const { scanError, modalErrorMessage, loadingStates, scanEvent } = useTypedSelector(state => state.uiData)
  const scanAssociateIdPrompt = 'Scan Associate ID barcode or type in the Associate ID number'
  const scanAssociateIdErrorMessage = 'Please scan an Associate ID'

  const onSubmitStandardAssociateDiscount = (scanValue: string = null) => {
    dispatch(omniSearch(
      (scanValue !== null) ? scanValue : associateDiscountNumber,
      associateId,
      'manual',
      null,
      null,
      activePanel
    ))
  }

  useEffect(() => {
    return () => {
      dispatch(receiveAssociateData({
        familyNightModalStep: 'associateID',
        familyNightOmniSearchQuery: ''
      }, RECEIVE_ASSOCIATE_DATA))
      dispatch(receiveUiData({
        modalErrorMessage: null,
        scanEvent: null
      }))
    }
  }, [])

  useEffect(() => {
    if (familyNightOmniSearchQuery?.length > 0) {
      if (familyNightOmniSearchQuery === associateId) {
        dispatch(receiveUiData({
          modalErrorMessage: 'Sorry, the associate ID entered cannot match the currently signed in associate'
        }))
        dispatch(receiveAssociateData({
          familyNightModalStep: 'associateID'
        }, RECEIVE_ASSOCIATE_DATA))
        setFamilyNightAssociateID(familyNightOmniSearchQuery)
      } else if (familyNightModalStep === 'associateID') {
        setFamilyNightCouponCode(familyNightOmniSearchQuery)
      } else {
        setFamilyNightAssociateID(familyNightOmniSearchQuery)
      }
    }
  }, [familyNightOmniSearchQuery])

  const disableFamilyNightSubmitButton = (
    loadingStates.addAssociateDiscount ||
    (familyNightModalStep === 'associateID' && familyNightAssociateID.length < 7) ||
    (familyNightModalStep === 'couponCode' && familyNightCouponCode.length < 9)
  )

  const onSubmitFamilyNightDiscount = () => {
    dispatch(receiveUiData({
      modalErrorMessage: null
    }))
    if (disableFamilyNightSubmitButton) {
      return
    }

    if (familyNightModalStep === 'associateID' && associateId === familyNightAssociateID) {
      dispatch(receiveUiData({
        modalErrorMessage: 'Sorry, the associate ID entered cannot match the currently signed in associate'
      }))
      return
    }
    if (familyNightAssociateID.length >= 7 && familyNightCouponCode.length > 0) {
      dispatch(addAssociateDiscount({
        associateId: familyNightAssociateID,
        familyNightCouponCode: familyNightCouponCode
      }))
    } else if (familyNightModalStep === 'couponCode' && familyNightAssociateID.length === 0) {
      dispatch(receiveAssociateData({
        familyNightModalStep: 'associateID'
      }, RECEIVE_ASSOCIATE_DATA))
      setTimeout(() => familyNightInputRef?.current?.focus(), 100)
    } else if (familyNightModalStep === 'associateID' && familyNightCouponCode.length === 0) {
      dispatch(receiveAssociateData({
        familyNightModalStep: 'couponCode'
      }, RECEIVE_ASSOCIATE_DATA))
      setTimeout(() => familyNightInputRef?.current?.focus(), 100)
    }
  }

  const onSubmitFamilyNightNoCoupon = () => {
    if (familyNightAssociateID.length < 7) return
    if (familyNightAssociateID.length >= 7) {
      dispatch(addAssociateDiscount({
        associateId: familyNightAssociateID
      }))
    }
  }
  const isAssociateValid = () => {
    const associateIdReg = /^[0-9]{7}(01)?$/
    return associateIdReg.test(associateDiscountNumber)
  }

  const handleFamilyNightScan = (scanValue) => {
    if (familyNightModalStep === 'associateID') return
    setFamilyNightCouponCode(scanValue)
    if (familyNightModalStep === 'couponCode' && familyNightAssociateID.length >= 7) {
      dispatch(addAssociateDiscount({
        associateId: familyNightAssociateID,
        familyNightCouponCode: scanValue
      }))
    }
  }

  useEffect(() => {
    if (scanEvent && scanEvent.scanValue) {
      if (isFamilyNight) {
        handleFamilyNightScan(scanEvent.scanValue)
      } else {
        if (scanEvent.scanValue.length <= 10) {
          setAssociateDiscountNumber(scanEvent.scanValue)
        } else {
          dispatch(receiveUiData({
            scanError: true,
            modalErrorMessage: scanAssociateIdErrorMessage
          }))
        }
      }
    }
  }, [scanEvent?.scanTime])

  useEffect(() => {
    if (modalErrorMessage && isFamilyNight) {
      setTimeout(() => familyNightInputRef?.current?.focus(), 100)
    }
  }, [loadingStates.addAssociateDiscount, modalErrorMessage])

  const collectFamilyNightAssociateID = familyNightModalStep === 'associateID'
  return (
    <FooterOverlayModal
      modalName='addAssociateDiscount'
      modalHeading={isFamilyNight ? 'TEAMMATE AND FAMILY SALE' : 'ADD ASSOCIATE DISCOUNT'}
      minModalHeight={384}
      centerChildren={!isFamilyNight}
      dismissable={!loadingStates.addAssociateDiscount}
      onClickClose={() => {
        dispatch(receiveUiData({
          showAddAssociateDiscount: false,
          scanError: false,
          modalErrorMessage: null
        }))
      }}
    >
      {
        isFamilyNight
          ? (
            <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <View style={{ marginLeft: 32, width: '91%' }}>
                <Text style={{ marginBottom: 48, color: '#666666' }}>
                  {
                    familyNightModalStep === 'couponCode' && (familyNightAssociateID?.length > 6 || familyNightOmniSearchQuery?.length > 6) &&
                      (
                        `Associate ID: ${familyNightOmniSearchQuery || familyNightAssociateID}`
                      )
                  }
                  {
                    familyNightModalStep === 'associateID' && familyNightOmniSearchQuery !== associateId && (familyNightCouponCode?.length >= 7 || familyNightOmniSearchQuery?.length > 6) &&
                    (
                      `Coupon Number: ${familyNightOmniSearchQuery || familyNightCouponCode}`
                    )
                  }
                </Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ marginBottom: 33 }}>
                    {
                      collectFamilyNightAssociateID ? 'Input the Associate ID, written on the back of the coupon' : 'Scan coupon barcode or type in the coupon number'
                    }
                  </Text>
                  <TextInput
                    ref={familyNightInputRef}
                    nativeID='family-night-discount-input'
                    testID='family-night-discount-input'
                    labelBackgroundColor='white'
                    label={collectFamilyNightAssociateID ? 'Associate ID' : 'Coupon Number'}
                    style={styles.textInput}
                    autoFocus={true}
                    value={collectFamilyNightAssociateID ? familyNightAssociateID : familyNightCouponCode.toUpperCase()}
                    error={scanError || modalErrorMessage}
                    onFocus={e => {
                      e?.currentTarget?.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)
                    }}
                    onChangeText={text => {
                      if (collectFamilyNightAssociateID) {
                        const reg = /^[0-9\b]+$/
                        if (text.length >= 1 && !reg.test(text)) return
                        setFamilyNightAssociateID(text)
                      }
                      collectFamilyNightAssociateID ? setFamilyNightAssociateID(text) : setFamilyNightCouponCode(text)
                    }}
                    mode='outlined'
                    maxLength={collectFamilyNightAssociateID ? 7 : null}
                    onSubmitEditing={() => {
                      onSubmitFamilyNightDiscount()
                    }}
                  />
                  {modalErrorMessage && (
                    <Text style={{ marginBottom: 33, color: '#B80818' }}>
                      {modalErrorMessage}
                    </Text>
                  )}
                  <View style={!collectFamilyNightAssociateID && { display: 'flex', flexDirection: 'row' }}>
                    {
                      !collectFamilyNightAssociateID && (
                        <SubmitButton
                          testID='family-night-no-coupon'
                          buttonLabel='NO COUPON AVAILABLE'
                          disabled={loadingStates.addAssociateDiscount}
                          customStyles={{ marginRight: 20, backgroundColor: '#FFFFFF', borderColor: '#2C2C2C', borderWidth: 2, marginBottom: modalErrorMessage ? 70 : 45 }}
                          customTextStyles={{ color: '#2C2C2C' }}
                          loading={loadingStates.addAssociateDiscount && familyNightCouponCode.length === 0}
                          onSubmit={() => {
                            onSubmitFamilyNightNoCoupon()
                          }}
                        />
                      )
                    }
                    <SubmitButton
                      testID='submit-family-night-discount'
                      buttonLabel='ENTER'
                      disabled={disableFamilyNightSubmitButton}
                      loading={loadingStates.addAssociateDiscount && familyNightCouponCode.length > 0}
                      onSubmit={() => {
                        onSubmitFamilyNightDiscount()
                      }}
                    />
                  </View>
                </View>
              </View>
              {familyNightModalStep === 'couponCode' && <BackButton
                position='bottom'
                style={{
                  bottom: modalErrorMessage ? -10 : -52,
                  left: -20
                }}
                back={() => {
                  dispatch(receiveAssociateData({
                    familyNightModalStep: 'associateID',
                    familyNightOmniSearchQuery: ''
                  }, RECEIVE_ASSOCIATE_DATA))
                  setFamilyNightCouponCode('')
                  setTimeout(() => {
                    familyNightInputRef?.current?.focus()
                  }, 100)
                }}
              />}
            </View>
          )
          : (
            <>
              <Text style={[{ marginBottom: 33 }, scanError && { color: '#8D0D02' }]}>
                {scanError ? modalErrorMessage : scanAssociateIdPrompt}
              </Text>
              <TextInput
                nativeID='add-associate-discount-input'
                testID='add-associate-discount-input'
                labelBackgroundColor='white'
                label='Associate ID Number'
                style={styles.textInput}
                autoFocus={true}
                value={associateDiscountNumber}
                error={scanError}
                onChangeText={text => {
                  const reg = /^[0-9\b]+$/
                  if (text.length >= 1 && !reg.test(text)) return
                  setAssociateDiscountNumber(text)
                }}
                mode='outlined'
                maxLength={9}
                onSubmitEditing={() => {
                  onSubmitStandardAssociateDiscount()
                }}
              />
              <SubmitButton
                testID='submit-add-associate-discount'
                buttonLabel='ENTER'
                disabled={!isAssociateValid()}
                loading={loadingStates?.omniSearch !== null}
                onSubmit={() => {
                  onSubmitStandardAssociateDiscount()
                }}
              />
            </>
          )
      }
    </FooterOverlayModal>
  )
}

export default AddAssociateDiscountPopup

const styles = StyleSheet.create({
  textInput: {
    marginBottom: 24,
    width: 331,
    height: 60
  }
})
