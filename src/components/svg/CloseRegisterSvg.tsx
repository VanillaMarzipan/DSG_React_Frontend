interface CloseRegisterSvgProps {
  disabled: boolean
}

const CloseRegisterSvg = ({ disabled }: CloseRegisterSvgProps) => {
  const fillColor = disabled ? '#C8C8C8' : '#F57A19'
  return (
    <svg width='68' height='68' viewBox='0 0 68 68' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g filter='url(#filter0_d)'>
        <circle cx='34' cy='30' r='30' fill={fillColor}/>
      </g>
      <path fillRule='evenodd' clipRule='evenodd'
        d='M46 18H22V21H46V18ZM47.5 33V30L46 22.5H22L20.5 30V33H22V42H37V33H43V42H46V33H47.5ZM25 39H34V33H25V39Z'
        fill='white'/>
      <defs>
        <filter id='filter0_d' x='0' y='0' width='68' height='68' filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'>
          <feFlood floodOpacity='0' result='BackgroundImageFix'/>
          <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'/>
          <feOffset dy='4'/>
          <feGaussianBlur stdDeviation='2'/>
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0'/>
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow'/>
          <feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow' result='shape'/>
        </filter>
      </defs>
    </svg>

  )
}

export default CloseRegisterSvg
