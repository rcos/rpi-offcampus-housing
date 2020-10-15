import React from 'react'

/*
Centered
@desc Set elements within the center of the page
that is of size width and height

@docs documentation/toolbox/layout/Centered.md
*/


interface CenteredInterface {
  width: number | string
  height: number | string
  children: JSX.Element 
}

const isPercent = (x: string): boolean => {
  return x.length > 0 && x.charAt( x.length-1 ) === "%"
}

const Centered = ({width, height, children}: CenteredInterface ) => {

  return (<div className="layout-centered">
    <div className="horiz-center" style={{width: isPercent(width as string) ? width: `${width}px`}}>
      <div className="vertical-center" style={{height: isPercent(height as string) ? height : `${height}px`}}>
        <div className="center-container">
          {children}
        </div>
      </div>
    </div>
  </div>);
}

export default Centered