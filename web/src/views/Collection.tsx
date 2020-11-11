import React, { useState, useEffect, useRef } from 'react'

import ViewWrapper from '../components/ViewWrapper'
import {BiCollection} from 'react-icons/bi'

const CollectionView = () => {

  // Container ref: the ref references the collection view, excluding the header
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    const setContainerHeight = (h: number): void => {
      if (containerRef.current == null) return
      // containerRef.current.style.height = `${h}px`
      setHeight(h)
    }

    const calcualteContainerHeight = () => {
      if (headerRef.current != null) {
        let bottomOfHeader = headerRef.current.getBoundingClientRect().bottom
        setContainerHeight ( document.documentElement.clientHeight - bottomOfHeader - 20 );
      }
    }

    calcualteContainerHeight()
    let a_t = setTimeout(calcualteContainerHeight, 100)
    let b_t = setTimeout(calcualteContainerHeight, 300)
    let c_t = setTimeout(calcualteContainerHeight, 500)
    let d_t = setTimeout(calcualteContainerHeight, 1000)

    window.addEventListener('resize', calcualteContainerHeight)
    // unmount clean up
    return () => {
      window.removeEventListener('resize', calcualteContainerHeight)
      clearTimeout(a_t)
      clearTimeout(b_t)
      clearTimeout(c_t)
      clearTimeout(d_t)
    }
  }, [])

  return (<ViewWrapper>
    <div>

      {/* Collection Header */}
      <div className="section-header left-and-right" ref={headerRef}>
        <div className="icon-area"><BiCollection /></div>
        <div className="title-area">Your Collection</div>
      </div>

      {/* Collection Entries Container */}
      <div className="collection-container" ref={containerRef} style={{height: `${height}px`}}>
        X
      </div>

    </div>
  </ViewWrapper>)
}

export default CollectionView