import PropTypes from 'prop-types'

const TaxExemptLabelSvg = ({ disabled }) => {
  const svgFillColor = disabled ? '#C8C8C8' : '#F57A19'
  return (
    <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='28' cy='28' r='28' fill={svgFillColor}/>
      <path fillRule='evenodd' clipRule='evenodd' d='M25.5452 19.0519L22.8879 14.778C22.4737 14.1119 22.9527 13.25 23.7371 13.25H32.2629C33.0473 13.25 33.5263 14.1119 33.1121 14.778L30.4548 19.0519C31.3402 19.2578 32 20.0519 32 21C32 21.5356 31.7895 22.022 31.4466 22.381C34.6682 23.4147 37 26.4351 37 30V38C37 41.3137 34.3137 44 31 44H25C21.6863 44 19 41.3137 19 38V30C19 26.4351 21.3318 23.4147 24.5534 22.381C24.2105 22.022 24 21.5356 24 21C24 20.0519 24.6598 19.2578 25.5452 19.0519Z' fill='white'/>
      <path d='M31.7 29.3C31.3 28.9 30.7 28.9 30.3 29.3L24.2999 35.3C23.8999 35.65 23.8499 36.3 24.1999 36.7C24.55 37.1 25.2 37.15 25.6 36.8C25.65 36.75 25.7 36.75 25.7 36.7L31.7 30.7C32.1 30.3 32.1 29.7 31.7 29.3Z' fill={svgFillColor}/>
      <path d='M26 30.5C26 29.65 25.35 29 24.5 29C23.65 29 23 29.65 23 30.5C23 31.35 23.65 32 24.5 32C25.35 32 26 31.35 26 30.5Z' fill={svgFillColor}/>
      <path d='M31.5 34C30.65 34 30 34.65 30 35.5C30 36.35 30.65 37.0001 31.5 37.0001C32.35 37.0001 33 36.35 33 35.5C33 34.65 32.35 34 31.5 34Z' fill={svgFillColor}/>
    </svg>
  )
}

TaxExemptLabelSvg.propTypes = {
  disabled: PropTypes.bool
}

export default TaxExemptLabelSvg
