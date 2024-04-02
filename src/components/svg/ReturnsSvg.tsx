import { View } from 'react-native'

interface ReturnsSvgProps {
  disabled: boolean
  circled: boolean
}

const ReturnsSvg = ({ disabled, circled }: ReturnsSvgProps) => {
  const buttonColor = disabled ? '#C8C8C8' : '#333'
  return (
    <>
      {circled
        ? <View style={{ marginTop: 12, marginBottom: -12 }}>
          <svg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='25' cy='25' r='25' fill='#F6841F'/>
            <path d='M24.0588 9H12.7647L9 14.6471H24.0588V9Z' fill='white'/>
            <path d='M25.9412 14.6471H41L37.2353 9H25.9412V14.6471Z' fill='white'/>
            <path fillRule='evenodd' clipRule='evenodd' d='M41 16.5294H9V41H41V16.5294ZM23.1581 29.7059L18.4118 24.9596L23.1581 20.2121L24.489 21.5431L21.9733 24.0588H27.8235C30.9421 24.0588 33.4706 26.5871 33.4706 29.7059C33.4706 32.8247 30.9421 35.3529 27.8235 35.3529H22.1765V33.4706H27.8235C29.9026 33.4706 31.5882 31.7852 31.5882 29.7059C31.5882 27.6267 29.9026 25.9412 27.8235 25.9412H22.0556L24.489 28.3749L23.1581 29.7059Z' fill='white'/>
          </svg>
        </View>
        : <svg style={{ marginTop: '16px', marginBottom: '-12px' }} width='46' height='46' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15.0833 0.416626H4.08333L0.416664 5.91663H15.0833V0.416626Z' fill={buttonColor}/>
          <path d='M16.9167 5.91663H31.5833L27.9167 0.416626H16.9167V5.91663Z' fill={buttonColor}/>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M31.5833 7.74996H0.416664V31.5833H31.5833V7.74996ZM14.2061 20.5833L9.58333 15.9606L14.2061 11.3367L15.5023 12.6331L13.0522 15.0833H18.75C21.7874 15.0833 24.25 17.5457 24.25 20.5833C24.25 23.6209 21.7874 26.0833 18.75 26.0833H13.25V24.25H18.75C20.7749 24.25 22.4167 22.6084 22.4167 20.5833C22.4167 18.5583 20.7749 16.9166 18.75 16.9166H13.1323L15.5023 19.287L14.2061 20.5833Z'
            fill={buttonColor}/>
        </svg>
      }
    </>
  )
}

export default ReturnsSvg
