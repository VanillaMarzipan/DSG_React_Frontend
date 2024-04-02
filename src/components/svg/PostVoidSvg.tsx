import PropTypes from 'prop-types'

const PostVoidSvg = ({ disabled }) => {
  const svgFillColor = disabled ? '#C8C8C8' : '#F57A19'
  return (
    <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='28' cy='28' r='28' fill={svgFillColor}/>
      <path d='M42.4001 14.5V16.3C42.4001 16.7971 41.9971 17.2 41.5001 17.2H14.5001C14.003 17.2 13.6001 16.7971 13.6001 16.3V14.5C13.6001 14.0029 14.003 13.6 14.5001 13.6H22.6001V11.8C22.6001 10.8059 23.406 10 24.4001 10H31.6001C32.5942 10 33.4001 10.8059 33.4001 11.8V13.6H41.5001C41.9971 13.6 42.4001 14.0029 42.4001 14.5ZM16.9661 42.652C17.0987 44.5412 18.6723 46.0046 20.5661 46H35.4701C37.3639 46.0046 38.9375 44.5412 39.0701 42.652L40.6001 20.8H15.4001L16.9661 42.652Z' fill='white'/>
      <rect x='21.2427' y='29.0711' width='4' height='16' rx='1' transform='rotate(-45 21.2427 29.0711)' fill={svgFillColor}/>
      <rect x='21.2427' y='37.5564' width='16' height='4' rx='1' transform='rotate(-45 21.2427 37.5564)' fill={svgFillColor}/>
    </svg>
  )
}

PostVoidSvg.propTypes = {
  disabled: PropTypes.bool
}

export default PostVoidSvg
