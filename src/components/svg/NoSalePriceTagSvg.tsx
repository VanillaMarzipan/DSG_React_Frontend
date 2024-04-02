import PropTypes from 'prop-types'

const NoSalePriceTagSvg = ({ disabled }) => {
  const svgFillColor = disabled ? '#C8C8C8' : '#F57A19'
  return (
    <svg width='68' height='70' viewBox='0 0 68 70' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g filter='url(#filter0_d_10521_53670)'>
        <circle cx='34' cy='32' r='30' fill={svgFillColor}/>
      </g>
      <rect x='33.5911' y='16.6451' width='23.1777' height='25.5864' transform='rotate(46.2343 33.5911 16.6451)' fill='white' />
      <path d='M45.595 16.0661C48.5159 16.0149 50.8584 18.4681 50.6725 21.3836L50.0387 31.3195C49.7614 35.6679 44.4418 37.6055 41.4327 34.4542L32.1119 24.6928C29.1027 21.5414 31.2838 16.3169 35.6404 16.2406L45.595 16.0661Z' fill='white' />
      <circle cx='44.5' cy='22.5' r='2.5' fill={svgFillColor} />
      <defs>
        <filter id='filter0_d_10521_53670' x='0' y='2' width='68' height='68' filterUnits='userSpaceOnUse' colorInterpolationFilters='sRGB'>
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
          <feOffset dy='4' />
          <feGaussianBlur stdDeviation='2' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_10521_53670' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_10521_53670' result='shape' />
        </filter>
      </defs>
    </svg>
  )
}

NoSalePriceTagSvg.propTypes = {
  disabled: PropTypes.bool
}

export default NoSalePriceTagSvg
