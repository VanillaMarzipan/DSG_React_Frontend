interface MagnifyingGlassSvgProps {
  disabled: boolean
  shadow?: boolean
  width?: number
  height?: number
}

const MagnifyingGlassSvg = ({ disabled, width = 64, height = 64 }: MagnifyingGlassSvgProps) => {
  const fillColor = disabled ? '#C8C8C8' : '#F57A19'
  return (
    <svg width={width} height={height} viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g>
        <circle cx='32' cy='32' r='30' fill={fillColor}/>
      </g>
      <path d='M26.7054 38.7924C19.7848 38.7924 14.1548 33.162 14.1548 26.2414C14.1548 19.3208 19.7848 13.6908 26.7054 13.6908C33.626 13.6908 39.2564 19.3212 39.2564 26.2418C39.2564 33.1624 33.626 38.7924 26.7054 38.7924ZM26.7054 16.9418C21.5774 16.9418 17.4054 21.1138 17.4054 26.2418C17.4054 31.3698 21.5774 35.5417 26.7054 35.5417C31.8333 35.5417 36.0053 31.3698 36.0053 26.2418C36.0053 21.1138 31.8333 16.9418 26.7054 16.9418Z'
        fill='white'
      />
      <path d='M46.9212 49.6717L35.4703 38.2212C35.1727 37.9236 35.1727 37.4362 35.4703 37.1382L37.5801 35.0284C37.8777 34.7308 38.3651 34.7308 38.6631 35.0284L50.1136 46.4793C50.4112 46.7769 50.4112 47.2643 50.1136 47.5623L48.0038 49.6721C47.7062 49.9697 47.2188 49.9697 46.9212 49.6717Z'
        fill='white'
      />
      <defs>
        <filter id='filter0_d' x='0' y='0' width='64' height='64' filterUnits='userSpaceOnUse'
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

export default MagnifyingGlassSvg
