import { View } from 'react-native'

type AddAssociateDiscountSvgProps = {
  showItemLevelSap: boolean
  isFamilyNight: boolean
}

const AddAssociateDiscountSvg = ({
  showItemLevelSap,
  isFamilyNight
}: AddAssociateDiscountSvgProps) => {
  return (
    <View style={{ marginBottom: 13, marginTop: showItemLevelSap ? 8 : 0 }}>
      {isFamilyNight
        ? (
          <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='28' cy='28' r='28' fill='#F6841F' />
            <path d='M18 23C20.7614 23 23 20.7614 23 18C23 15.2386 20.7614 13 18 13C15.2386 13 13 15.2386 13 18C13 20.7614 15.2386 23 18 23Z' fill='white' />
            <path d='M28 35.5C28 30 23.5 25.5 18 25.5C12.5 25.5 8 30 8 35.5H28Z' fill='white' />
            <path d='M38 23C40.7614 23 43 20.7614 43 18C43 15.2386 40.7614 13 38 13C35.2386 13 33 15.2386 33 18C33 20.7614 35.2386 23 38 23Z' fill='white' />
            <path d='M48 35.5C48 30 43.5 25.5 38 25.5C32.5 25.5 28 30 28 35.5H48Z' fill='white' />
            <mask id='path-6-outside-1_21281_148383' maskUnits='userSpaceOnUse' x='16' y='18' width='24' height='27' fill='black'>
              <rect fill='white' x='16' y='18' width='24' height='27' />
              <path fillRule='evenodd' clipRule='evenodd' d='M33 25C33 27.7614 30.7614 30 28 30C25.2386 30 23 27.7614 23 25C23 22.2386 25.2386 20 28 20C30.7614 20 33 22.2386 33 25ZM28 32.5C33.5 32.5 38 37 38 42.5H18C18 37 22.5 32.5 28 32.5Z' />
            </mask>
            <path fillRule='evenodd' clipRule='evenodd' d='M33 25C33 27.7614 30.7614 30 28 30C25.2386 30 23 27.7614 23 25C23 22.2386 25.2386 20 28 20C30.7614 20 33 22.2386 33 25ZM28 32.5C33.5 32.5 38 37 38 42.5H18C18 37 22.5 32.5 28 32.5Z' fill='white' />
            <path d='M38 42.5V44.5H40V42.5H38ZM18 42.5H16V44.5H18V42.5ZM28 32C31.866 32 35 28.866 35 25H31C31 26.6569 29.6569 28 28 28V32ZM21 25C21 28.866 24.134 32 28 32V28C26.3431 28 25 26.6569 25 25H21ZM28 18C24.134 18 21 21.134 21 25H25C25 23.3431 26.3431 22 28 22V18ZM35 25C35 21.134 31.866 18 28 18V22C29.6569 22 31 23.3431 31 25H35ZM40 42.5C40 35.8954 34.6046 30.5 28 30.5V34.5C32.3954 34.5 36 38.1046 36 42.5H40ZM18 44.5H38V40.5H18V44.5ZM28 30.5C21.3954 30.5 16 35.8954 16 42.5H20C20 38.1046 23.6046 34.5 28 34.5V30.5Z' fill='#F6841F' mask='url(#path-6-outside-1_21281_148383)' />
          </svg>
        )
        : (
          <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='28' cy='28' r='28' fill='#F6841F' />
            <path d='M20.4444 26.4444C23.8808 26.4444 26.6666 23.6586 26.6666 20.2222C26.6666 16.7858 23.8808 14 20.4444 14C17.0079 14 14.2222 16.7858 14.2222 20.2222C14.2222 23.6586 17.0079 26.4444 20.4444 26.4444Z' fill='white' />
            <path d='M32.8888 42C32.8888 35.1556 27.2889 29.5556 20.4444 29.5556C13.6 29.5556 8 35.1556 8 42H32.8888Z' fill='white' />
            <path d='M45.18 20.42C44.62 19.86 43.78 19.86 43.22 20.42L34.8199 28.82C34.2599 29.31 34.1899 30.22 34.6799 30.78C35.1699 31.34 36.0799 31.41 36.6399 30.92C36.7099 30.85 36.7799 30.85 36.7799 30.78L45.18 22.38C45.74 21.82 45.74 20.98 45.18 20.42Z' fill='white' />
            <path d='M37.2 22.1C37.2 20.91 36.29 20 35.1 20C33.91 20 33 20.91 33 22.1C33 23.29 33.91 24.2 35.1 24.2C36.29 24.2 37.2 23.29 37.2 22.1Z' fill='white' />
            <path d='M44.9 27C43.71 27 42.8 27.91 42.8 29.1C42.8 30.29 43.71 31.2001 44.9 31.2001C46.09 31.2001 47 30.29 47 29.1C47 27.91 46.09 27 44.9 27Z' fill='white' />
          </svg>
        )}
    </View>
  )
}

export default AddAssociateDiscountSvg
