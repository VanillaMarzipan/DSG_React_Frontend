import { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import Text from './StyledText'
import { Menu, MenuOption, MenuOptions, MenuTrigger, withMenuContext } from 'react-native-popup-menu'
import ChevronSvg from './svg/ChevronSvg'
import { sendRumRunnerEvent } from '../utils/rumrunner'
import { featureFlagEnabled } from '../reducers/featureFlagData'
import { receiveUiData } from '../actions/uiActions'
import { connect } from 'react-redux'
import { checkIfManualItemDiscountHasBeenApplied } from '../utils/transactionHelpers'

class PopupMenu extends Component {
  state = {
    edit: false
  }

  _isMounted = false

  componentDidMount () {
    this._isMounted = true
    sendRumRunnerEvent('Item event', {
      type: 'menu opened',
      upc: this.props.upc
    })
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  showEdit = () => {
    if (this._isMounted) {
      this.setState({ edit: true })
    }
  }

  hideEdit = () => {
    if (this._isMounted) {
      this.setState({ edit: false })
    }
  }

  /**
     * Close popup menu and enter price edit mode
     */
  onPriceEdit = () => {
    this.props.ctx.menuActions.closeMenu()
    this.props.enterPriceEditMode(true)
  }

  render () {
    const { edit } = this.state
    const {
      complete,
      deleteItem,
      itemTransactionId,
      index,
      selectItem,
      nextSelectionId,
      upc,
      removeEditPrice,
      disableDeleteItem,
      itemAttributes,
      appliedDiscounts,
      isGiftCardItem
    } = this.props

    const disableDiscountItem = itemAttributes?.includes(9) || isGiftCardItem
    const disableEditPrice = checkIfManualItemDiscountHasBeenApplied(appliedDiscounts)
    return (
      <Menu
        onOpen={this.showEdit}
        onClose={this.hideEdit}
      >
        <MenuTrigger>
          <View
            testID={`item-edit${index}`}
            style={styles.iconContainer}
            aria-haspopup='true'
          >
            {!complete && (
              <>
                <View
                  aria-label='Edit'
                  style={[
                    styles.chevron,
                    { transform: [{ rotate: edit ? '90deg' : '0deg' }] }
                  ]}
                >
                  <ChevronSvg/>
                </View>
                {!edit && <Text style={styles.iconText}>Edit</Text>}
              </>
            )}
          </View>
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          <View testID='edit-item-menu'/>
          {!removeEditPrice &&
            <MenuOption
              style={[styles.editOption, disableEditPrice && { marginVertical: 0, paddingVertical: 16, backgroundColor: '#EAEAEA' }]}
              value='editPrice'
              disabled={disableEditPrice}
              onSelect={() => {
                console.info('ACTION: components > PopupMenu > onSelect editPrice')
                sendRumRunnerEvent('Item event', {
                  type: 'edit',
                  upc: upc
                })
                this.onPriceEdit()
              }}
            >
              <Text testID='edit-item'>
                {
                  disableEditPrice ? 'Not Eligible for Edit Price' : 'Edit Price'
                }
              </Text>
            </MenuOption>
          }
          {
            featureFlagEnabled('ManualItemDiscount') &&
              <MenuOption
                style={[styles.deleteOption, disableDiscountItem && { marginBottom: 0, paddingBottom: 16, backgroundColor: '#EAEAEA' }]}
                value='discountItem'
                disabled={disableDiscountItem}
                onSelect={() => {
                  console.info('Action: components > PopupMenu > onSelect discountItem')
                  this.props.receiveUiData({
                    showModal: 'manualItemDiscount',
                    selectedItem: itemTransactionId
                  })
                }}
              >
                <Text testID='discount-item'>
                  {
                    disableDiscountItem ? 'Not Eligible For Discount' : 'Discount Item'
                  }
                </Text>
              </MenuOption>
          }
          <MenuOption
            style={styles.deleteOption}
            disabled={disableDeleteItem}
            value='deleteItem'
            onSelect={() => {
              console.info('ACTION: components > PopupMenu > onSelect deleteItem')
              deleteItem(itemTransactionId)
              nextSelectionId !== null && selectItem(nextSelectionId)
              sendRumRunnerEvent('Item event', {
                type: 'delete',
                upc: upc
              })
              this.props.ctx.menuActions.closeMenu()
            }}
          >
            <Text testID='delete-item' style={{ color: disableDeleteItem ? '#c8c8c8' : '#da1600' }}>
              Delete Item
            </Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    )
  }
}

const optionsStyles = {
  optionsContainer: {
    marginLeft: 36,
    marginTop: 30
  }
}

const styles = StyleSheet.create({
  chevron: {
    width: 40,
    height: 40,
    marginBottom: -8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editOption: {
    marginBottom: 16,
    marginTop: 14
  },
  deleteOption: {
    marginBottom: 16,
    paddingTop: 18,
    borderTopColor: '#f0f0f0',
    borderTopWidth: 2
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 8,
    minHeight: 59
  },
  border: {
    borderLeftWidth: 4,
    borderColor: '#006554'
  },
  iconContainer: {
    display: 'flex',
    paddingLeft: 16,
    minWidth: 56
  },
  iconText: {
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: 8,
    marginTop: 8
  },
  itemInnerContainer: {
    display: 'flex',
    flex: 1,
    paddingHorizontal: 16
  },
  itemLine: {
    display: 'flex',
    flexDirection: 'row'
  },
  itemName: {
    fontSize: 18
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right'
  },
  itemNum: {
    fontSize: 14
  },
  itemQty: {
    fontSize: 14,
    marginLeft: 32
  },
  itemDiscount: {
    fontSize: 14
  }
})

PopupMenu.propTypes = {
  complete: PropTypes.bool,
  deleteItem: PropTypes.func,
  selectItem: PropTypes.func,
  nextSelectionId: PropTypes.any,
  itemTransactionId: PropTypes.number,
  index: PropTypes.number,
  enterPriceEditMode: PropTypes.func,
  ctx: PropTypes.object,
  upc: PropTypes.string,
  removeEditPrice: PropTypes.bool, // If true, option is not rendered
  disableDeleteItem: PropTypes.bool, // If true, option is greyed out
  receiveUiData: PropTypes.func,
  itemAttributes: PropTypes.array,
  appliedDiscounts: PropTypes.array,
  isGiftCardItem: PropTypes.bool
}

const mapStateToProps = state => ({
  uiData: state.uiData
})

const mapDispatchToProps = {
  receiveUiData
}

export default connect(mapStateToProps, mapDispatchToProps)(withMenuContext(PopupMenu))
