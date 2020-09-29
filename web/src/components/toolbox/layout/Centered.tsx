import React from 'react'

/*
Centered
@desc Set elements within the center of the page
that is of size width and height

@docs documentation/toolbox/layout/Centered.md
*/


interface CenteredInterface {
  width: number
  height: number
  children: JSX.Element 
}

const Centered = ({width, height, children}: CenteredInterface ) => {

  return (<div className="layout-centered">
    <div className="horiz-center" style={{width: `${width}px`}}>
      <div className="vertical-center" style={{height: `${height}px`}}>
        <div className="center-container">
          {children}
        </div>
      </div>
    </div>
  </div>);
}

export default Centered