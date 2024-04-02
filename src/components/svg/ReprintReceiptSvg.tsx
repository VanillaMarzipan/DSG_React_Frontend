import { View } from 'react-native'

interface ReprintReceiptSvgProps {
  disabled: boolean
}

function ReprintReceiptSvg ({ disabled }: ReprintReceiptSvgProps) {
  return (
    <View style={{ marginBottom: 6 }}>
      <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='28' cy='28' r='28' id='reprint-receipt-circle' fill={disabled ? '#C8C8C8' : '#F57A19'} />
        <path d='M38.6667 36H17.3333V32.8H38.6667V36ZM38.6667 29.6H17.3333V26.4H38.6667V29.6ZM38.6667 23.2H17.3333V20H38.6667V23.2ZM12 44L14.6667 41.6L17.3333 44L20 41.6L22.6667 44L25.3333 41.6L28 44L30.6667 41.6L33.3333 44L36 41.6L38.6667 44L41.3333 41.6L44 44V12L41.3333 14.4L38.6667 12L36 14.4L33.3333 12L30.6667 14.4L28 12L25.3333 14.4L22.6667 12L20 14.4L17.3333 12L14.6667 14.4L12 12V44Z' fill='white' />
      </svg>
    </View>
  )
}

export default ReprintReceiptSvg
