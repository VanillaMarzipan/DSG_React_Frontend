// Adapted from https://github.com/callstack/react-native-paper
import { Component } from 'react'
import { Animated, I18nManager, StyleSheet, Text, TextInput as NativeTextInput, TouchableOpacity, View } from 'react-native'
import { polyfill } from 'react-lifecycles-compat'
import color from 'color'
import PropTypes from 'prop-types'

const AnimatedText = Animated.createAnimatedComponent(Text)

const MINIMIZED_LABEL_Y_OFFSET = -6
const OUTLINE_MINIMIZED_LABEL_Y_OFFSET = -29
const MAXIMIZED_LABEL_FONT_SIZE = 16
const MINIMIZED_LABEL_FONT_SIZE = 12
const LABEL_WIGGLE_X_OFFSET = 4
const FOCUS_ANIMATION_DURATION = 150
const BLUR_ANIMATION_DURATION = 180
const FADE_ANIMATION_DURATION = 75
const LABEL_PADDING_HORIZONTAL = 12
const RANDOM_VALUE_TO_CENTER_LABEL = 4 // Don't know why 4, but it works

class TextInput extends Component {
  static defaultProps = {
    mode: 'flat',
    disabled: false,
    error: false,
    multiline: false,
    editable: true,
    clearable: false,
    onClear: null,
    iconButton: null,
    autoFocus: false,
    render: props => <NativeTextInput {...props} />
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    return {
      value:
                typeof nextProps.value !== 'undefined'
                  ? nextProps.value
                  : prevState.value
    }
  }

  state = {
    labeled: new Animated.Value(this.props.value || this.props.error ? 0 : 1),
    error: new Animated.Value(this.props.error ? 1 : 0),
    focused: false,
    placeholder: this.props.error ? this.props.placeholder : '',
    value: this.props.value,
    labelLayout: {
      measured: false,
      width: 0
    },
    clearOpacity: new Animated.Value((this.props.clearable && this.props.value) ? 1 : 0),
    clearVisible: (this.props.clearable && this.props.value)
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      prevState.focused !== this.state.focused ||
            prevState.value !== this.state.value ||
            prevProps.error !== this.props.error
    ) {
      // The label should be minimized if the text input is focused, or has text
      // In minimized mode, the label moves up and becomes small
      if (this.state.value || this.state.focused || this.props.error) {
        this._minmizeLabel()
      } else {
        this._restoreLabel()
      }
    }

    if (
      prevState.value !== this.state.value ||
            prevProps.clearable !== this.props.clearable
    ) {
      // Show clear button if there is text in the input
      if (this.props.clearable && this.state.value) {
        this._showClear()
      } else {
        this._hideClear()
      }
    }

    if (
      prevState.focused !== this.state.focused ||
            prevProps.label !== this.props.label ||
            prevProps.error !== this.props.error
    ) {
      // Show placeholder text only if the input is focused, or has error, or there's no label
      // We don't show placeholder if there's a label because the label acts as placeholder
      // When focused, the label moves up, so we can show a placeholder
      if (this.state.focused || this.props.error || !this.props.label) {
        this._showPlaceholder()
      } else {
        this._hidePlaceholder()
      }
    }

