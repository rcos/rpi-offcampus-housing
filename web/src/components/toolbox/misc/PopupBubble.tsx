import React from 'react'

interface IPopupBubble {
  children: any
  message: string
  direction: "left" | "right"
  width: number
}

const PopupBubble = ({children, width, message, direction}: IPopupBubble) => {

  return(<div className="popup-bubble">
    {children}
    <div className={`message-area ${direction}`}
      style={{
        width: `${width}px`,
        left: direction === "right" ? `calc(100% + 20px)` : 'none',
        right: direction === "left" ? `calc(100% + 20px)` : 'none'
      }}
    >{message}
    </div>
  </div>)
}

export default PopupBubble