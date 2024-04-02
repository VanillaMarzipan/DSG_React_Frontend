import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CssStyleType } from './BackButton'

interface DateTimeProps {
  transactionCardShowing: boolean
  customStyles?: CssStyleType
}

const DateTime = ({
  transactionCardShowing,
  customStyles
}: DateTimeProps) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const currentStyle = transactionCardShowing ? styles.containerLeft : styles.containerRight

  const setDateTime = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dt = new Date()
    setDate(daysOfWeek[dt.getDay()] + ', ' + monthsOfYear[dt.getMonth()] + ' ' + dt.getDate().toString())
    setTime(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }

  useEffect(() => {
    setDateTime()
    const interval = setInterval(() => {
      setDateTime()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <View style={[!transactionCardShowing && { marginLeft: 'auto' }, customStyles]}>
      <View style={currentStyle}>
        <Text style={[styles.timeText, !transactionCardShowing && { marginRight: -24 }]}>
          {transactionCardShowing && ('It\'s')}&nbsp;{date}
        </Text>
        <Text style={[styles.timeText, styles.timeLeft, !transactionCardShowing && { marginRight: -24 }]}>
          {time}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  containerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 4
  },
  containerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 5
  },
  timeLeft: {
    marginLeft: 7
  },
  timeText: {
    fontFamily: 'Archivo',
    color: '#797979',
    fontSize: 16
  }
})

export default DateTime
