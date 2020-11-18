import React, {useState, useEffect, useContext} from 'react'
import AlertContext from './context/AlertContext'
import {useHistory} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {HiX} from 'react-icons/hi'

import {useAddCollectionMutation, useRemoveCollectionMutation} from '../API/queries/types/graphqlFragmentTypes'
import {BiAddToQueue, BiRightArrowAlt} from 'react-icons/bi'
import Button from './toolbox/form/Button'
import {ReduxState, isStudent} from '../redux/reducers/all_reducers'
import {StudentInfo} from '../redux/actions/user'
import {fetchUser} from '../redux/actions/user'

interface ISearchResult {
  featured?:boolean
  result: Object | null
}


const SearchResult = ({ featured, result }: ISearchResult) => {

  const history = useHistory()
  const dispatch = useDispatch()
  const user = useSelector((state: ReduxState) => state.user)
  const [addToCollection, {data: addCollectionResult}] = useAddCollectionMutation();
  const [removeFromCollection, {data: removeCollectionResult}] = useRemoveCollectionMutation();
  const [inCollection, setInCollection] = useState<boolean>(false)
  const alertCtx = useContext(AlertContext)
  
  const getAddress = (): string => {
    if (!result) return "<undefined>"
    // 212 15th St, Troy NY 12180
    let location = (result as any).location
    return location
  }

  const __updateCollection = (): void => {
    if (user && (result as any)._id) {

      // remove property from collection
      if (inCollection) {
        removeFromCollection({
          variables: {
            student_id: user && user.user ? user.user._id: "",
            property_id: (result as any)._id
          }
        })
      }

      // add property to collection
      else {
        addToCollection({
          variables: {
            student_id: user && user.user ? user.user._id: "",
            property_id: (result as any)._id
          }
        })
      }
    }
  }

  const updateInCollection = () => {
    if (user && user.user && isStudent(user) && (user as StudentInfo).user!.saved_collection) {
      setInCollection((user as StudentInfo).user!.saved_collection!.includes((result as any)._id) )
    } 
  }

  useEffect(() => {
    updateInCollection ()
  }, [result, user])

  useEffect(() => {

    if (addCollectionResult != null) {
      if (addCollectionResult.addPropertyToStudentCollection.success) {
        // fetch user now
      dispatch(fetchUser(user, {update: true}))
      if (alertCtx.successAlert) alertCtx.successAlert({...(result as any), type: 'collection-add'})
      }
    }

  }, [addCollectionResult])

  useEffect(() => {

    if (removeCollectionResult != null) {
      if (removeCollectionResult.removePropertyFromStudentCollection.success) {
        // fetch user now
      dispatch(fetchUser(user, {update: true}))
      if (alertCtx.successAlert) alertCtx.successAlert({...(result as any), type: 'collection-remove'})
      }
    }

  }, [removeCollectionResult])

  return (<div className={`search-result ${featured ? 'featured' : ''}`}>

    {/* Add to Collection Button */}
    <AlertContext.Consumer>
      {(locale) => {
        return (
          <div 
          onClick={() => {
            __updateCollection ();
            // (locale as any).successAlert({...result, type: 'collection-add'})
          }}
          className={`add-to-collection icon-button ${inCollection ? `added` : ''}`}>
            {inCollection ? <HiX /> : <BiAddToQueue />}
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