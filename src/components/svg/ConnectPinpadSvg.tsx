import PropTypes from 'prop-types'

const ConnectPinpadSvg = ({ disabled }) => {
  const svgFillColor = disabled ? '#C8C8C8' : '#F57A19'
  return (
    <svg width='68' height='68' viewBox='0 0 68 68' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g filter='url(#filter0_d_10521_53670)'>
        <circle cx='34' cy='30' r='30' fill={svgFillColor}/>
      </g>
      <path fillRule='evenodd' clipRule='evenodd' d='M46 15H22C20.35 15 19 16.35 19 18V42C19 43.65 20.35 45 22 45H46C47.65 45 49 43.65 49 42V18C49 16.35 47.65 15 46 15ZM46 18V42H22V18H46ZM35.5 21H43V39H25V21H31V24H28V36H40V24H35.5V27.42C36.4 27.93 37 28.89 37 30C37 31.65 35.65 33 34 33C32.35 33 31 31.65 31 30C31 28.89 31.6 27.945 32.5 27.42V24C32.5 22.35 33.85 21 35.5 21Z' fill='white'/>
      <defs>
        <filter id='filter0_d_10521_53670' x='0' y='0' width='68' height='68' filterUnits='userSpaceOnUse' colorInterpolationFilters='sRGB'>
          <feFlood floodOpacity='0' result='BackgroundImageFix'/>
          <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/>
          <feOffset dy='4'/>
          <feGaussianBlur stdDeviation='2'/>
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0'/>
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_10521_53670'/>
          <feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_10521_53670' result='shape'/>
        </filter>
      </defs>
    </svg>
  )
}

ConnectPinpadSvg.propTypes = {
  disabled: PropTypes.bool
}

export default ConnectPinpadSvg
