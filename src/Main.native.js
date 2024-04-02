import { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from './configureStore'
import { MemoryRouter } from 'react-router-dom'
import Routes from './routes/Routes'
import { Platform, StyleSheet } from 'react-native'
import * as Font from 'expo-font'

StyleSheet.setStyleAttributePreprocessor('fontFamily', Font.processFontFamily)

const store = configureStore()

class Main extends Component {
  state = {
    fontLoaded: false
  }

  async componentDidMount () {
    if (Platform.OS !== 'web') {
      await Font.loadAsync({
        Archivo: require('./assets/fonts/Archivo/Archivo-Regular.ttf'),
        'Archivo-Bold': require('./assets/fonts/Archivo/Archivo-Bold.ttf'),
        'Archivo-Italic': require('./assets/fonts/Archivo/Archivo-Italic.ttf'),
        'DSG-Sans-Bold': require('./assets/fonts/dsg-sans/fonts/DSGSans-Bold.ttf')
      })

      this.setState({ fontLoaded: true })
    }
  }

  render () {
    return (
      <Provider store={store}>
        {Platform.OS === 'web'
          ? (
            <MemoryRouter>
              <Routes/>
            </MemoryRouter>
          )
          : (
            <MemoryRouter>{this.state.fontLoaded && <Routes/>}</MemoryRouter>
          )}
      </Provider>
    )
  }
}

export default Main
