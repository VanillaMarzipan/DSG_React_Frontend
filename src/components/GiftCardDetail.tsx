import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import GiftCardDetailSvg from './svg/GiftCardDetailSvg'
import PropTypes from 'prop-types'
import { obfuscateAccountNumber } from '../utils/formatters'

interface GiftCardDetailsProps {
  accountNumber: string
  cardState: string
  error?: string
}

const GiftCardDetail = ({
  accountNumber,
  cardState,
  error
}: GiftCardDetailsProps): JSX.Element => {
  const [giftCardAccountNumber, setGiftCardAccountNumber] = useState<string>('')

  useEffect(() => {
    let obfuscatedAccountNumber = ''
    try {
      obfuscatedAccountNumber = obfuscateAccountNumber(accountNumber)
    } catch (err) {
      console.error('Unable to get obfuscated account number', err)
      obfuscatedAccountNumber = ''
    }
    setGiftCardAccountNumber(obfuscatedAccountNumber)
  }, [accountNumber])

  return (
    <>
      <View style={styles.container}>
        <GiftCardDetailSvg/>
        <View style={styles.textContainer}>
          <View style={[styles.textLineContainer, styles.textLine]}>
            <Text style={styles.column1}>Description:</Text>
            <Text style={styles.column2}>Gift Card</Text>
          </View>
          <View style={[styles.textLineContainer, styles.textLine]}>
            <Text style={styles.column1}>Account:</Text>
            <Text style={styles.column2}>{giftCardAccountNumber}</Text>
          </View>
          <View style={[styles.textLineContainer, styles.textLine]}>
            <Text style={styles.column1}>State:</Text>
            <Text style={styles.column2}>{cardState}</Text>
          </View>
        </View>
      </View>
      {error && (
        <View style={styles.textContainer}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      )}
    </>
  )
}
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center'
  },
  textContainer: {
    flexDirection: 'column',
    marginTop: 40
  },
  textLineContainer: {
    flexDirection: 'row',
    alignContent: 'space-between',
    width: '100%'
  },
  textLine: {
    paddingBottom: 16
  },
  column1: {
    width: 100
  },
  column2: {
    width: 150,
    textAlign: 'right'
  },
  error: {
    color: 'red'
  }
})

GiftCardDetail.propTypes = {
  accountNumber: PropTypes.string
}

export default GiftCardDetail
