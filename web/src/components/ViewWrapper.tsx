import React, {useState, useEffect} from 'react'
import Centered from './toolbox/layout/Centered'

const ViewWrapper = ({children}: {children: any}) => {

  const [viewWidth, setViewWidth] = useState<number>(1400)

  useEffect(() => {
    window.addEventListener('resize', updateViewWidth)
  }, [])

  const updateViewWidth = (e: any) => {
    let new_width = e.target.innerWidth
    if (new_width >= 1400) setViewWidth(1400)
    else if (new_width > 1200 && new_width < 1400) setViewWidth(1200)
    else if (new_width < 1200) setViewWidth(new_width)
  }

  return (<Centered height="100%" width={viewWidth}>{children}</Centered>)
}

export default ViewWrapper