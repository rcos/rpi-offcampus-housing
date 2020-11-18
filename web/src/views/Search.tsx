import React, {useState, useEffect, useRef} from 'react'
import queryString from 'query-string'
import _ from 'lodash'

import ViewWrapper from '../components/ViewWrapper'

import Pagination from '../components/toolbox/layout/Pagination'
import Dropdown from '../components/toolbox/form/Dropdown'
import RangeSelector from '../components/toolbox/form/RangeSelector'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import SearchResult, {SearchResultLoading} from '../components/SearchResult'
import {BiFilterAlt, BiSort, BiSearch} from 'react-icons/bi'

// API
import {useSearchPropertiesLazyQuery} from '../API/queries/types/graphqlFragmentTypes'

const clamp = (a: number, b: number, c: number) => Math.min(Math.max(a, b), c);

const SearchParameters = {
  
  // min & max price on the range slider
  priceRange: [300, 1600],

  // room count options
  roomCounts: [1, 2, 3, 4]

}

const SearchView = () => {

  // search parameters settings
  const priceRange = SearchParameters.priceRange
  const roomCounts = SearchParameters.roomCounts
  const [SearchForProperties, {data: searchPropertiesData}] = useSearchPropertiesLazyQuery()

  // State Variables
  const [loading, setLoading] = useState<boolean>(true)
  const [searchPage, setSearchPage] = useState<number>(0)
  const [searchResults, setSearchResults] = useState<Object []>()
  const [roomCountIndex, setRoomCountIndex] = useState<number>(-1)

  // const [__, setInitialPriceBoundSet] = useState<boolean>(false)
  const [priceBound, setPriceBound] = useState<number[]>([400, 600])

  useEffect(() => {

    // on load, check which search page we are on
    const searchParams = queryString.parse(window.location.search)
    if (_.has(searchParams, 'p')) {
      setSearchPage( parseInt( searchParams["p"] as string ))
    }

    // set the price bounds from the params
    let bounds = [priceRange[0], priceRange[1]]
    if (_.has(searchParams, 'min_price')) bounds[0] = parseInt( searchParams["min_price"] as string )
    if (_.has(searchParams, 'max_price')) bounds[1] = parseInt( searchParams["max_price"] as string )
    setPriceBound(bounds)
    // setInitialPriceBoundSet(true)

    // set the room count index from url params
    const setInitialRoomCount = () => {
      const searchParams = queryString.parse(window.location.search)
      if (_.has(searchParams, 'nroom')) {
        let nrooms: number = parseInt( searchParams["nroom"] as string )
        // try to find the index that is closest to nrooms
        let diff = Number.MAX_VALUE
        let best_index = -1
        for (let i = 0; i < roomCounts.length; ++i) {
          let curr_diff = Math.abs(roomCounts[i] - nrooms)
          // if there is an option that has the exact number of rooms, then it is the best choice
          if (curr_diff === 0) {
            best_index = i;
            break;
          }
          if (curr_diff < diff) {
            diff = curr_diff
            best_index = i
          }
        }
  
        if (best_index >= 0 && best_index < roomCounts.length) {
          console.log(`Best Room Count Index: ${best_index}`)
          setRoomCountIndex(best_index)
        }
        else {
          setRoomCountIndex(0)
        }
      }
    }
    setInitialRoomCount ()

  }, [])

  useEffect(() => {
    console.log(`Search Page: ${searchPage}`)

    SearchForProperties({variables: {
      offset: searchPage * 8,
      count: 8
    }})
    // get the results for the next page
    /*
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
      }
    })
    .catch(err => {
      console.log(`Error searching for properties...`)
      console.log(err)
    })
    */

  }, [searchPage])

  useEffect(() => {

    setSearchResults(searchPropertiesData?.searchProperties.data?.properties)
    setLoading(false)

  }, [searchPropertiesData])


  useEffect(() => {

    const updatePageUrl = () => {
      let nrooms = roomCountIndex >= roomCounts.length || roomCountIndex < 0 ? roomCounts[roomCounts.length - 1] : roomCounts[roomCountIndex]
      let destination = `/search?p=${searchPage}&min_price=${priceBound[0]}&max_price=${priceBound[1]}&nroom=${nrooms}`
      window.history.replaceState(null, document.title, destination)
    }

    updatePageUrl()
  }, [searchPage, roomCounts, priceBound, roomCountIndex])

  const handlePageChange = (page_number: number): void => {
    // load the next/previous page based on what page_direction is set to
    setSearchPage(page_number)
  }

  const goToPage = (page_index: number): void => {
    setSearchPage(Math.max(0, page_index))
  }

  const handlePriceBoundSet = (new_bounds: number[]) => {
    let clamped_bounds = [clamp(new_bounds[0], priceRange[0], priceRange[1]), clamp(new_bounds[1], priceRange[0], priceRange[1])]
    setPriceBound(clamped_bounds)
  }

  const handleRoomCountSelect = (new_index: number) => {
    setRoomCountIndex(new_index)
  }

  return (<div>
    <ViewWrapper>
      <div>

        <div className="search-page-contents">
          <div className="left-area"><SearchFilterArea 
            priceBound={priceBound}
            setPriceBound={handlePriceBoundSet}
            priceRange={priceRange}
            roomCounts={roomCounts}
            roomIndex={roomCountIndex}
            selectedRoomCountIndex={roomCountIndex}
            handleRoomCountSelect={handleRoomCountSelect}
          /></div>
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

interface ISearchFilterArea {
  // the possible min/max values
  priceRange: number[]
  priceBound: number[]
  setPriceBound: Function
  roomCounts: number[]
  roomIndex: number
  selectedRoomCountIndex: number
  handleRoomCountSelect: (arg0: number) => void
}
const SearchFilterArea = ({priceBound, roomIndex, setPriceBound, priceRange, roomCounts, selectedRoomCountIndex, handleRoomCountSelect}: ISearchFilterArea) => {

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
    const recalculateMapHeight = () => {
      setMapHeight(calculateMapHeight())
    }

    setMapHeight(calculateMapHeight())
    window.addEventListener('resize', recalculateMapHeight)

    /*
    The first calculation of the map height is usually incorrect.
    Once all the components mount successfully, the height becomes
    accurate. So I will calculate the height 5 times at the start
    after some time has passed to get the accurate height.
    */
    let t_1 = setTimeout(() => {setMapHeight(calculateMapHeight())}, 10)
    let t_2 = setTimeout(() => {setMapHeight(calculateMapHeight())}, 100)
    let t_3 = setTimeout(() => {setMapHeight(calculateMapHeight())}, 500)
    let t_4 = setTimeout(() => {setMapHeight(calculateMapHeight())}, 1000)

    return () => {
      clearTimeout(t_1);
      clearTimeout(t_2);
      clearTimeout(t_3);
      clearTimeout(t_4);
      window.removeEventListener('resize', recalculateMapHeight)
    }
  }, [])

  const handlePriceSlide = (a: number, b:number): void => {
    // update the price range
    setPriceBound([a.toFixed(2), b.toFixed(2)])
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
            min={priceRange[0]}
            max={priceRange[1]}
            labelPrefix="$"
            initialLeft={priceBound[0]}
            initialRight={priceBound[1]}
            onChange={handlePriceSlide}
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
                options={roomCounts}
                onSelect={handleRoomCountSelect}
                selectedIndex={selectedRoomCountIndex}
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
          You are looking to lease {roomCounts[roomIndex]} {roomCounts[roomIndex] === 1 ? 'bedroom' : 'bedrooms'} between the
          prices of ${priceBound[0]} and ${priceBound[1]} from the beginning of {dateStr(startDate)} to the 
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
  const searchResultContainerRef = useRef<HTMLDivElement>(null)
  const resultViewportRef = useRef<HTMLDivElement>(null)

  // state
  const [resultsViewportHeight, setViewportHeight] = useState(0)

  // effects
  useEffect(() => {

    const updateResultsViewportHeight = (): void => {
      setViewportHeight(calculateResultsViewportHeight())
    }

    setViewportHeight(calculateResultsViewportHeight())
    let t_1 = setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 10)
    let t_2 = setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 100)
    let t_3 = setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 500)
    let t_4 = setTimeout(() => {setViewportHeight(calculateResultsViewportHeight())}, 1000)
    window.addEventListener('resize', updateResultsViewportHeight)

    return () => {
      clearTimeout(t_1);
      clearTimeout(t_2);
      clearTimeout(t_3);
      clearTimeout(t_4);
      window.removeEventListener('resize', updateResultsViewportHeight)
    }
  }, []);

  const calculateResultsViewportHeight = (): number => {
    if (resultViewportRef.current == null) return 0;

    let viewportDiv: HTMLDivElement = resultViewportRef.current!
    let rect_ = viewportDiv.getBoundingClientRect()

    let clientHeight = document.documentElement.clientHeight
    return clientHeight - (rect_.top + 10)
  }

  const scrollTo = (element: any, to: number, duration: number) => {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;
  
    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
  }

  /* Return true if there is a page to go to on the previous or next. */
  const isActive = ({prev, next}: {prev?: boolean, next?: boolean}): boolean => {
    if (prev) {
      return page > 0
    }
    if (next) {
      return page < 4 // temporary page limiting
    }
    return false;
  }

  return (<div className="search-results-area" 
    style={{
      height: `${resultsViewportHeight}px`
    }}
    ref={resultViewportRef}>

    {/* Results Count */}
    <div className="results-count-row">
      <div className="left-and-right pointer activable active section-header">
        <div className="icon-area"><BiSearch /></div>
        <div className="title-area">20 Results</div>
      </div>
    </div>

    {/* Search Results Container */}
    <div className="search-results-container" ref={searchResultContainerRef}>


      {loading && <div>
        {Array.from(new Array(10), (x: any, i: number) => (<SearchResultLoading key={i} />))}  
      </div>}
      {/* <SearchResult featured={true} /> */}
      {/* {Array.from(new Array(10), (x, i) => (<SearchResult key={i} />))} */}
      {!loading && results.map((result_: any, i: number) => <SearchResult key={i} result={result_} />
      )}
    </div>

    {/* Pagination */}
    {!loading && <Pagination 
      page_range={{min: 0, max: 4}}
      page={page}
      pageChange={(page_num: number) => {
        goToPage(page_num);
          if (searchResultContainerRef.current) {
            scrollTo(searchResultContainerRef.current, 0, 150)
          }
      }}
    />}
  </div>)
}

export default SearchView