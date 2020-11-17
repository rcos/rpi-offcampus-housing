import React, {useEffect, useState} from 'react'

/*
Centered
@desc Set elements within the center of the page
that is of size width and height

@docs documentation/toolbox/layout/Centered.md
*/


interface ICentered {
  width?: number | string
  height?: number | string
  children: JSX.Element 
  verticalBuffer?: number
  horizontalBuffer?: number
}

const isPercent = (x: string): boolean => {
  return x.length > 0 && x.charAt( x.length-1 ) === "%"
}

const Centered = ({width, height, children, verticalBuffer, horizontalBuffer}: ICentered ) => {

  const [windowWidth, setWindowWidth] = useState<number | string>(0)
  const [windowHeight, setWindowHeight] = useState<number | string>(0)

  useEffect(() => {
    let verticalResizeFn: Function = (e: any) => {}
    let horizontalResizeFn: Function = (e: any) => {}

    if (horizontalBuffer) {
      horizontalResizeFn = (e: any) => {
        let w = e.target.innerWidth
        setWindowWidth(Math.max(w - horizontalBuffer, 0))
      }
      setWindowWidth(Math.max(window.innerWidth - horizontalBuffer, 0))
    }

    if (verticalBuffer) {
      verticalResizeFn = (e: any) => {
        let h = e.target.innerHeight
        setWindowHeight(Math.max(h - verticalBuffer, 0))
      }
      setWindowHeight(Math.max(window.innerHeight - verticalBuffer, 0))
    }

    const resizeFn = (e: any) => {
      verticalResizeFn(e)
      horizontalResizeFn(e)
    }
    window.addEventListener('resize', resizeFn)

    // unmount
    return () => {
      window.removeEventListener('resize', resizeFn)
    }
  }, [horizontalBuffer, verticalBuffer])

  useEffect(() => {

    let verticalResizeFn: Function = (e: any) => {}
    let horizontalResizeFn: Function = (e: any) => {}

    // configure width
    if (height) setWindowHeight(height)
    else if (verticalBuffer) {
      
      verticalResizeFn = (e: any) => {
        let h = e.target.innerHeight
        setWindowHeight(Math.max(h - verticalBuffer, 0))
      }
      setWindowHeight(Math.max(window.innerHeight - verticalBuffer, 0))
    }

    // configure height
    if (width) {
      setWindowWidth(width)
    }
    else if (horizontalBuffer) {

      horizontalResizeFn = (e: any) => {
        let w = e.target.innerWidth
        setWindowWidth(Math.max(w - horizontalBuffer, 0))
      }
      setWindowWidth(Math.max(window.innerWidth - horizontalBuffer, 0))
    }

    // set the resize function
    const resizeFn = (e: any) => {
      verticalResizeFn(e)
      horizontalResizeFn(e)
    }
    window.addEventListener('resize', resizeFn)

    // unmount
    return () => {
      window.removeEventListener('resize', resizeFn)
    }
  }, [width, height])

  return (<div className="layout-centered">
    <div className="horiz-center" style={{width: isPercent(windowWidth as string) ? windowWidth: `${windowWidth}px`}}>
      <div className="vertical-center" style={{height: isPercent(windowHeight as string) ? windowHeight : `${windowHeight}px`}}>
        <div className="center-container">
          {children}
        </div>
      </div>
    </div>
  </div>);
}

export default Centered