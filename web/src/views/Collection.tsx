import React, { useEffect, useRef } from 'react'

import ViewWrapper from '../components/ViewWrapper'
import {BiCollection} from 'react-icons/bi'

const CollectionView = () => {

  return (<ViewWrapper>
    <div>

      {/* Collection Header */}
      <div className="section-header left-and-right">
        <div className="icon-area"><BiCollection /></div>
        <div className="title-area">Your Collection</div>
      </div>

      {/* Collection Entries Container */}
      <div className="collection-container">
        X
      </div>

    </div>
  </ViewWrapper>)
}

export default CollectionView