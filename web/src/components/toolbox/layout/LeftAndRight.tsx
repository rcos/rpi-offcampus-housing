import React from 'react'

interface LeftAndRightInterface {
  left: any
  right: any
}

const LeftAndRight = ({left, right}: LeftAndRightInterface) => {

  return(<div className="left-and-right">
      <div className="left-side">{left}</div>
      <div className="spacer"></div>
      <div className="right-side">{right}</div>
    </div>)
}

export default LeftAndRight