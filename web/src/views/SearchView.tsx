import React, {useEffect, useRef, useState} from 'react';
import ViewWrapper from '../components/ViewWrapper';
import Slider from '../components/toolbox/form/Slider';
import RangeSlider, {date,MONTHS_ABRV} from '../components/toolbox/form/RangeSlider';
import Counter, {positiveOnly, maxVal} from '../components/toolbox/form/Counter';
import MoreDetails from '../components/toolbox/misc/MoreDetails'
import {useNumberCounter} from '../components/hooks/useNumberCounter'
import Button from '../components/toolbox/form/Button'
import {useMediaQuery} from 'react-responsive'
import {HiCheck} from 'react-icons/hi'
import {motion, useSpring, useTransform} from 'framer-motion'
import Cookies from 'universal-cookie'
import {useHistory} from 'react-router'

import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'

const SearchView = () => {

    const containerRef = useRef<HTMLDivElement>(null)
    const leftContainerRef = useRef<HTMLDivElement>(null)
    const [leftFilterWidth, setLeftFilterWidth] = useState<number>(400)
    const [contentStart, setContentStart] = useState<number>(0)

    const history = useHistory();
    const cookie = new Cookies ();

    const resultsCount = useNumberCounter({
        value: 50,
        duration: 1000
    })

    useEffect(() => {
        updateFilterWidth ()
        window.addEventListener(`resize`, updateFilterWidth)

        // check if the notif cookie is set
        let notification_prompted = cookie.get('notif') != undefined
        if (!notification_prompted) {
            history.push('/notifications/enable')
        }

        return () => {
            window.removeEventListener(`resize`, updateFilterWidth)
        }
    }, [])

    const updateFilterWidth = () => {
        // filter width should be x% of the page width
        let w_ = document.documentElement.getBoundingClientRect().width;
        setLeftFilterWidth(w_ * 0.32)
    }

    return (<ViewWrapper
        hide_sidebar={true}
        left_attachment_width={leftFilterWidth}
        onContentStart={(val: number) => {
            setContentStart(val)
        }}
        left_attachment={<div className="filter-map-attachment">

            {/* Left Side */}
            <div className="section-header-2" style={{height: `30px`}}>
                <div className="title-area">Search</div>
                <div className="counter_">{resultsCount} Properties</div>
            </div>
            
            <div className="left-side_" ref={leftContainerRef} style={{
                // left: `${leftFilterProps.left}px`,
                // width: `${leftFilterProps.width}px`
            }}>
                {/* Filter Box */}
                <div className="search-filter-box">
                    <div style={{
                        padding: `10px`,
                        marginBottom: `5px`,
                        // border: `1px solid black`
                    }}>
                        <div className="input-label_">Price Per Room</div>
                        <Slider 
                            range={{start: 300, end: 1200}}
                            toStr={(val: any): string => {return `$${(val as number).toFixed(2)}`}}
                        />
                    </div>

                    <div style={{
                        padding: `10px`,
                        // border: `1px solid black`
                    }}>
                    <div className="input-label_">Lease Period</div>
                        <RangeSlider 
                            forceUpdate={leftFilterWidth}
                            // range={{start: 300, end: 1200}}
                            range={{
                                interpolate: date.from(new Date()).to(date.fromNow({ years: 1 })),
                                toString: (_: Date) => `${MONTHS_ABRV[_.getMonth()]} ${_.getDate()}, ${_.getFullYear()}`
                            }}
                            onChange={(start_date: Date, end_date: Date) => {
                                console.log(`start`, start_date)
                                console.log(`end`, end_date)
                            }}
                            toStr={(val: any): string => {return `$${(val as number).toFixed(2)}`}}
                        />
                    </div>

                    {/* # of Rooms & Distance Counters */}
                    <div className="filter-bottom-counters">
                        <div className="inline-form-input" style={{
                            padding: `10px`
                        }}>
                            <div className="input-label_">
                                <span style={{marginRight: `5px`}}>Rooms</span>
                                <MoreDetails 
                                    details="Choose how many rooms you are looking for."
                                />
                            </div>
                            <div className="input-area_">
                                <Counter
                                    restrictions={[positiveOnly, maxVal(4, {inclusive: true})]}
                                    onChange={(val: number) => {}}
                                />
                            </div>
                        </div>

                        <div className="inline-form-input right" style={{
                            padding: `10px`
                        }}>
                            <div className="input-label_">
                                <span style={{marginRight: `5px`}}>Distance (mi.)</span>
                                <MoreDetails 
                                    details="Choose the maximum distance from campus you are looking for"
                                />
                            </div>
                            <div className="input-area_">
                                <Counter
                                    restrictions={[positiveOnly, maxVal(40, {inclusive: true})]}
                                    onChange={(val: number) => {}}
                                    incrementBy={5}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{height: `10px`}} />
                </div>

                <div className="map-box" style={{}}>
                    {/* React Leaflet Resource: https://blog.logrocket.com/how-to-use-react-leaflet/ */}
                    <MapContainer center={[42.727680, -73.691063]} zoom={17} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[42.727680, -73.691063]}>
                        <Popup>Troy Placeholder</Popup>
                    </Marker>
                    </MapContainer>
                </div>
            </div>

        </div>}
    >
        <div className="search-container" ref={containerRef} style={{
            position: 'relative',
            marginTop: `47px`
        }}>

            {/* Right Side */}
            <div className="right-side_">
                {Array.from(new Array(10), (_: any, i: number) => 
                    <SearchResult key={i} delay={i < 8 ? i * 100 : 0} />
                )}
            </div>

        </div>
    </ViewWrapper>)
}

const SearchResult = ({delay}: {delay: number}) => {
    
    const isLargeScreen = useMediaQuery({
        query: '(min-width: 1200px)'
    })
    
    const showResultSpring = useSpring(0)
    const rotateXTransform = useTransform(showResultSpring, [0, 1], [10, 0])
    const translateYTransform = useTransform(showResultSpring, [0, 1], [-15, 0])

    useEffect(() => {
        let t_ = setTimeout(() => {
            showResultSpring.set(1)
        }, delay)

        return () => {
            clearTimeout(t_);
        }
    }, [])

    return (<motion.div 
        style={{
            opacity: showResultSpring,
            rotateX: rotateXTransform,
            translateY: translateYTransform,
            perspective: `6.5cm`
        }}
        className="search-result-2">
        
        <div className="image-area_">
            <div className="image-holder" />
        </div>
        <div className="info-area_">
            <div className="property-location">Sample Property Location 101</div>
            <div className="property-meta">TROY NY, 12180</div>

            <div className="action-area">
                <Button 
                    text="View"
                    textColor="white"
                    background="#3B4353"
                />
            </div>
        </div>

        {isLargeScreen && <div className="amenities-area">
            <div className="header_">Amenities</div>
            {Array.from(new Array(3), (_: any, i: number) => 
                <div className="entry_" key={i}>
                    <div className="check_"><HiCheck /></div>
                    <div className="">Entry Goes Here</div>
                </div>
            )}
        </div>}

    </motion.div>)
}
export default SearchView