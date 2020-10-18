import React, {useState, useEffect, useRef} from 'react'
import queryString from 'query-string'
import _ from 'lodash'

import ViewWrapper from '../components/ViewWrapper'
import Navbar from '../components/Navbar'

import Dropdown from '../components/toolbox/form/Dropdown'
import RangeSelector from '../components/toolbox/form/RangeSelector'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import SearchResult, {SearchResultLoading} from '../components/SearchResult'
import {BiFilterAlt, BiSort, BiHomeAlt} from 'react-icons/bi'
import { FiArrowRight, FiArrowLeft } from "react-icons/fi"

// API
import SearchAPI from '../API/SearchAPI'
import Loading from '../components/toolbox/misc/Loading'


const SearchView = () => {

  const [searchPage, setSearchPage] = useState<number>(0)
  const [searchResults, setSearchResults] = useState<Object []>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {

    // on load, check which search page we are on
    const searchParams = queryString.parse(window.location.search)
    if (_.has(searchParams, 'p')) {
      setSearchPage( parseInt( searchParams["p"] as string ))
    }

  }, [])

  useEffect(() => {
    console.log(`Search Page: ${searchPage}`)

    // get the results for the next page
    SearchAPI.properties(8, searchPage * 8)
    .then(result => {
      if (!result.data.success) {
        console.error(`Failed to search for peoperties on page ${searchPage}`)
        console.error(result.data.error)
        setSearchResults([])
        setLoading(false)
        // update the url

      }

      else {
        setSearchResults(result.data.properties)
        setLoading(false)
        // window.location.href = `${window.location.host}/search?p=${searchPage}`
        window.history.replaceState(null, document.title, `/search?p=${searchPage}`)
      }
    })
    .catch(err => {
      console.log(`Error searching for properties...`)
      console.log(err)
    })

  }, [searchPage])

  const handlePageChange = (page_direction: number): void => {
    // load the next/previous page based on what page_direction is set to
    let next_page = searchPage
    if (page_direction == 0) next_page = Math.max(0, next_page - 1)
    if (page_direction == 1) next_page += 1 // todo clamp to max
    setSearchPage(next_page)
  }

  const goToPage = (page_index: number): void => {
    setSearchPage(Math.max(0, page_index))
  }

  return (<div>
    <ViewWrapper>
      <div>

        <div className="search-page-contents">
          <div className="left-area"><SearchFilterArea /></div>
          <div className="right-area"><SearchResultsArea 
            loading={loading} 
            results={searchResults ? searchResults : []}
            handlePageChange={handlePageChange}
            goToPage={goToPage}
            page={searchPage}
          /></div>
        </div>

      </div>

    </ViewWrapper>
  </div>)
}

const SearchFilterArea = () => {

  // State
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endtDate, setEndDate] = useState<Date>(new Date())
  const [mapHeight, setMapHeight] = useState<number>(0)

  // Refs
  const filterAreaRef = useRef<HTMLDivElement>(null)

  const dateStr = (date_: Date): string => {
    let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December']
    return `${month[date_.getMonth()]} ${date_.getFullYear()}`
  }

  /**
   * @desc Given the `filter-area` div, determine the size of the area
   * starting from below this area to the bottom of the page. This will
   * be the height of the map box.
   */
  const calculateMapHeight = (): number => {
    if (filterAreaRef.current == null) return 0;

    let filterDiv: HTMLDivElement = filterAreaRef.current!;

    let bottomOfFilter = filterDiv.getBoundingClientRect().bottom + 20
    let viewportHeight = document.documentElement.clientHeight

    let height_ = Math.max(viewportHeight - bottomOfFilter, 0)
    return height_
  }

  useEffect(() => {
    setMapHeight(calculateMapHeight())
    window.addEventListener('resize', recalculateMapHeight)

    /*
    The first calculation of the map height is usually incorrect.
    Once all the components mount successfully, the height becomes
    accurate. So I will calculate the height 5 times at the start
    after some time has passed to get the accurate height.
    */
    setTimeout(() => {
      setMapHeight(calculateMapHeight())
    }, 10)
    setTimeout(() => {
      setMapHeight(calculateMapHeight())
    }, 100)
    setTimeout(() => {
      setMapHeight(calculateMapHeight())
    }, 500)
    setTimeout(() => {
      setMapHeight(calculateMapHeight())
    }, 1000)
    setTimeout(() => {
      setMapHeight(calculateMapHeight())
    }, 3000)
  }, [])

  const recalculateMapHeight = () => {
    setMapHeight(calculateMapHeight())
  }

  return (<div className="left-search-area">

    <div className="filter-area" style={{fontWeight: 600}} ref={filterAreaRef}>

      {/* Filter and Sort Buttons */}
      <LeftAndRight
        left={<div className="left-and-right pointer activable active">
          <div style={{width: '20px',
          height: '20px',
          marginRight: '5px',
          transform: `translateY(2px)`,
          minWidth: '20px'}}><BiFilterAlt /></div>
          <div style={{
            fontSize: '0.85rem'
          }}>Filter</div>
        </div>}
        right={<div className="left-and-right pointer activable">
          <div style={{
            fontSize: '0.85rem'
          }}>Sort</div>
          <div style={{width: '20px',
          height: '20px',
          marginLeft: '5px',
          transform: `translateY(2px)`,
          minWidth: '20px'}}><BiSort /></div>
        </div>}
      />

      {/* Price Slider */}
      <div className="padded upper">
        <div className="input-label">Price Per Room Range</div>
        <div className="padded-2 upper">
          <RangeSelector 
            min={300}
            max={10000}
            labelPrefix="$"
          />
        </div>
      </div>
      
      {/* Available Rooms and Max Distance From Campus */}
      <div style={{marginTop: "30px"}}>

        {/* Available Rooms */}
        <div style={{display: "flex"}}>
          <div style={{width: `35%`, minWidth: `35%`}}>
            <div className="input-label">Available Rooms</div>
            <div className="padded-2 upper">
              <Dropdown 
                options={["1", "2", "3"]}
                onSelect={() => {console.log(`default select callback.`)}}
              />
            </div>
          </div>
          <div style={{flexGrow: 1}}></div>

          {/* Distance From Campus */}
          <div style={{width: `55%`, minWidth: `55%`}}>
          <div className="input-label">Maximum Distance From Camous</div>
          <div className="padded-2 upper">
            <Dropdown 
              options={["5 miles", "10 miles", "15 miles", "20 miles"]}
              onSelect={() => {console.log(`default select callback.`)}}
            />
          </div>
        </div>
        </div>

      </div>

      <div className="padded upper">
        <div className="input-label">Lease Period</div>
        <div className="padded-2 upper">
          <RangeSelector 
            min={300}
            max={1000}
            labelPrefix="$"
            onSlide={(new_start_date: Date, new_end_date: Date) => {
              setStartDate(new_start_date)
              setEndDate(new_end_date)
            }}
            rangeArray={Array.from(new Array(5), (x, i) => {
              let date_ = new Date()
              date_.setDate(date_.getDate() + i * 30);
              return date_
            })}
            valueTransform={(val: Date): string => {
              let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              return `${month[val.getMonth()]} ${val.getFullYear()}`
            }}
          />
        </div>
        <div className="subtext" style={{marginTop: '30px'}}>
          You are looking to lease X bedrooms between the
          prices of $Y and $Z from the beginning of 
          {dateStr(startDate)} to the 
          end of the {dateStr(endtDate)}.
        </div>
      </div>
    </div>

    {/* Map Placeholder */}
    <div className="map-area" style={{
      height: `${mapHeight}px`,
      bottom: `-${mapHeight + 10}px`,
      backgroundImage: `url('https://i.imgur.com/DxbLDs2.png')`,
      backgroundSize: '120%'
    }}>

    </div>
  </div>)
}

