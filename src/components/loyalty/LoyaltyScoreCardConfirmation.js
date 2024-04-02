import { Component } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import PropTypes from 'prop-types'
import { printEnrollmentConfirmationReceipt } from '../../utils/cefSharp'

class LoyaltyScoreCardConfirmation extends Component {
  render () {
    const { customer } = this.props
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>ScoreCard Enrollment Successful</Text>
        <Text style={styles.info}>
          {customer.firstName} {customer.lastName}
        </Text>
        <Text style={styles.info}>Scorecard #{customer.loyalty}</Text>
        <Text style={styles.receiveConfirmation}>Receive Confirmation Via</Text>
        <View style={styles.selection}>
          <TouchableOpacity
            onPress={() => {
              console.info('ACTION: components > loyalty > LoyaltyScoreCardConfirmation > onPress')
              printEnrollmentConfirmationReceipt(customer.loyalty)
            }}
          >
            <View style={[styles.button, styles.greenButton]}>
              <Text style={[styles.buttonText, styles.greenText]}>PRINT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = {
  panel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 250,
    marginTop: 40
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 0.3,
    lineHeight: 24,
    marginBottom: 10
  },
  info: {
    fontSize: 18,
    lineHeight: 20
  },
  receiveConfirmation: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 10
  },
  selection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  button: {
    width: 120,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    borderWidth: 2,
    marginLeft: 30,
    marginRight: 30
  },
  orangeButton: {
    borderColor: '#D76B00'
  },
  greenButton: {
    borderColor: '#006554'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  orangeText: {
    color: '#D76B00'
  },
  greenText: {
    color: '#006554'
  }
}

LoyaltyScoreCardConfirmation.propTypes = {
  printConfirmationEnrollment: PropTypes.func,
  customer: PropTypes.object
}

export default LoyaltyScoreCardConfirmation
