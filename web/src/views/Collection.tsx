import React, { useEffect, useRef } from 'react'

import ViewWrapper from '../components/ViewWrapper'
import {BiCollection} from 'react-icons/bi'
import Pagination from '../components/toolbox/layout/Pagination'
import Button from '../components/toolbox/form/Button'
import {BiRightArrowAlt} from 'react-icons/bi'
import {BsThreeDotsVertical} from 'react-icons/bs'
import ContextMenu from '../components/toolbox/misc/ContextMenu'

const CollectionView = () => {

  // Container ref: the ref references the collection view, excluding the header
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setContainerHeight = (h: number): void => {
      if (containerRef.current == null) return
      containerRef.current.style.height = `${h}px`
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
    <div className="collection-holder">

      {/* Collection Header */}
      <div className="section-header left-and-right" ref={headerRef}>
        <div className="icon-area"><BiCollection /></div>
        <div className="title-area">Your Collection</div>
      </div>

      {/* Collection Entries Container */}
      <div className="collection-container" ref={containerRef}>

        <div className="collection-grid">
          {Array.from(new Array(15), (x, i) => {
            return <CollectionEntry key={i} />
          })}
        </div>
      </div>

      {/* Pagination Area */}
      <div className="pageination-holder">
          <Pagination 
            page={0}
            pageChange={() => {}}
            page_range={{min: 0, max: 5}}
          />
        </div>
    </div>
  </ViewWrapper>)
}

const CollectionEntry = () => {

  return (<div className="collection-entry">
    <div className="image-holder">
      <div className="primary-image"></div>
      <div className="secondary-images">
        <div className="img-holder"></div>
        <div className="img-holder"></div>
      </div>
    </div>
    <div className="property-desc">
      
      {/* Property Header */}
      <div>
        <span style={{fontWeight: 600, fontSize: '0.9rem'}}>Sample Property Address Goes Here</span>
      </div>

      {/* Info goes here */}
      <div className="kv-pair">
        <div className="key">Date Added</div>
        <div className="value">11/10/2020</div>
      </div>
      
      <div className="kv-pair">
        <div className="key">Landlord</div>
        <div className="value">Jimmy Joe</div>
      </div>
    </div>

    {/* Top Right Buttons */}
    <div style={{
      position: 'absolute',
      top: 0, right: '10px'
    }}>
      <ContextMenu
      iconLocation="right"
      position="top right"
        menuItems={[
          {label: 'Option One', icon: <BsThreeDotsVertical />},
          {label: 'Option Two', icon: <BsThreeDotsVertical />},
          {label: 'Option Three', icon: <BsThreeDotsVertical />}
        ]}
      >
        <div className="icon-button" style={{position: 'relative'}}><BsThreeDotsVertical /></div>
      </ContextMenu>
    </div>

    {/* Bottom Right Buttons */}
    <div style={{
      position: 'absolute',
      right: '10px',
      bottom: 0
    }}>
      <Button 
        text="View"
        icon={<BiRightArrowAlt />}
        iconLocation="right"
        background="#99E1D9"
      />
    </div>
  </div>)
}

export default CollectionView