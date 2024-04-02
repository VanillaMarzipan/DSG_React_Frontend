import { View } from 'react-native'

type TeammateSvgProps = {
  disabled: boolean
  selected: boolean
}

const TeammateSvg = ({
  disabled,
  selected
}: TeammateSvgProps) => (
  <View style={{ marginTop: 10, marginBottom: 3 }}>
    {selected
      ? (
        <View style={{ marginTop: 6, marginBottom: 4 }}>
          <svg width='48' height='48' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='25' cy='25' r='25' fill={disabled ? '#C8C8C8' : '#F6841F'} />
            <path d='M25 23.2222C28.866 23.2222 32 20.0385 32 16.1111C32 12.1838 28.866 9 25 9C21.134 9 18 12.1838 18 16.1111C18 20.0385 21.134 23.2222 25 23.2222Z' fill='white' />
            <path d='M39 41C39 33.1778 32.7 26.7778 25 26.7778C17.3 26.7778 11 33.1778 11 41H39Z' fill='white' />
          </svg>
        </View>
      )
      : (
        <svg width='58' height='58' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path fillRule='evenodd' clipRule='evenodd' d='M27 11.1111C27 15.0385 23.866 18.2222 20 18.2222C16.134 18.2222 13 15.0385 13 11.1111C13 7.18375 16.134 4 20 4C23.866 4 27 7.18375 27 11.1111ZM20 21.7778C27.7 21.7778 34 28.1778 34 36H6C6 28.1778 12.3 21.7778 20 21.7778Z' fill={disabled ? '#C8C8C8' : '#333333'} />
        </svg>
      )}
  </View>
)

export default TeammateSvg
