import React, { useEffect, useState, useRef } from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router'

import {useCollectionLazyQuery, useRemoveCollectionMutation} from '../API/queries/types/graphqlFragmentTypes'
import {fetchUser} from '../redux/actions/user'
import {ReduxState} from '../redux/reducers/all_reducers'
import ViewWrapper from '../components/ViewWrapper'
import {BiCollection} from 'react-icons/bi'
import Pagination from '../components/toolbox/layout/Pagination'
import Button from '../components/toolbox/form/Button'
import {BiRightArrowAlt, BiX} from 'react-icons/bi'
import {BsThreeDotsVertical} from 'react-icons/bs'
import ContextMenu from '../components/toolbox/misc/ContextMenu'

const CollectionView = () => {

  // Container ref: the ref references the collection view, excluding the header
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [collectionData, setCollectionData] = useState<any>(null)
  const user = useSelector((state: ReduxState) => state.user)
  const [pageNumber, setPageNumber] = useState<number>(0)
  const [getCollection, {loading: collectionLoading, data: collectionDataResults}] = useCollectionLazyQuery({
    fetchPolicy: 'no-cache'
  })
  const collection_entries_per_page = 12

  const getMaxPages = (): number => {
    if (user == null || user.type == null || user.type != "student") return 1;
    if (!user || !(user.user) || ( user.type && user.type=="student" && !(user.user.saved_collection) )) return 1;

    return Math.max(0, Math.floor( user!.user!.saved_collection!.length / collection_entries_per_page ));
  }

  useEffect(() => {
  }, [user])

  useEffect(() => {

    // get the next collection page
    if (user && user.user) {
      getCollection({
        variables: {
          id: user.user._id,
          offset: pageNumber * collection_entries_per_page,
          count: collection_entries_per_page
        }
      })
    }

  }, [user, pageNumber])

  useEffect(() => {
    if (collectionDataResults && collectionDataResults.getStudentSavedCollection.data) {
      setCollectionData(collectionDataResults.getStudentSavedCollection.data.collection_entries)
    }
  }, [collectionDataResults])

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

        {collectionData == null &&
          <div className="collection-grid">
            {Array.from(new Array(12), (x, i) => {
              return <CollectionEntryLoading key={i} />
            })}
          </div>
        }

        {collectionData != null && collectionData.length == 0 &&
          <div className="centered-empty">
            No Properties in Colection
          </div>
        }

        {collectionData != null && collectionData.length > 0 &&
          <div className="collection-grid">
            {collectionData.map((collection_entry: any, i: number) => {
              return <CollectionEntry key={i} data={collection_entry} />
            })}
          </div>
        }
      </div>

      {/* Pagination Area */}
      {collectionData != null &&
        <div className="pageination-holder">
        <Pagination 
          page={pageNumber}
          pageChange={(page_number: number) => {setPageNumber(page_number)}}
          page_range={{min: 0, max: getMaxPages()}}
        />
      </div>
      }
    </div>
  </ViewWrapper>)
}

interface ICollectionEntry {
  data: any
}
const CollectionEntry = ({data}: ICollectionEntry) => {

  const history = useHistory()
  const [removeFromCollectionMutation, {data: removeCollectionData}] = useRemoveCollectionMutation()
  const user = useSelector((state: ReduxState) => state.user)
  const dispatch = useDispatch()

  // todo: define
  const goToProperty = () => {
    history.push( data ? {

      // go to the property page, if this result has an id
      pathname: `/property/${(data as any)._id}`,
      state: { fromSearchPage: window.location.href }

      // ... otherwise, just return back to the same page
    } : `/search${window.location.search}` )
  }
  const removeFromCollection = () => {
    if (!user || !user.user) return; 

    removeFromCollectionMutation({
      variables: {
        property_id: data._id,
        student_id: user.user._id
      }
    })
  }

  useEffect(() => {
    if (removeCollectionData && removeCollectionData.removePropertyFromStudentCollection.success) {
      dispatch(fetchUser(user, {update: true}))
    }
  }, [removeCollectionData])

  useEffect(() => {
  }, [data])

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
      <span style={{fontWeight: 600, fontSize: '0.9rem'}}>{data.location}</span>
      </div>

      {/* Info goes here */}
      <div className="kv-pair">
        <div className="key">Date Added</div>
        <div className="value">11/10/2020</div>
      </div>
    </div>

    {/* Top Right Buttons */}
    <div style={{
      position: 'absolute',
      top: 0, right: '10px'
    }}>
      <ContextMenu
      iconLocation="left"
      position="top right"
        menuItems={[
          {label: 'View', icon: <BiRightArrowAlt />, onClick: goToProperty },
          {label: 'Remove', icon: <BiX />, onClick: removeFromCollection }
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
        onClick={() => {goToProperty()}}
        text="View"
        icon={<BiRightArrowAlt />}
        iconLocation="right"
        background="#99E1D9"
      />
    </div>
  </div>)
}

const CollectionEntryLoading = () => {

  return (<div className="collection-entry">
    <div className="image-holder">
      <div className="primary-image"><div className="image-loading" /></div>
      <div className="secondary-images">
        <div className="img-holder"><div className="image-loading" /></div>
        <div className="img-holder"><div className="image-loading" /></div>
      </div>
    </div>
    <div className="property-desc">
      
      {/* Property Header */}
      <div>
        <span style={{fontWeight: 600, fontSize: '0.9rem'}}><div className="block-loading" style={{width: `200px`}}/></span>
      </div>

      {/* Info goes here */}
      <div className="block-loading" style={{width: `100px`, marginTop: '10px'}}/>
      
      <div className="block-loading" style={{width: `100px`,  marginTop: '5px'}}/>
    </div>
  </div>)
}

export default CollectionView