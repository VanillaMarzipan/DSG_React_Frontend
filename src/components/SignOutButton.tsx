import { View } from 'react-native'
import IconAboveTextButton from './reusable/IconAboveTextButton'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../Main'
import LogoutSvg from './svg/LogoutSvg'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { clearAssociateData } from '../actions/associateActions'

interface SignOutButtonProps {
  disabled: boolean
  associateId: string
}

const SignOutButton = ({ disabled, associateId }: SignOutButtonProps) => {
  const dispatch = useDispatch<AppDispatch>()
  return (
    <View style={[{ width: '110', marginLeft: 20 }]}>
      <IconAboveTextButton
        testId={'logout'}
        icon={<LogoutSvg disabled={disabled} />}
        buttonText={'SIGN OUT'}
        disabled={disabled}
        onPress={() => {
          sendRumRunnerEvent('Sign out', {
            associate: associateId
          })
          dispatch(clearAssociateData(associateId))
        }}
        buttonTextStyle={[
          disabled && { color: '#C8C8C8' }
        ]}
      />
    </View>
  )
}

export default SignOutButton
