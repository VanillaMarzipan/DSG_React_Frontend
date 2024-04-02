import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface UnhandledExceptionProps {
  title: string
  message: string
}

const UnhandledException = ({
  title,
  message
}: UnhandledExceptionProps) => {
  return (
    <View style={styles.container}>
      <View><Text style={styles.title}>{title}</Text></View>
      <View><Text style={styles.text}>The exception was:</Text></View>
      <View><Text style={[styles.text, styles.errorText]}>{message}</Text></View>
      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={() => {
          window.location.reload()
        }}
      >
        <Text style={styles.buttonText}>
          REFRESH
        </Text>
      </TouchableOpacity>
      <View><Text style={[styles.text, { marginTop: 30 }]}>If this error continues, please contact (724) 273-3456,
        toll-free: (866) 418-3456</Text></View>
    </View>
  )
}

export default UnhandledException

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    maxWidth: 600,
    marginLeft: 383,
    marginTop: 100
  },
  title: {
    fontSize: 28
  },
  text: {
    fontSize: 16,
    lineHeight: 30
  },
  errorText: {
    color: 'red'
  },
  button: {
    width: '100%',
    height: 62,
    backgroundColor: '#006554',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }
})
