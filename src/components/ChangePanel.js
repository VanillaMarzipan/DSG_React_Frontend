import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'

const ChangePanel = ({ cashTendered, changeDue, tenderType, isCashRefund }) => (
  <>
    <View style={[styles.rowContainer, { marginTop: 24 }]}>
      <Text
        style={{
          flex: 1,
          textAlign: 'center',
          fontWeight: '500',
          fontSize: 20
        }}
      >
        {tenderType} {isCashRefund ? 'Refund Due: ' : 'Tendered: '}<Text style={{ fontSize: 36 }}>$</Text>
        <Text style={{ fontSize: 36 }}>
          {cashTendered && isCashRefund ? (cashTendered * -1).toFixed(2) : cashTendered.toFixed(2)}
        </Text>
      </Text>
    </View>
    {isCashRefund
      ? <View style={{ minHeight: 73, minWidth: 312.75 }}/>
      : (
        <View style={[styles.rowContainer, { marginTop: 100 }]}>
          <Text
            nativeID='change-due'
            style={{
              flex: 1,
              textAlign: 'center',
              fontWeight: '500',
              fontSize: 20
            }}
          >
                        Change Due: <Text style={{ fontSize: 36 }}>$</Text>
            <Text testID='change-due' style={{ fontSize: 62 }}>
              {changeDue && changeDue.toFixed(2)}
            </Text>
          </Text>
        </View>
      )}
    <View
      style={[styles.rowContainer, { justifyContent: 'center', marginTop: 24 }]}
    >
      <Text testID='close-register-instructions' style={{ maxWidth: 300, textAlign: 'center' }}>
                Close Register Drawer After Giving Customer {isCashRefund ? 'Refund' : 'Change'}
      </Text>
    </View>
  </>
)

const styles = StyleSheet.create({
  rowContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 64,
    alignItems: 'center'
  }
})

ChangePanel.propTypes = {
  cashTendered: PropTypes.number.isRequired,
  changeDue: PropTypes.number.isRequired,
  tenderType: PropTypes.string,
  isCashRefund: PropTypes.bool
}

export default ChangePanel
