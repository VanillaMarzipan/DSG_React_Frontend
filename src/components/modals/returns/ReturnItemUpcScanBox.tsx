import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { UiDataTypes } from '../../../reducers/uiData'
import BarcodeSvg from '../../svg/BarcodeSvg'
import TextInput from '../../TextInput'

interface ReturnItemUpcScanBoxProps {
  uiData: UiDataTypes
  submitUpc: (string) => void
  displayBarcodeImage?: boolean
}

const ReturnItemUpcScanBox = ({ uiData, submitUpc, displayBarcodeImage = true }: ReturnItemUpcScanBoxProps) => {
  const [upc, setUpc] = useState('')

  const sendUpc = (value: string) => {
    setUpc('')
    submitUpc(value)
  }

  useEffect(() => {
    if (uiData.scanEvent?.scanValue && uiData.showModal === 'returns') {
      submitUpc(uiData.scanEvent.scanValue)
    }
  }, [uiData.scanEvent?.scanTime])

  return (
    <View>
      <TextInput
        autoFocus={true}
        nativeID='no-receipt-manual-input'
        testID='no-receipt-manual-input'
        labelBackgroundColor='white'
        label={'Type or scan UPC of items to be returned'}
        value={upc}
        onChangeText={text => {
          const reg = /^[0-9\b]+$/
          if (text.length >= 1 && !reg.test(text)) return
          setUpc(text)
        }}
        mode='outlined'
        maxLength={13}
        onSubmitEditing={() => {
          sendUpc(upc)
        }}
      />
      {displayBarcodeImage && (
        <View style={styles.barcodeSvgContainer}>
          <BarcodeSvg height={43} width={63} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  barcodeSvgContainer: {
    position: 'absolute',
    top: 13,
    right: 10
  }
})

export default ReturnItemUpcScanBox
