import { StyleSheet } from 'react-native'

const GiftCardStyles = StyleSheet.create({
  activityIndicator: {
    marginTop: 32
  },
  amountConfirm: {
    fontSize: 36,
    fontWeight: '700',
    color: '#BB5811',
    marginTop: 16,
    marginBottom: 16
  },
  amountInput: {
    borderWidth: 1,
    width: 150,
    height: 52,
    fontSize: 36,
    fontWeight: '700',
    color: '#4F4F4F',
    textAlign: 'center',
    borderColor: '#959595',
    marginTop: 15,
    marginBottom: 15
  },
  amountInputEmpty: {
    fontSize: 16
  },
  amountInputError: {
    borderColor: '#B10216'
  },
  backButton: {
    marginTop: 285
  },
  breadCrumbs: {
    marginTop: 10,
    marginLeft: 35
  },
  complimentaryCardTypeSubHeader: {
    fontSize: 24,
    fontWeight: '700'
  },
  confirmText: {
    marginBottom: 67
  },
  confirmButton: {
    width: 250,
    height: 44
  },
  container: {
    flex: 1,
    alignItems: 'center',
    height: 231,
    maxHeight: 231,
    minHeight: 231,
    fontSize: 16
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 32
  },
  errorText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B10216'
  },
  errorTextCramped: {
    lineHeight: 20
  },
  optionButton: {
    borderColor: '#BB5811',
    borderWidth: 2,
    width: 270,
    height: 44,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionButtonDisabled: {
    backgroundColor: '#c0c0c0',
    borderColor: '#c0c0c0'
  },
  optionButtonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    color: '#BB5811',
    textTransform: 'uppercase',
    fontWeight: '700'
  },
  optionButtonTextDisabled: {
    color: '#4F4F4F'
  },
  swipeError: {
    width: 350,
    color: '#B10216',
    marginLeft: 246,
    position: 'absolute',
    bottom: 0,
    alignItems: 'flex-end'
  },
  textBody: {
    fontSize: 16
  },
  textContainer: {
    alignItems: 'center'
  },
  textEmphasized: {
    fontWeight: '700'
  },
  textHeader: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 24
  },
  textUnbroken: {
    flexDirection: 'row'
  }
})

export default GiftCardStyles
