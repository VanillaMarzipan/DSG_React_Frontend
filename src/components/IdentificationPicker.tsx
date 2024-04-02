import { Picker, StyleSheet, View } from 'react-native'
import { CssStyleType } from './BackButton'

export interface IdentificationPickerProps {
  identificationType: string
  setIdentificationType: (type: string) => void
  customStyles?: CssStyleType
  idTypeTextLabels
}

const IdentificationPicker = ({
  identificationType,
  setIdentificationType,
  customStyles,
  idTypeTextLabels
}: IdentificationPickerProps) => {
  return (
    <View style={styles.container}>
      <>
        <Picker
          testID='identification-picker'
          onValueChange={value => setIdentificationType(value)}
          /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          value={identificationType}
          style={[styles.identificationPicker, customStyles && customStyles]}
        >
          <Picker.Item testID='identification-default' key='-1' label='Identification Type' value='-1'></Picker.Item>
          {idTypeTextLabels[0] && (
            <Picker.Item testID='identification-drivers-license' key='0' label="Driver's License" value='0'></Picker.Item>
          )}
          {idTypeTextLabels[4] && (
            <Picker.Item testID='identification-state-id' key='4' label='State ID' value='4'></Picker.Item>
          )}
          {idTypeTextLabels[1] && (
            <Picker.Item testID='identification-passport' key='1' label='Passport' value='1'></Picker.Item>
          )}
          {idTypeTextLabels[2] && (
            <Picker.Item testID='identification-military-id' key='2' label='Military ID' value='2'></Picker.Item>
          )}
        </Picker>
      </>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  identificationPicker: {
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

export default IdentificationPicker
