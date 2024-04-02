import { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import PropTypes from 'prop-types'

class Login extends Component {
  state = {
    associateNum: '',
    pin: '',
    error: false,
    associateNumError: false,
    pinError: false
  }

  componentDidMount () {
    this.setState({ error: false, associateNumError: false, pinError: false })
  }

  updateLoginError = value => this.setState({ error: value })

  associateIdInput = text => {
    this.updateLoginError(false)
    const cleanText = text.trim()
    const textLength = cleanText.length
    const regEx = /^\d*$/
    if (regEx.test(cleanText) && textLength < 8) {
      this.setState({
        associateNum: cleanText,
        associateNumError: !/^\d{7}$/.test(cleanText) && textLength > 0
      })
    }
  }

  pinInput = text => {
    this.updateLoginError(false)
    this.setState({
      pin: /^\d*$/.test(text) ? text : '',
      pinError: !/^\d{6}$/.test(text) && text.trim().length > 0
    })
  }

  render () {
    const { associateNum, pin, error, associateNumError, pinError } = this.state
    const { theme, onSubmitLogin } = this.props
    return (
      <View style={styles.app}>
        <Header/>
        <View style={styles.mainContainer}>
          <View
            style={[
              styles.root,
              {
                height: '100%'
              }
            ]}
          >
            <View
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <TextInput
                style={styles.textField}
                labelBackgroundColor={theme.backgroundColor}
                nativeID='associate-num'
                label='Associate Number'
                error={associateNumError || error}
                value={associateNum}
                onChangeText={text => this.associateIdInput(text)}
                mode='outlined'
                autoFocus={true}
                onSubmitEditing={() => onSubmitLogin(associateNum, pin)}
                color={theme.fontColor}
                maxLength={7}
              />
              {associateNumError && (
                <View>
                  <Text style={{ color: '#8d0d02' }}>
                                        Invalid Associate Number
                  </Text>
                </View>
              )}
              <TextInput
                style={styles.textField}
                secureTextEntry={true}
                textContentType='password'
                labelBackgroundColor={theme.backgroundColor}
                nativeID='associate-pin'
                label='PIN'
                error={pinError || error}
                value={pin}
                onChangeText={text => this.pinInput(text)}
                onSubmitEditing={() => onSubmitLogin(associateNum, pin)}
                mode='outlined'
                color={theme.fontColor}
                maxLength={6}
              />
              {pinError && (
                <View>
                  <Text style={{ color: '#8d0d02' }}>Invalid PIN</Text>
                </View>
              )}
              <TouchableOpacity
                nativeID='login-submit'
                onPress={() => {
                  onSubmitLogin(associateNum, pin)
                }}
              >
                <View style={styles.button}>
                  <Text style={styles.buttonText}>ENTER</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Login

const styles = StyleSheet.create({
  root: {
    minHeight: 206,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  container: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  textField: {
    minWidth: 390,
    height: 60,
    marginBottom: 16,
    borderRadius: 0
  },
  button: {
    width: 260,
    height: 40,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#f9f9f9',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  app: {
    flex: 1,
    display: 'flex'
  },
  appHeader: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  grid: {
    flex: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  gridContainer: {
    flexWrap: 'wrap',
    width: '100%',
    flex: 1
  },
  gridItem: {
    margin: 0,
    flexDirection: 'column'
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    borderTopWidth: 2,
    borderColor: '#a7a7a7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

Login.propTypes = {
  theme: PropTypes.object,
  onSubmitLogin: PropTypes.func
}
