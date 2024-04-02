import { StyleSheet, View } from 'react-native'

interface FeedbackSvgProps {
  disabled: boolean
  circled: boolean
}

const FeedbackSvg = ({ disabled, circled }: FeedbackSvgProps) => {
  return (
    <>
      {circled
        ? <View style={{ marginTop: 11, marginBottom: -13 }}>
          <svg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='25' cy='25' r='25' fill='#F6841F'/>
            <path fillRule='evenodd' clipRule='evenodd' d='M12.1856 9H37.7984C39.5593 9 41 10.44 41 12.2V31.4C41 33.16 39.5593 34.6 37.7984 34.6H15.3872L9 41V12.2C9 10.44 10.4247 9 12.1856 9ZM34.5968 20.2H15.3872V23.4H34.5968V20.2ZM28.1936 28.2H15.3872V25H28.1936V28.2ZM15.3872 18.6H34.5968V15.4H15.3872V18.6Z' fill='white'/>
          </svg>
        </View>
        : <View style={styles.root}>
          <svg width='60' height='54' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M8.66676 6.33334H35.3334C37.1668 6.33334 38.6668 7.83334 38.6668 9.66668V29.6667C38.6668 31.5 37.1668 33 35.3334 33H12.0001L5.3501 39.6667V9.66668C5.3501 7.83334 6.83343 6.33334 8.66676 6.33334ZM32.0001 18H12.0001V21.3333H32.0001V18ZM25.3334 26.3333H12.0001V23H25.3334V26.3333ZM12.0001 16.3333H32.0001V13H12.0001V16.3333Z'
              fill={disabled ? '#C8C8C8' : '#333'}/>
          </svg>
        </View>
      }
    </>
  )
}

const styles = StyleSheet.create({
  root: {
    marginTop: 8,
    marginBottom: -14
  }
})

export default FeedbackSvg