    if (prevProps.error !== this.props.error) {
      // When the input has an error, we wiggle the label and apply error styles
      if (this.props.error) {
        this._showError()
      } else {
        this._hideError()
      }
    }
  }

  componentWillUnmount () {
    clearTimeout(this._timer)
  }

  _showPlaceholder = () => {
    clearTimeout(this._timer)

    // Set the placeholder in a delay to offset the label animation
    // If we show it immediately, they'll overlap and look ugly
    this._timer = setTimeout(
      () =>
        this.setState({
          placeholder: this.props.placeholder
        }),
      50
    )
  }

  _hidePlaceholder = () =>
    this.setState({
      placeholder: ''
    })

  _timer
  _root

  _showError = () => {
    Animated.timing(this.state.error, {
      toValue: 1,
      duration: FOCUS_ANIMATION_DURATION,
      useNativeDriver: false
    }).start(this._showPlaceholder)
  }

  _hideError = () => {
    Animated.timing(this.state.error, {
      toValue: 0,
      duration: BLUR_ANIMATION_DURATION,
      useNativeDriver: false
    }).start()
  }

  _restoreLabel = () =>
    Animated.timing(this.state.labeled, {
      toValue: 1,
      duration: FOCUS_ANIMATION_DURATION,
      useNativeDriver: false
    }).start()

  _minmizeLabel = () =>
    Animated.timing(this.state.labeled, {
      toValue: 0,
      duration: BLUR_ANIMATION_DURATION,
      useNativeDriver: false
    }).start()

  _showClear = () =>
    this.setState({ clearVisible: true }, () => {
      Animated.timing(this.state.clearOpacity, {
        toValue: 1,
        duration: FADE_ANIMATION_DURATION,
        useNativeDriver: false
      }).start()
    })

  _hideClear = () =>
    Animated.timing(this.state.clearOpacity, {
      toValue: 0,
      duration: FADE_ANIMATION_DURATION,
      useNativeDriver: false
    }).start(() => {
      this.setState({ clearVisible: false })
    })

  _handleFocus = (...args) => {
    if (this.props.disabled) {
      return
    }

    this.setState({ focused: true })

    if (this.props.onFocus) {
      this.props.onFocus(...args)
    }
  }

  _handleBlur = (...args) => {
    if (this.props.disabled) {
      return
    }

    this.setState({ focused: false })

    if (this.props.onBlur) {
      this.props.onBlur(...args)
    }
  }

  _handleChangeText = value => {
    if (!this.props.editable) {
      return
    }

    this.setState({ value })
    this.props.onChangeText && this.props.onChangeText(value)
  }

  /**
     * @internal
     */
  setNativeProps (...args) {
    return this._root && this._root.setNativeProps(...args)
  }

  /**
     * Returns `true` if the input is currently focused, `false` otherwise.
     */
  isFocused () {
    return this._root && this._root.isFocused()
  }

  /**
     * Removes all text from the TextInput.
     */
  clear () {
    return this._root && this._root.clear()
  }

  /**
     * Focuses the input.
     */
  focus () {
    return this._root && this._root.focus()
  }

  /**
     * Removes focus from the input.
     */
  blur () {
    return this._root && this._root.blur()
  }

  render () {
    const {
      mode,
      disabled,
      label,
      error,
      style,
      render,
      multiline,
      labelBackgroundColor,
      paddingMode,
      borderColor,
      ...rest
    } = this.props

    const theme = {
      dark: false,
      roundness: 0
    }

    const black = '#000000'
    const white = '#ffffff'
    const colors = {
      primary: borderColor || '#006554',
      accent: '#03dac4',
      background: labelBackgroundColor,
      surface: white,
      error: '#B00020',
      text: black,
      disabled: color(this.props.color || black)
        .alpha(0.26)
        .rgb()
        .string(),
      placeholder: color(this.props.color || black)
        .alpha(0.54)
        .rgb()
        .string(),
      backdrop: color(this.props.color || black)
        .alpha(0.5)
        .rgb()
        .string()
    }

    const fontFamily = 'Archivo'
    const hasActiveOutline = this.state.focused || error
    const { backgroundColor = colors.background } =
        StyleSheet.flatten(style) || {}

    let inputTextColor,
      activeColor,
      outlineColor,
      placeholderColor,
      containerStyle

    if (disabled) {
      inputTextColor = activeColor = color(colors.text)
        .alpha(0.54)
        .rgb()
        .string()
      placeholderColor = outlineColor = colors.disabled
    } else {
      inputTextColor = colors.text
      activeColor = error ? colors.error : colors.primary
      placeholderColor = outlineColor = colors.placeholder
    }

    if (mode === 'flat') {
      containerStyle = {
        backgroundColor: theme.dark
          ? color(colors.background)
            .lighten(0.24)
            .rgb()
            .string()
          : color(colors.background)
            .darken(0.06)
            .rgb()
            .string(),
        borderTopLeftRadius: theme.roundness,
        borderTopRightRadius: theme.roundness
      }
    }

    const labelHalfWidth = this.state.labelLayout.width / 2
    const baseLabelTranslateX =
            (I18nManager.isRTL ? 1 : -1) *
            (1 - MINIMIZED_LABEL_FONT_SIZE / MAXIMIZED_LABEL_FONT_SIZE) *
            labelHalfWidth

    const labelStyle = {
      fontFamily,
      fontSize: MAXIMIZED_LABEL_FONT_SIZE,
      transform: [
        {
          // Wiggle the label when there's an error
          translateX: this.state.error.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [
              0,
              this.state.value && error ? LABEL_WIGGLE_X_OFFSET : 0,
              0
            ]
          })
        },
        {
          // Move label to top
          translateY: this.state.labeled.interpolate({
            inputRange: [0, 1],
            outputRange: [
              mode === 'outlined'
                ? OUTLINE_MINIMIZED_LABEL_Y_OFFSET
                : MINIMIZED_LABEL_Y_OFFSET,
              0
            ]
          })
        },
        {
          // Make label smaller
          scale: this.state.labeled.interpolate({
            inputRange: [0, 1],
            outputRange: [
              MINIMIZED_LABEL_FONT_SIZE / MAXIMIZED_LABEL_FONT_SIZE,
              1
            ]
          })
        },
        {
          // Offset label scale since RN doesn't support transform origin
          translateX: this.state.labeled.interpolate({
            inputRange: [0, 1],
            outputRange: [
              baseLabelTranslateX > 0
                ? baseLabelTranslateX +
                                labelHalfWidth / LABEL_PADDING_HORIZONTAL -
                                RANDOM_VALUE_TO_CENTER_LABEL
                : baseLabelTranslateX -
                                labelHalfWidth / LABEL_PADDING_HORIZONTAL +
                                RANDOM_VALUE_TO_CENTER_LABEL,
              0
            ]
          })
        }
      ]
    }

    return (
      <View style={[containerStyle, style]}>
        {mode === 'outlined'
          ? (
          // Render the outline separately from the container
          // This is so that the label can overlap the outline
          // Otherwise the border will cut off the label on Android
            <View
              pointerEvents='none'
              testID={`${this.props.testID}-border`}
              style={[
                styles.outline,
                {
                  borderRadius: theme.roundness,
                  borderWidth: hasActiveOutline ? 2 : 1,
                  borderColor: hasActiveOutline ? activeColor : outlineColor
                }
              ]}
            />
          )
          : null}

        {mode === 'outlined' && label
          ? (
          // When mode == 'outlined', the input label stays on top of the outline
          // The background of the label covers the outline so it looks cut off
          // To achieve the effect, we position the actual label with a background on top of it
          // We set the color of the text to transparent so only the background is visible
            <AnimatedText
              pointerEvents='none'
              style={[
                styles.outlinedLabelBackground,
                {
                  backgroundColor,
                  fontFamily,
                  fontSize: MINIMIZED_LABEL_FONT_SIZE,
                  // Hide the background when scale will be 0
                  // There's a bug in RN which makes scale: 0 act weird
                  opacity: this.state.labeled.interpolate({
                    inputRange: [0, 0.9, 1],
                    outputRange: [1, 1, 0]
                  }),
                  transform: [
                    {
                    // Animate the scale when label is moved up
                      scaleX: this.state.labeled.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0]
                      })
                    }
                  ]
                }
              ]}
              numberOfLines={1}
            >
              {label}
            </AnimatedText>
          )
          : null}

        {label
          ? (
          // Position colored placeholder and gray placeholder on top of each other and crossfade them
          // This gives the effect of animating the color, but allows us to use native driver
            <View
              pointerEvents='none'
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity:
                  // Hide the label in minimized state until we measure it's width
                                    this.state.value || this.state.focused
                                      ? this.state.labelLayout.measured
                                        ? 1
                                        : 0
                                      : 1
                }
              ]}
            >
              <AnimatedText
                onLayout={e =>
                  this.setState({
                    labelLayout: {
                      width: e.nativeEvent.layout.width,
                      measured: true
                    }
                  })
                }
                style={[
                  styles.placeholder,
                  mode === 'outlined'
                    ? styles.placeholderOutlined
                    : styles.placeholderFlat,
                  labelStyle,
                  {
                    color: activeColor,
                    opacity: this.state.labeled.interpolate({
                      inputRange: [0, 1],
                      outputRange: [hasActiveOutline ? 1 : 0, 0]
                    })
                  }
                ]}
                numberOfLines={1}
              >
                {label}
              </AnimatedText>
              <AnimatedText
                style={[
                  styles.placeholder,
                  mode === 'outlined'
                    ? paddingMode === 'less'
                      ? styles.placeHolderShort
                      : styles.placeholderOutlined
                    : styles.placeholderFlat,
                  labelStyle,
                  {
                    color: placeholderColor,
                    opacity: hasActiveOutline ? this.state.labeled : 1
                  }
                ]}
                numberOfLines={1}
              >
                {label}
              </AnimatedText>
            </View>
          )
          : null}

        <View style={{
          flexDirection: 'row'
        }}>
          {render({
            ...rest,
            ref: c => {
              this._root = c
            },
            onChangeText: this._handleChangeText,
            placeholder: label ? this.state.placeholder : this.props.placeholder,
            placeholderTextColor: placeholderColor,
            editable: !disabled,
            selectionColor: activeColor,
            onFocus: this._handleFocus,
            onBlur: this._handleBlur,
            underlineColorAndroid: 'transparent',
            clearable: this.props.clearable,
            multiline,
            style: [
              styles.input,
              mode === 'outlined'
                ? styles.inputOutlined
                : this.props.label
                  ? styles.inputFlatWithLabel
                  : styles.inputFlatWithoutLabel,
              paddingMode === 'none' && styles.smallInput,
              paddingMode === 'less' && styles.smallInput,
              paddingMode === 'less' && styles.placeHolderShort,
              {
                color: inputTextColor,
                fontFamily,
                textAlignVertical: multiline ? 'top' : 'center'
              }
            ]
          })}
          {
            (this.state.clearVisible || this.props.iconButton) &&
            <View style={[styles.rightButtonsView, disabled && { opacity: 0.54 }]} pointerEvents={disabled ? 'none' : 'auto'}>
              <>
                {
                  this.state.clearVisible &&
                    <Animated.View
                      style={{
                        opacity: this.state.clearOpacity
                      }}
                    >
                      <TouchableOpacity
                        testID={`${this.props.testID}-clear`}
                        onPress={() => {
                          this.clear()
                          this.props.onClear && this.props.onClear()
                          this._handleChangeText()
                          this.focus()
                        }}
                        style={{
                          height: '100%',
                          justifyContent: 'center',
                          paddingHorizontal: 8
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>clear</Text>
                      </TouchableOpacity>
                    </Animated.View>
                }
              </>
              {this.props.iconButton}
            </View>
          }
        </View>
      </View>
    )
  }
}

