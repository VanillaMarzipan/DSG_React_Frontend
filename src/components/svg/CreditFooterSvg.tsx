import { View } from 'react-native'

interface CreditFooterSvgProps {
  disabled: boolean
}

function CreditFooterSvg ({ disabled }: CreditFooterSvgProps) {
  let fillColor = '#333'
  if (disabled) fillColor = '#C8C8C8'
  return (
    <View style={{ marginTop: 8 }}>
      <svg width='60' height='60' viewBox='0 0 40 26' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M0 2C0 0.895432 0.89543 0 2 0H38C39.1046 0 40 0.89543 40 2V23.9459C40 25.0505 39.1046 25.9459 38 25.9459H2C0.895431 25.9459 0 25.0505 0 23.9459V2Z'
          fill={fillColor}/>
        <rect x='3.24316' y='20.5405' width='10.8108' height='1.08108' fill='white'/>
        <rect x='3.24316' y='3.24316' width='5.40541' height='1.08108' fill='white'/>
        <rect x='14.0542' y='3.24316' width='22.7027' height='8.64865' fill='#F9F9F9'/>
        <path
          d='M17.5253 9.6705V5.46442H16.6169V9.6705H17.5253ZM15.1353 10.8107V4.32422H18.1692L19.007 5.12658V10.0083L18.1692 10.8107H15.1353Z'
          fill={fillColor}/>
        <path d='M19.5891 4.32422H21.0708V10.8107H19.5891V4.32422Z' fill={fillColor}/>
        <path
          d='M25.4981 6.64263H24.0165V5.46442H23.1301V9.6705H24.0165V8.36983H25.4981V10.0083L24.6559 10.8107H22.4907L21.6484 10.0083V5.12658L22.4907 4.32422H24.6559L25.4981 5.12658V6.64263Z'
          fill={fillColor}/>
        <path
          d='M27.5001 10.8107H26.0185V4.32422H27.5001V6.95513H27.5442L28.435 4.32422H29.9475L28.8451 7.39432L29.9916 10.8107H28.4262L27.5442 8.09533H27.5001V10.8107Z'
          fill={fillColor}/>
        <path d='M31.3851 4.32422V5.57L30.7986 6.41037H30.3003L30.6619 5.57H30.3003V4.32422H31.3851Z' fill={fillColor}/>
        <path
          d='M31.8261 8.61476H33.3078V9.6705H34.2294V8.45006L32.5669 7.92219L31.8261 7.16206V5.12658L32.6684 4.32422H34.8247L35.667 5.12658V6.47793H34.1853V5.46442H33.2725V6.64263L34.935 7.16206L35.6758 7.92219V10.0083L34.8335 10.8107H32.6684L31.8261 10.0083V8.61476Z'
          fill={fillColor}/>
        <ellipse cx='4.05397' cy='15.9461' rx='0.810811' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='6.21608' cy='15.9461' rx='0.810811' ry='0.810811' fill='#F9F9F9'/>
        <circle cx='8.37819' cy='15.9461' r='0.810811' fill='#F9F9F9'/>
        <ellipse cx='13.7835' cy='15.9461' rx='0.81081' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='15.9456' cy='15.9461' rx='0.81081' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='18.1077' cy='15.9461' rx='0.81081' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='22.4324' cy='15.9461' rx='0.810812' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='24.5945' cy='15.9461' rx='0.810811' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='26.7566' cy='15.9461' rx='0.81081' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='32.1619' cy='15.9461' rx='0.81081' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='34.324' cy='15.9461' rx='0.810812' ry='0.810811' fill='#F9F9F9'/>
        <ellipse cx='36.4861' cy='15.9461' rx='0.81081' ry='0.810811' fill='#F9F9F9'/>
      </svg>

    </View>

  )
}

export default CreditFooterSvg
