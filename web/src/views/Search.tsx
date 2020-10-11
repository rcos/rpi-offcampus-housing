import React, {useState, useRef} from 'react'

import Centerd from '../components/toolbox/layout/Centered'
import Navbar from '../components/Navbar'

import Dropdown from '../components/toolbox/form/Dropdown'
import Toggle from '../components/toolbox/form/Toggle'
import RangeSelector from '../components/toolbox/form/RangeSelector'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import {BiFilterAlt, BiSort} from 'react-icons/bi'
import src from '*.bmp'


const SearchFilterArea = () => {

  // State
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endtDate, setEndDate] = useState<Date>(new Date())

  // Refs
  const filterAreaRef = useRef<HTMLDivElement>(null)

  const sliderChanged = (min: number, max: number): void => {
    console.log(`Slider changed from ${min} to ${max}`)
  }

  const sliderSlid = (min: number, max: number): void => {
    console.log(`Slider slid from ${min} to ${max}`)
  }

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
  const getMapHeight = (): number => {
    if (filterAreaRef.current == null) return 0;

    let filterDiv: HTMLDivElement = filterAreaRef.current!;

    let bottomOfFilter = filterDiv.getBoundingClientRect().bottom + 20
    let viewportHeight = document.documentElement.clientHeight

    let height_ = Math.max(viewportHeight - bottomOfFilter, 0)
    console.log(`Map Height: ${height_}`)
    return height_
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
          You are looking to lease from the beginning of {dateStr(startDate)} to the 
          end of the {dateStr(endtDate)}.
        </div>
      </div>
    </div>

    {/* Map Placeholder */}
    <div className="map-area" style={{
      height: `${getMapHeight()}px`,
      bottom: `-${getMapHeight() + 10}px`,
      backgroundImage: `url('https://i.imgur.com/DxbLDs2.png')`,
      backgroundSize: '120%'
    }}>

    </div>
  </div>)
}

const SearchResultsArea = () => {

  return (<div>
    RESULTS
  </div>)
}

const SearchView = () => {

  return (<div>
    <Centerd height="100%" width={1000}>
      <div>

        <div style={{marginTop: '20px'}}></div>
        <Navbar />
        <div style={{marginTop: '20px'}}></div>

        <div className="search-page-contents">
          <div className="left-area"><SearchFilterArea /></div>
          <div className="right-area"><SearchResultsArea /></div>
        </div>

      </div>

    </Centerd>
  </div>)
}

export default SearchView