interface NikeSwooshLogoProps {
  height?: number
  width?: number
}

const NikeSwooshLogo = ({ height = 13, width = 34 }: NikeSwooshLogoProps) => {
  return (
    <svg width={width} height={height} viewBox='0 0 35 13' fill='none' shapeRendering={'crispEdges'} xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'>
      <rect y='0.5' width='33.4286' height='12' fill='url(#pattern0)' />
      <defs>
        <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'>
          <use xlinkHref='#image0_26398_3115' transform='scale(0.000657462 0.0018315)' />
        </pattern>
        <image id='image0_26398_3115' width='1521' height='546' xlinkHref='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABfEAAAIiCAMAAABfd3LRAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAwBQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Bz0LCAAAAQB0Uk5TAAwZaQm5DbBho9ad/z+Mums4Tv2mO/YbITDxfCt5lVok6uEIOXOt5Z8a31Ue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' />
      </defs>
    </svg>
  )
}

export default NikeSwooshLogo
