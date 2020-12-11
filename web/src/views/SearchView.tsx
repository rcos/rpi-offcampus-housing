import React, {useEffect, useRef, useState} from 'react';
import ViewWrapper from '../components/ViewWrapper';
import Slider from '../components/toolbox/form/Slider';
import RangeSlider from '../components/toolbox/form/RangeSlider';
import Counter, {positiveOnly, maxVal} from '../components/toolbox/form/Counter';
import MoreDetails from '../components/toolbox/misc/MoreDetails'

import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'

const SearchView = () => {

    const [dimenstionUpdate, setDimensionUpdate] = useState<any>(0)
    const dimenstionChangeInformer = (val: any) => setDimensionUpdate(val)
    const containerRef = useRef<HTMLDivElement>(null)
    const leftContainerRef = useRef<HTMLDivElement>(null)
    const [leftFilterProps, setLeftFilterProps] = useState<{
        left: number, width: number
    }>({left: 0, width: 0})


    useEffect(() => {
        updateFilterProps();
        window.addEventListener(`resize`, updateFilterProps)

        return () => {
            window.removeEventListener(`resize`, updateFilterProps)
        }
    }, [dimenstionUpdate])

    const updateFilterProps = () => {
        if (containerRef.current) {
            let bounds: DOMRect = containerRef.current.getBoundingClientRect();
            setLeftFilterProps({
                left: bounds.left,
                width: (bounds.width / 2) - 10
            })

            if (leftContainerRef.current) {
                leftContainerRef.current.style.left = `${bounds.left}px`
                leftContainerRef.current.style.width = `${(bounds.width / 2) - 10}px`
            }
        }
    }

    const getDimensionUpdate = () => Math.floor(dimenstionUpdate)

    return (<ViewWrapper dimenstionChangeInformer={dimenstionChangeInformer}>
        <div className="search-container" ref={containerRef}>

            {/* Left Side */}
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
                            forceUpdate={leftFilterProps}
                            toStr={(val: any): string => {return `$${(val as number).toFixed(2)}`}}
                        />
                    </div>

                    <div style={{
                        padding: `10px`,
                        // border: `1px solid black`
                    }}>
                    <div className="input-label_">Lease Period</div>
                        <RangeSlider 
                            range={{start: 300, end: 1200}}
                            forceUpdate={leftFilterProps}
                            onChange={(new_ratio: number) => {
                                console.log(new_ratio)
                            }}
                            updateDimensionTrigger={getDimensionUpdate()}
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

            {/* Right Side */}
            <div className="right-side_">
                Right
            </div>

        </div>
    </ViewWrapper>)
}

export default SearchView