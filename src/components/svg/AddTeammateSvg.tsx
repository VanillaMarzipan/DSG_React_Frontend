import { View } from 'react-native'

type AddTeammateSvgProps = {
  showItemLevelSap: boolean
}

const AddTeammateSvg = ({
  showItemLevelSap
}: AddTeammateSvgProps) => (
  <View style={{ marginBottom: 13, marginTop: showItemLevelSap ? 8 : 0 }}>
    <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='28' cy='28' r='28' fill='#F6841F' />
      <path d='M33.9996 26.4444C37.436 26.4444 40.2218 23.6586 40.2218 20.2222C40.2218 16.7858 37.436 14 33.9996 14C30.5631 14 27.7773 16.7858 27.7773 20.2222C27.7773 23.6586 30.5631 26.4444 33.9996 26.4444Z' fill='#FFF' />
      <path d='M46.4445 42C46.4445 35.1555 40.8445 29.5555 34.0001 29.5555C27.1557 29.5555 21.5557 35.1555 21.5557 42H46.4445Z' fill='#FFF' />
      <rect x='14.75' y='18.6666' width='3.49999' height='14' rx='1' fill='#FFF' />
      <rect x='9.5' y='23.9166' width='14' height='3.49999' rx='1' fill='#FFF' />
    </svg>
  </View>
)

export default AddTeammateSvg
