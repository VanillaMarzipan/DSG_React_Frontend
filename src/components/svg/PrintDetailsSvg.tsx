interface PrintDetailsSvgProps {
  width?: number
  height?: number
  color?: string
}

const PrintDetailsSvg = ({
  width = 24,
  height = 24,
  color = 'black'
}: PrintDetailsSvgProps) => {
  return (
    <svg width={width} height={height} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M5.85361 3H17.5609V7H5.85361V3ZM4.878 8H18.5365C20.1561 8 21.4634 9.34 21.4634 11V17H17.5609V21H5.85361V17H1.95117V11C1.95117 9.34 3.25849 8 4.878 8ZM7.80483 19H15.6097V14H7.80483V19ZM18.5365 12C18 12 17.5609 11.55 17.5609 11C17.5609 10.45 18 10 18.5365 10C19.0731 10 19.5121 10.45 19.5121 11C19.5121 11.55 19.0731 12 18.5365 12Z' fill={color}/>
    </svg>
  )
}

export default PrintDetailsSvg
