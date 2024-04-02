interface BarcodeSvgInterface {
    height?: number
    width?: number
}

const BarcodeSvg = ({
  height = 87,
  width = 127
}: BarcodeSvgInterface) => (
  <svg width={width} height={height} viewBox='0 0 127 87' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect x='13.4241' y='13.9821' width='7.7244' height='59.0357' fill='#333333' />
    <rect x='42.3906' y='13.9821' width='7.7244' height='59.0357' fill='#333333' />
    <rect x='26.9418' y='13.9821' width='3.8622' height='59.0357' fill='#333333' />
    <rect x='69.4261' y='13.9821' width='3.8622' height='59.0357' fill='#333333' />
    <rect x='84.8748' y='13.9821' width='3.86221' height='59.0357' fill='#333333' />
    <rect x='36.5974' y='13.9821' width='1.9311' height='59.0357' fill='#333333' />
    <rect x='63.6327' y='13.9821' width='1.9311' height='59.0357' fill='#333333' />
    <rect x='55.9083' y='13.9821' width='1.9311' height='59.0357' fill='#333333' />
    <rect x='98.3925' y='13.9821' width='7.7244' height='59.0357' fill='#333333' />
    <rect x='92.5992' y='13.9821' width='1.9311' height='59.0357' fill='#333333' />
    <rect x='79.0814' y='13.9821' width='1.9311' height='59.0357' fill='#333333' />
    <rect x='111.91' y='13.9821' width='1.93111' height='59.0357' fill='#333333' />
    <rect width='1.32292' height='86.4764' fill='#333333' />
    <path fillRule='evenodd' clipRule='evenodd' d='M0 0H12.7V1.55357H0V0Z' fill='#333333' />
    <rect y='85.4464' width='12.7' height='1.55357' fill='#333333' />
    <rect width='1.32292' height='86.4764' transform='matrix(-1 0 0 1 127 0)' fill='#333333' />
    <path fillRule='evenodd' clipRule='evenodd' d='M127 0H114.3V1.55357H127V0Z' fill='#333333' />
    <rect width='12.7' height='1.55357' transform='matrix(-1 0 0 1 127 85.4464)' fill='#333333' />
  </svg>

)

export default BarcodeSvg
