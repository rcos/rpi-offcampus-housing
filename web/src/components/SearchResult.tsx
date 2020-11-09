import React from 'react'
import AlertContext from './context/AlertContext'
import {useHistory} from 'react-router'

import {BiAddToQueue, BiRightArrowAlt} from 'react-icons/bi'
import Button from './toolbox/form/Button'

interface ISearchResult {
  featured?:boolean
  result: Object | null
}

const SearchResult = ({ featured, result }: ISearchResult) => {

  const history = useHistory()
  
  const getAddress = (): string => {
    if (!result) return "<undefined>"
    // 212 15th St, Troy NY 12180
    let location = (result as any).location
    return location
  }

  return (<div className={`search-result ${featured ? 'featured' : ''}`}>

    {/* Add to Collection Button */}
    <AlertContext.Consumer>
      {(locale) => {
        return (
          <div 
          onClick={() => {
            (locale as any).successAlert({...result, type: 'collection-add'})
          }}
          className="add-to-collection">
            <BiAddToQueue />
          </div>
        )
      }}
    </AlertContext.Consumer>

    {/* View Property Button */}
    <div className="view-property-button">
      <Button 
        text="View"
        icon={<BiRightArrowAlt />}
        iconLocation="right"
        background={featured ? '#ffeebd' : '#99E1D9'}
        onClick={() => { history.push( result ? {

          // go to the property page, if this result has an id
          pathname: `/property/${(result as any)._id}`,
          state: { fromSearchPage: window.location.href }

          // ... otherwise, just return back to the same page
        } : `/search${window.location.search}` ) }}
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
              >{getAddress()}</div>
              <div>4 miles Away</div>
              {featured && <div className="featured-button">featured</div>}
            </div>

            {/* Landlord Information */}
            <div className="padded-2 upper" style={{fontSize: `0.8rem`, display: `flex`, alignItems: `center`}}>
              <div style={{textTransform: 'uppercase', fontSize: `0.75rem`, fontWeight: 600}}>
                Owned By</div>
              <div style={{marginLeft: `5px`}}>John Meyer</div>
            </div>
          </div>

          <div style={{marginBottom: `10px`, display: 'flex'}}>
            
            {Array.from(new Array(3), (x, i) => (
            <div className="secondary-image-area" key={i}>
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

const SearchResultLoading = () => {
  
  return (<div className={`search-result loading`}>

    {/* Add to Collection Button */}


    <div className="result-grid">
      <div className="primary-image-area">
        <div className="image-container">
          <div className="image-loading" />
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
              <div className="block-loading" style={{width: `200px`}}></div>
              <div className="block-loading" style={{width: `100px`}}></div>
            </div>

            {/* Landlord Information */}
            <div className="padded-2 upper" style={{fontSize: `0.8rem`, display: `flex`, alignItems: `center`}}>
              
              <div className="block-loading" style={{width: `100px`}}></div>
              <div className="block-loading" style={{width: `100px`}}></div>
            </div>
          </div>

          <div style={{marginBottom: `10px`, display: 'flex'}}>
            
            {Array.from(new Array(3), (x, i) => (
            <div className="secondary-image-area" key={i}>
              <div className="image-container"><div className="image-loading" /></div>
            </div>))}

          </div>

        </div>
      </div>
    </div>

  </div>)
}

export default SearchResult
export { SearchResultLoading }