interface ISearchResultsArea {
  results: Object[]
  loading: boolean
  handlePageChange: Function
  goToPage: Function
  page: number
}
const SearchResultsArea = ({results, loading, handlePageChange, goToPage, page}: ISearchResultsArea) => {

  // refs
  const resultViewportRef = useRef<HTMLDivElement>(null)

  // state
  const [resultsViewportHeight, setViewportHeight] = useState(0)

  // effects
  useEffect(() => {
    setViewportHeight(calculateResultsViewportHeight())
    setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 10)
    setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 100)
    setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 500)
    setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 1000)
    window.addEventListener('resize', updateResultsViewportHeight)
  }, []);

  const updateResultsViewportHeight = (): void => {
    setViewportHeight(calculateResultsViewportHeight())
  }

  const calculateResultsViewportHeight = (): number => {
    if (resultViewportRef.current == null) return 0;

    let viewportDiv: HTMLDivElement = resultViewportRef.current!
    let rect_ = viewportDiv.getBoundingClientRect()

    let clientHeight = document.documentElement.clientHeight
    return clientHeight - (rect_.top + 10)
  }

  return (<div className="search-results-area" 
    style={{
      height: `${resultsViewportHeight}px`
    }}
    ref={resultViewportRef}>

    {/* Results Count */}
    <div className="results-count-row">
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
        minWidth: '20px'}}><BiHomeAlt /></div>
        <div style={{
          fontSize: '0.85rem'
        }}>
          20 Results
        </div>
      </div>
    </div>

    {/* Search Results Container */}
    <div className="search-results-container">


      {loading && <div>
        {Array.from(new Array(10), (x: any, i: number) => (<SearchResultLoading key={i} />))}  
      </div>}
      {/* <SearchResult featured={true} /> */}
      {/* {Array.from(new Array(10), (x, i) => (<SearchResult key={i} />))} */}
      {!loading && results.map((result_: any, i: number) => <SearchResult key={i} result={result_} />
      )}
    </div>

    {/* Pagination */}
    <div className="search-pagination">
      <div className="left-arrow-area" onClick={() => handlePageChange(0)}>
        <FiArrowLeft />
      </div>
      <div className="page-indexes">
        {Array.from(new Array(5), (_, i: number) => {
          return (<div 
            key={i}
            onClick={() => {goToPage(i)}}
            className={`page-index ${i == page ? 'active' : ''}`}>{i + 1}</div>);
        })}
        {/* <div className="page-index active">1</div>
        <div className="page-index">2</div>
        <div className="page-index">3</div>
        <div className="page-index">4</div>
        <div className="page-index">5</div> */}
      </div>
      <div className="right-arrow-area active" onClick={() => handlePageChange(1)}>
        <FiArrowRight />
      </div>
    </div>
  </div>)
}

export default SearchView