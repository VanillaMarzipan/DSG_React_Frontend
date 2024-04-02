import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { receivePrintReceiptData } from '../../actions/printReceiptActions'
import { receiveUiData } from '../../actions/uiActions'
import { useTypedSelector } from '../../reducers/reducer'
import FooterOverlayModal from '../reusable/FooterOverlayModal'
import PostVoidConfirmationView from './PostVoidConfirmationView'
import PostVoidInitialView from './PostVoidInitialView'

interface PostVoidPopupProps {
  postVoidLoading: boolean
  transactionByBarcodeLoading: boolean
  scanEvent
}

const PostVoidPopup = ({
  postVoidLoading,
  transactionByBarcodeLoading,
  scanEvent
}: PostVoidPopupProps): JSX.Element => {
  const dispatch = useDispatch()
  const { transactionFoundViaBarcode, transactionByBarcodeError, serializedTransaction } = useTypedSelector(state => state.printReceiptData)
  const [postVoidLastTransactionSelected, setPostVoidLastTransactionSelected] = useState(false)
  useEffect(() => {
    return () => {
      dispatch(receivePrintReceiptData({ transactionByBarcodeError: null, transactionFoundViaBarcode: null }))
    }
  }, [])
  return (
    <FooterOverlayModal
      modalName={'PostVoid'}
      modalHeading={'Post Void'}
      minModalHeight={638}
      mainContentWidth={535}
      anchorToFooter={true}
      centerChildren={true}
      dismissable={!postVoidLoading && !transactionByBarcodeLoading}
      onClickClose={() => {
        dispatch(receiveUiData({
          footerOverlayActive: 'None',
          enhancedPostVoidPanelSelected: false
        }))
      }}
    >
      {
        (transactionFoundViaBarcode || postVoidLastTransactionSelected)
          ? (
            <PostVoidConfirmationView
              transactionFoundViaBarcode={transactionFoundViaBarcode}
              setPostVoidLastTransactionSelected={setPostVoidLastTransactionSelected}
              postVoidLoading={postVoidLoading}
            />
          )
          : (
            <PostVoidInitialView
              setPostVoidLastTransactionSelected={setPostVoidLastTransactionSelected}
              transactionByBarcodeLoading={transactionByBarcodeLoading}
              scanEvent={scanEvent}
              transactionByBarcodeError={transactionByBarcodeError}
              serializedTransaction={serializedTransaction}
            />
          )
      }
    </FooterOverlayModal>
  )
}

export default PostVoidPopup
