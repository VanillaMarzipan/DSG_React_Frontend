import Text from './StyledText'
import { useDispatch } from 'react-redux'
import { receiveUiData } from '../actions/uiActions'
import { useTypedSelector as useSelector } from '../reducers/reducer'
import CloseButton from './reusable/CloseButton'
import { clearProductLookupData, fetchLowestPriceAndName } from '../actions/productLookupActions'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import TextInput from './TextInput'
import { useState } from 'react'
import SearchIconSvg from './svg/SearchIconSvg'
import BarcodeSvg from './svg/BarcodeSvg'
import { sendAppInsightsEvent } from '../utils/appInsights'

const LowestPriceInquiryPanel = () => {
  const { lowestPriceInquiryItem, loadingActive, error, errorMessage, uiData } = useSelector(state => ({
    lowestPriceInquiryItem: state.productLookupData.lowestPriceInquiryItem,
    loadingActive: state.uiData.loadingStates.fetchLowestPriceAndName,
    error: state.productLookupData.lowestPriceInquiryError,
    errorMessage: state.productLookupData.lowestPriceInquiryErrorMessage,
    uiData: state.uiData
  }))

  const dispatch = useDispatch()

  const [lowestPriceInput, setLowestPriceInput] = useState('')

  const numericRegex = /^\d*$/
  const upcRegex = /[0-9]{12,13}/

  const nextButtonDisabled = !lowestPriceInput || !(upcRegex.test(lowestPriceInput.trim()))

  const getLowestPriceItem = () => {
    if (!upcRegex.test(lowestPriceInput?.trim())) {
      return
    }
    dispatch(fetchLowestPriceAndName(lowestPriceInput?.trim()))
    sendAppInsightsEvent('LowestPriceSearch', {
      upc: lowestPriceInput?.trim()
    })
    setLowestPriceInput('')
  }

  return (
    <View testID={'lowest-price-inquiry-panel'} style={styles.container}>
      <View style={{ paddingLeft: 25, minHeight: 576, display: 'flex', flexGrow: 1, maxHeight: '100%' }}>
        <View style={styles.heading}>
          <Text style={styles.headingText}>
            Lowest Price Inquiry
          </Text>
          <CloseButton
            testID='lowest-price-inquiry-close-button'
            dismisser={() => {
              dispatch(receiveUiData({
                autofocusTextbox: 'OmniSearch',
                footerOverlayActive: 'None'
              }))
              dispatch(clearProductLookupData())
            }}
            dismissable={!loadingActive}
            marginTop={0}
            marginRight={0}
          />
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            nativeID='lowest-price-inquiry-input'
            testID='lowest-price-inquiry-input'
            labelBackgroundColor={'#FFF'}
            label={'Type in the UPC of item'}
            style={styles.textInput}
            autoFocus={uiData.autofocusTextbox === 'ItemLookup'}
            error={uiData.returnsError !== false}
            mode='flat'
            onChangeText={(text) => {
              if (numericRegex.test(text)) {
                setLowestPriceInput(text ?? '')
              }
            }}
            onSubmitEditing={() => {
              getLowestPriceItem()
            }}
            disabled={loadingActive}
            clearable={true}
            value={lowestPriceInput}
            onClear={() => {
              setLowestPriceInput('')
            }}
            keyboardType={'numeric'}
            iconButton={
              <TouchableOpacity style={{
                height: '100%',
                justifyContent: 'center',
                paddingHorizontal: 8,
                marginRight: -8
              }} onPress={() => {
                getLowestPriceItem()
              }}>
                <SearchIconSvg color={'#006554'}/>
              </TouchableOpacity>
            }
          />
        </View>
        <View style={styles.panelContent}>
          {loadingActive
            ? <ActivityIndicator color='#000' style={styles.activityIndicator}/>
            : <>
              {error
                ? <View style={{ justifyContent: 'center', height: '100%', paddingBottom: 16 }}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
                : <>
                  {lowestPriceInquiryItem
                    ? <>
                      <View style={{ marginTop: 127, alignItems: 'center', marginHorizontal: 100 }}>
                        <Text style={styles.lowestPrice}>{lowestPriceInquiryItem?.lowestPrice}</Text>
                        <Text style={styles.name}>{lowestPriceInquiryItem?.name}</Text>
                        <Text style={styles.upc}>{lowestPriceInquiryItem?.upc}</Text>
                      </View>
                    </>
                    : <>
                      <View style={styles.orArea}>
                        <View style={styles.orLine}></View>
                        <Text style={{ color: '#666' }}>{'or'}</Text>
                        <View style={styles.orLine}></View>
                      </View>
                      <View>
                        <View style={{ marginHorizontal: 'auto' }}>
                          <BarcodeSvg />
                        </View>
                        <Text style={{ marginTop: 23, marginHorizontal: 'auto' }}>
                          {'Scan an Item'}
                        </Text>
                      </View>
                    </>}
                  <Text style={styles.noReceiptMessage}>
                    {'Without a receipt, refunds will be based on the lowest selling price of the item.'}
                  </Text>
                </>}
            </>
          }
        </View>
      </View>
      <TouchableOpacity
        testID='lowest-price-inquiry-next-button'
        style={[styles.nextButton, !nextButtonDisabled && { backgroundColor: '#BB5811' }]}
        onPress={() => {
          getLowestPriceItem()
        }}
        disabled={nextButtonDisabled}
      >
        <Text style={[styles.nextButtonText, !nextButtonDisabled && { color: 'white' }]}>Next</Text>
      </TouchableOpacity>
    </View>
  )
}
export default LowestPriceInquiryPanel

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 56
  },
  container: {
    minWidth: 525,
    width: '38%',
    backgroundColor: '#EDEDED',
    position: 'absolute',
    left: 32,
    top: 32,
    bottom: 99,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  },
  heading: {
    borderBottomWidth: 1,
    borderColor: '#979797',
    paddingBottom: 14,
    paddingTop: 25,
    marginRight: 25,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headingText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center'
  },
  searchContainer: {
    marginRight: 25,
    paddingHorizontal: 12,
    paddingVertical: 16
  },
  textInput: {
    width: '100%',
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    borderColor: '#A0A0A0',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  panelContent: {
    marginRight: 25,
    paddingHorizontal: 12,
    flex: 1
  },
  orArea: {
    marginVertical: 56,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  orLine: {
    width: 126,
    height: 1,
    backgroundColor: '#C5C5C5',
    marginLeft: 10,
    marginRight: 10
  },
  nextButton: {
    backgroundColor: '#C8C8C8',
    width: '100%',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 26
  },
  nextButtonText: {
    color: '#4F4F4F',
    letterSpacing: 1.5,
    fontFamily: 'Archivo-Bold'
  },
  noReceiptMessage: {
    marginHorizontal: 30,
    marginVertical: 56,
    fontSize: 16,
    color: '#B10216',
    textAlign: 'center',
    whiteSpace: 'normal'
  },
  lowestPrice: {
    color: '#BB5811',
    fontSize: 36,
    fontFamily: 'Archivo-Bold',
    letterSpacing: 0.5
  },
  name: {
    marginTop: 42,
    color: '#333333',
    fontSize: 24,
    fontFamily: 'Archivo-Bold',
    letterSpacing: 1,
    textAlign: 'center',
    whiteSpace: 'normal'
  },
  upc: {
    marginTop: 8,
    letterSpacing: 0.5,
    color: '#333333',
    fontSize: 16
  },
  errorMessage: {
    paddingLeft: 32,
    paddingRight: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 18,
    color: '#B10216',
    letterSpacing: 0.5,
    lineHeight: 42,
    textAlign: 'center',
    whiteSpace: 'wrap'
  }
})