TextInput.propTypes = {
  autoFocus: PropTypes.bool,
  mode: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  error: PropTypes.bool,
  underlineColor: PropTypes.string,
  style: PropTypes.any,
  render: PropTypes.any,
  multiline: PropTypes.bool,
  labelBackgroundColor: PropTypes.string,
  placeholder: PropTypes.string,
  onChangeText: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  editable: PropTypes.bool,
  value: PropTypes.string,
  color: PropTypes.string,
  paddingMode: PropTypes.string,
  borderColor: PropTypes.string,
  testID: PropTypes.string,
  clearable: PropTypes.bool,
  onClear: PropTypes.func,
  iconButton: PropTypes.element
}

polyfill(TextInput)

export default TextInput

const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    left: 0,
    fontSize: 16,
    paddingHorizontal: LABEL_PADDING_HORIZONTAL
  },
  placeholderFlat: {
    top: 19
  },
  placeholderOutlined: {
    top: 25
  },
  placeHolderShort: {
    top: 19
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2
  },
  outline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    bottom: 0
  },
  outlinedLabelBackground: {
    position: 'absolute',
    top: 0,
    left: 8,
    paddingHorizontal: 4,
    color: 'transparent'
  },
  input: {
    flexGrow: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    margin: 0,
    minHeight: 58,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    zIndex: 1,
    minWidth: 0
  },
  inputOutlined: {
    paddingTop: 20,
    paddingBottom: 16,
    minHeight: 64
  },
  smallInput: {
    paddingTop: 4,
    paddingBottom: 0,
    paddingHorizontal: 8,
    minHeight: 50
  },
  inputFlatWithLabel: {
    paddingTop: 24,
    paddingBottom: 6
  },
  inputFlatWithoutLabel: {
    paddingVertical: 15
  },
  rightButtonsView: {
    flexDirection: 'row',
    marginRight: 16,
    zIndex: 2,
    marginLeft: -8
  }
})
