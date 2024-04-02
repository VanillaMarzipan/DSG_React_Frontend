import { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import PropTypes from 'prop-types'

class BarcodeScanner extends Component {
  state = {
    hasCameraPermission: null
  }

  async componentDidMount () {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }

  render () {
    const { hasCameraPermission } = this.state
    const { fetchItem } = this.props

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>
    }

    return (
      <>
        <View
          style={{
            flex: 1,
            width: 300
          }}
        >
          <BarCodeScanner
            onBarCodeScanned={res => fetchItem(parseInt(res.data))}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </>
    )
  }
}

// This version uses react hooks. Not available until expo react-native sdk 33 is released
// const BarcodeScanner = () => {
//   const [hasCameraPermission, setPermission] = useState(null)

//   useEffect(async () => {
//     const { status } = await Permissions.askAsync(Permissions.CAMERA)
//     setPermission(status === 'granted')
//   })

//   if (hasCameraPermission === null) {
//     return <Text>Requesting for camera permission</Text>
//   }
//   if (hasCameraPermission === false) {
//     return <Text>No access to camera</Text>
//   }

//   return (
//     <GlobalConsumer>
//       {({ fetchItem }) => (
//         <View style={{ flex: 1 }}>
//           <BarCodeScanner onBarCodeScanned={fetchItem(data)} />
//         </View>
//       )}
//     </GlobalConsumer>
//   )
// }

BarcodeScanner.propTypes = {
  fetchItem: PropTypes.func
}

export default BarcodeScanner
