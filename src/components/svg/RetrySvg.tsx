interface RetrySvgProps {
  color?: string
}

const RetrySvg = ({ color = '#191F1C', ...props }: RetrySvgProps) => {
  return (
    <svg width='18' height='20' viewBox='0 0 18 20' fill='none' {...props}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M14 5H4V9H2V3H14V0L18 4L14 8V5ZM4 15H14V11H16V17H4V20L0 16L4 12V15Z'
        fill={color}
      />
    </svg>
  )
}

export default RetrySvg
