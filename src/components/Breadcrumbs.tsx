import { StyleSheet, Text, View } from 'react-native'
import { CssStyleType } from './BackButton'
import CheckMarkSvg from './svg/CheckMarkSvg'

interface BreadcrumbsProps {
  currentProcessStep: number
  breadcrumbCount: number
  error?: boolean
  customContainerStyles?: CssStyleType
  customCurrentStepStyle?: CssStyleType
  customLineWidth?: number
}

const Breadcrumbs = ({
  currentProcessStep,
  breadcrumbCount,
  error,
  customContainerStyles,
  customCurrentStepStyle,
  customLineWidth
}: BreadcrumbsProps) => {
  const breadcrumb = (stepNumber, key) => {
    const errorOnPreviousStep = stepNumber === currentProcessStep - 1 && error
    return (
      <View key={key} testID={key}
        style={[styles.breadcrumb, customCurrentStepStyle, currentProcessStep >= stepNumber && { backgroundColor: '#008D75' }, errorOnPreviousStep && { backgroundColor: '#B80818' }]}>
        {(stepNumber < currentProcessStep && !errorOnPreviousStep)
          ? <CheckMarkSvg size='tiny'/>
          : (<Text style={[styles.breadcrumbNumber]}>
            {stepNumber}
          </Text>)
        }
      </View>
    )
  }
  const subsequentBreadcrumb = (stepNumber, key) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[styles.breadcrumbLines, customLineWidth && { width: customLineWidth }, currentProcessStep >= stepNumber && { backgroundColor: '#008D75' }]}/>
      {breadcrumb(stepNumber, key)}
    </View>
  )
  const breadcrumbsToRender = [breadcrumb(1, 'breadcrumb-1')]
  for (let index = 0; index < breadcrumbCount - 1; index++) {
    breadcrumbsToRender.push(subsequentBreadcrumb(index + 2, `breadcrumb-${index + 2}`))
  }
  return (
    <View style={[styles.container, customContainerStyles]}>
      {breadcrumbsToRender}
    </View>
  )
}

const styles = StyleSheet.create({
  breadcrumb: {
    width: 24,
    height: 24,
    borderRadius: 14,
    backgroundColor: '#c4c4c4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  breadcrumbLines: {
    width: 20,
    height: 4,
    backgroundColor: '#c4c4c4'
  },
  breadcrumbNumber: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 72,
    marginBottom: 22,
    width: '100%'
  }
})

export default Breadcrumbs
