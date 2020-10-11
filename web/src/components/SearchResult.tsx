import React from 'react'

import {BiAddToQueue, BiRightArrowAlt} from 'react-icons/bi'
import Button from './toolbox/form/Button'

const SearchResult = () => {
  
  return (<div className="search-result">
    
    {/* Add to Collection Button */}
    <div className="add-to-collection">
      <BiAddToQueue />
    </div>

    {/* View Property Button */}
    <div className="view-property-button">
      <Button 
        text="View"
        icon={<BiRightArrowAlt />}
        iconLocation="right"
        background="white"
        border="black"
      />
    </div>

    <div className="result-grid">
      <div className="primary-image-area">
        <div className="image-container">

        </div>
      </div>
      <div className="right-info-area">
        
        {/* Vertical Flex */}
        <div style={{display: 'flex', 
        height: `100%`,
        flexDirection: 'column',
        justifyContent: 'space-between'}}>
          <div>

            {/* Property Location Information */}
            <div style={{
              display: 'flex',
              fontSize: `0.9rem`  
            }} className="padded-2 upper">
              <div
                style={{
                  fontWeight: 600,
                  marginRight: '10px'
                }}
              >212 15th St, Troy NY 12180</div>
              <div>4 miles Away</div>
            </div>

            {/* Landlord Information */}
            <div className="padded-2 upper" style={{fontSize: `0.8rem`, display: `flex`, alignItems: `center`}}>
              <div style={{textTransform: 'uppercase', fontSize: `0.75rem`, fontWeight: 600}}>
                Owned By</div>
              <div style={{marginLeft: `5px`}}>John Meyer</div>
            </div>
          </div>

          <div style={{marginBottom: `10px`, display: 'flex'}}>
            
            {Array.from(new Array(3), (x) => (
            <div className="secondary-image-area">
              <div className="image-container"></div>
            </div>))}
            <div className="image-count-area">
              +3 More Photos
            </div>

          </div>

        </div>
      </div>
    </div>

  </div>)
}

export default SearchResult