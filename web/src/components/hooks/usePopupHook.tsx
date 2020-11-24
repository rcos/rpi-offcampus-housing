import React, {useEffect} from 'react'
import ReactDOM from 'react-dom';

interface IPopupConfig {
  popup: any
  show: boolean
}

export const usePopup = ({ popup, show }: IPopupConfig) => {

  const popupWrapper = (_popup_: any) => {

    return (<div className="popup-wrapper" style={{
      border: `1px solid red`
    }}>
      <div className="holder">{_popup_}</div>
    </div>)
  }

  useEffect(() => {
    if (show) ReactDOM.render(popupWrapper(popup), document.getElementById('popup-container'))
    else ReactDOM.render(<div></div>, document.getElementById('popup-container'))
  }, [popup, show])
}