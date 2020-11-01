import React, { useEffect, useRef } from 'react'

import ViewWrapper from '../components/ViewWrapper'
import {BiCollection} from 'react-icons/bi'

const CollectionView = () => {

  const collectionContainerRef = useRef<HTMLDivElement>(null)

  // on mount
  useEffect(() => {
    setContainerHeight ()
    window.addEventListener('resize', setContainerHeight)

    // on dismount
    return () => {
      window.removeEventListener('resize', setContainerHeight)
    }
  }, [])

  const setContainerHeight = () => {
    // get the bounding rect of the collection container
    if (collectionContainerRef.current == null) return;
    let rect = collectionContainerRef.current.getBoundingClientRect()

    let height_: number = window.innerHeight - (rect.top + 20)
    collectionContainerRef.current.style.height = `${height_}px`
  }

  return(<ViewWrapper>

      <div className="left-and-right pointer activable active"
        style={{
          height: '35px',
          lineHeight: '35px',
          fontWeight: 600
        }}
      >
        <div style={{width: '20px',
        height: '35px',
        marginRight: '5px',
        transform: `translateY(2px)`,
        minWidth: '20px'}}><BiCollection /></div>
        <div style={{
          fontSize: '0.85rem'
        }}>
          Collection
        </div>
      </div>

      {/* Collection Entry List */}
      <div ref={collectionContainerRef} className="collection-entry-holder">
        {Array.from(new Array(12), (x, i: number) => {
          return (<CollectionEntry key={i} />)
        })}
      </div>

  </ViewWrapper>)
}

const CollectionEntry = () => {

  return (<div className="collection-entry">
    <div className="image-area">
      <div className="image-container"></div>

      {/* Thumbnails */}
      <div className="image-previews">
        {Array.from(new Array(3), (x, i:number) => {
          return <div className="image-preview-entry" key={i}></div>
        })}
      </div>
    </div>
    <div className="content-area">
      <div style={{
        fontWeight: 600,
        fontSize: `1rem`
      }}>
        212 15th St, Troy NY 12180
      </div>

      {/* Collection Attributes */}
      <div style={{marginTop: `10px`}}>
        <div className="attr-entry">
          <div className="attr-key">Owned By</div>
          <div className="attr-value">John Meyer</div>
        </div>
        <div className="attr-entry">
          <div className="attr-key">Next Available Date</div>
          <div className="attr-value">September 2021</div>
        </div>
      </div>

    </div>
  </div>)
}

export default CollectionView