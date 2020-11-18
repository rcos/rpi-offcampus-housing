import React, { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import {Line} from 'react-chartjs-2'
// @ts-ignore
// import ChartJSDraggablePlugin from 'chartjs-plugin-draggable'
// import ChartJSAnnotationPlugin from 'chartjs-plugin-annotation'

import PropertyAPI from '../API/PropertyAPI'
import {useGetPropertyLazyQuery} from '../API/queries/types/graphqlFragmentTypes'

import ViewWrapper from '../components/ViewWrapper'
import Button from '../components/toolbox/form/Button'
import {BsArrowLeft} from 'react-icons/bs'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import Minimizable from '../components/toolbox/misc/Minimizable'
import Progress from '../components/toolbox/misc/Progress'
import { useHistory, useLocation } from 'react-router-dom'

interface IProperty {
  property_id: string
}

const Property = ({ property_id }: IProperty) => {
  
  const location = useLocation()
  const history = useHistory()
  const [showBackButton, setShowBackButton] = useState<boolean>(false)
  const [propertyData, setPropertyData] = useState<{} | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [GetProperty, {data: _propertyData}] = useGetPropertyLazyQuery()

  useEffect(() => {
    if (_.has(location.state, 'fromSearchPage')) {
      setShowBackButton(true)
    }
  }, [location])


  const navigateBack = () => {
    
    // only navigate back if we came from the search page
    if (_.has(location.state, 'fromSearchPage')) {
      history.goBack()
    }
  }

  useEffect(() => {
    GetProperty({
      variables: {
        id: property_id,
        withLandlord: false,
        withReviews: false,
        reviewCount: 0,
        reviewOffset: 0
      }
    })
  }, [property_id])

  useEffect(() => {

    if (_propertyData && _propertyData.getProperty.data) {
      if (_propertyData.getProperty.success && _propertyData.getProperty.data) {
        setPropertyData(
          _propertyData.getProperty.data
        )
        setLoading(false)
      }
      else {
        
        console.error(`Property API returned success = false`)
        console.error(_propertyData.getProperty.error)
        setLoading(false)
        history.push('/search')
      }
    }

  }, [_propertyData])

  /*
  useEffect(() => {
    
    // get the property data
    PropertyAPI.property(property_id)
    .then(res => {
      if (res.data.success) {
        setPropertyData(res.data.property_data)
        setLoading(false)
      }
      else {
        console.error(`Property API returned success = false`)
        console.error(res.data.error)
        setLoading(false)
        history.push('/search')
      }
    })
    .catch(err => {
      console.error(`Error fetching property data for id ${property_id}`)
      history.push('/search')
    })

  }, [property_id, history])
  */

  return (<ViewWrapper>
    
    
    <div style={{display: 'flex'}}>

      <div
        style={{width: "40%", minWidth: "40%"}}
      ><PropertyPageLeftSide
        showBackButton={showBackButton}
        navBack={navigateBack}
      /></div>
      <div
        style={{width: "calc(60% - 20px)", marginLeft: '20px'}}
      ><PropertyPageRightSide 
        propertyData={propertyData}
        loading={loading}
      /></div>

    </div>

  </ViewWrapper>)
}

interface IPropertyPageLeftSide {
  navBack: Function
  showBackButton: boolean
}
const PropertyPageLeftSide = ({
  navBack,
  showBackButton
}: IPropertyPageLeftSide) => {

  const [propertyImages, setPropertyImages] = useState<string[]>([""])
  const [propertyImageIndex, setPropertyImageIndex] = useState<number>(-1)

  const imagePreviewHolderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    // populate placeholder images
    let temp_imgs = []
    for (let i = 0; i < 5; ++i) temp_imgs.push("https://specials-images.forbesimg.com/imageserve/1026205392/960x0.jpg?fit=scale")
    setPropertyImages(temp_imgs)
    setPropertyImageIndex(0)

    window.addEventListener('resize', handleResizeCalculations)
  }, [])

  const handleResizeCalculations = () => {
    // add functions that need to be recalculated on resize here ...
  }

  // 
  const calculateImagePreviewHeight = ():string => {
    if (imagePreviewHolderRef.current == null) return '0px'

    let bounds_ = imagePreviewHolderRef.current.getBoundingClientRect()
    return `${bounds_.width}px`
  }

  const getFocusedImage = ():string => {
    if (propertyImageIndex === -1|| propertyImageIndex >= propertyImages.length) return ''
    return propertyImages[propertyImageIndex]
  }

  const changePreviewImage = (index: number): void => {
    setPropertyImageIndex(index)
  }

  return (<div>
    {showBackButton && <div style={{width: "200px", marginBottom: '20px'}}>
       <Button 
        text="Back to Search"
        icon={<BsArrowLeft />}
        background="#e3e3e3"
        border="#e3e3e3"
        iconLocation="left"
        onClick={() => navBack()}
      />
    </div>}
    
    {/* Active Image View */}
    <div 
    ref={imagePreviewHolderRef}
    className="image-preview-holder"
    style={{
      marginBottom: '20px',
      width: '100%',
      height: calculateImagePreviewHeight (),
      backgroundImage: `url('${getFocusedImage()}')`
    }} />

    {/* Image preview tabs */}
    <div style={{display: 'flex'}}>
      {propertyImages.map((image_url: string, index: number) => {
        return (<div key={index} 
          style={{
            backgroundImage: `url('${ image_url }')`,
            backgroundSize: '100% 100%'
          }}
          onClick={() => changePreviewImage(index)}
          className={`image-preview-thumbnail ${index === propertyImageIndex ? 'active' : ''}`} />)
      })}
    </div>

    {/* Owned By Area */}
    <div style={{ display: 'flex' }} className="padded upper">
      <div style={{
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '0.8rem', 
        marginRight: '8px'
      }}>Owned By</div>
      <div style={{fontSize: '0.9rem'}}>John Meyer</div>
    </div>
  </div>)
}

interface IPropertyPageRightSide {
  propertyData: {} | null
  loading: boolean
}
const PropertyPageRightSide = ({propertyData, loading}: IPropertyPageRightSide) => {

  const detailsRef = useRef<HTMLDivElement>(null)
  const [detailViewHeight, setDetailViewHeight] = useState<number>(0)

  useEffect(() => {
    calculateDetailViewHeight ()
    setTimeout(() => {calculateDetailViewHeight ()}, 10)
    setTimeout(() => {calculateDetailViewHeight ()}, 100)
    setTimeout(() => {calculateDetailViewHeight ()}, 500)
    setTimeout(() => {calculateDetailViewHeight ()}, 1000)

    window.addEventListener('resize', onResizeFunction)
  })

  const onResizeFunction = () => {
    calculateDetailViewHeight() 
  }

  const calculateDetailViewHeight = () => {
    if (detailsRef.current != null) {
      let bounds_ = detailsRef.current.getBoundingClientRect()
      let window_height = window.innerHeight

      setDetailViewHeight(window_height - bounds_.top - 20)
    }
  }

  const getAddress = (): string => {
    if (!propertyData) return "<placeholder>"
    let location = (propertyData as any).location
    return location
  }

  return (<div>
    
    {/* Property Address Line */}
    <div style={{
      fontWeight: 600,
      fontSize: '1.2rem',
      marginBottom: '30px'
    }}>
      {loading && <div style={{width: `70%`}}><div className="block-loading" /></div>}
      {!loading && getAddress()}
    </div>
    <div
      ref={detailsRef}
      style={{
        overflowY: 'scroll',
        height: `${detailViewHeight}px`}}>
      <div>
        <CommentBubble 
          header="Notice"
          message="1 Room available for sublet starting November 2020"
          action="More Info"
          onActionClick={() => {console.log(`Show more info!`)}}
        />
      </div>
      <div className="padded upper">
        
        <Minimizable title="Property Description">
          <div>
            <div className="property-desc-entry">
              <div className="label">Rooms</div>
              <div className="desc">3 Bedrooms / 2 Bath</div>
            </div>
            
            <div className="property-desc-entry">
              <div className="label">Size</div>
              <div className="desc">2000 Sq. ft.</div>
            </div>
            
            <div className="property-desc-entry">
              <div className="label">Distance</div>
              <div className="desc">10 miles from campus</div>
            </div>
            
            <div className="property-desc-entry">
              <div className="label">Price</div>
              <div className="desc">$1029/room/mo</div>
            </div>

            <div className="property-desc-entry">
              <div className="label">Min. Lease Period</div>
              <div className="desc">6 mo.</div>
            </div>
          </div>
        </Minimizable>
        <Minimizable title="Property Ratings By Students">
          <div style={{display: 'flex'}}>
            <div style={{width: '36%', minWidth: '36%'}}>

              {/* Total Percentage */}
              <div style={{display: 'flex', marginBottom: '14px'}}>
                <div style={{
                  color: '#4AF271',
                  fontSize: '2rem',
                  fontWeight: 100,
                  marginRight: '7px',
                }}>76%</div>
                <div>from 36 students</div>
              </div>

              {/* Category Ratings */}
              <Rating />
              <Rating />
              <Rating />
              <Rating />
              <Rating />
            </div>
            <div style={{flexGrow: 1, marginLeft: '20px'}}>
              <div className='graph-holder'>
                
                {/* ChartJS Chart */}
                <Line 
                    data={{
                      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                      datasets: [
                        {
                        label: 'Property Ratings Over Time',
                        backgroundColor: 'rgba(224, 119, 125, 0.3)',
                        borderColor: 'rgba(224, 119, 125,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [65, 59, 80, 81, 56, 55, 40]
                        }
                      ]
                    }}
                    options={{
                      maintainAspectRatio: true,
                      title: {
                        text: "Property Ratings Over Time",
                        display: true,
                        position: 'top'
                      },
                      legend: { // ChartJSDraggablePlugin
                        display: false
                      },
                      scales: {
                        yAxes: [{
                          ticks: {
                            suggestedMax: 100,
                            suggestedMin: 0,
                            stepSize: 20
                          }
                        }],
                        xAxes: [{
                          gridLines: {
                            color: `white`
                          }
                        }]
                      },

                      annotation: {
                        annotations: [{
                          type: 'line',
                          mode: 'horizontal',
                          scaleID: 'y-axis-0',
                          value: 25,

                          // @ts-ignore
                          draggable: true,
                          // @ts-ignore
                          onDragStart: (e) => {
                            console.log(`Drag started`)
                          },
                          // @ts-ignore
                          onDrag: (e) => {
                            console.log(`Dragged`)
                          },
                        }]
                      },

                      plugins: {
                        annotation: { // ChartJSAnnotationPlugin
                          drawTime: 'afterDatasetsDraw',
                          events: ['click'],
                          dblClickSpeed: 350,
                          annotations: [{
                            drawTime: 'afterDraw',
                            id: 'a-line-1',
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y-axis-0',
                            value: '25',
                            borderColor: 'red',
                            borderWidth: 2,
                            onClick: function(e: any) {
                              console.log(`Annotation Plugin: onClick callback`)
                            }
                          }]
                        }
                      }
                    }}
                  />

              </div>
            </div>
          </div>
        </Minimizable>
        <Minimizable title="Landlord Ratings By Students">
          <div style={{display: 'flex'}}>
            <div style={{width: '36%', minWidth: '36%'}}>

              {/* Total Percentage */}
              <div style={{display: 'flex', marginBottom: '14px'}}>
                <div style={{
                  color: '#4AF271',
                  fontSize: '2rem',
                  fontWeight: 100,
                  marginRight: '7px'
                }}>76%</div>
                <div>from 36 students</div>
              </div>

              {/* Category Ratings */}
              <Rating />
              <Rating />
              <Rating />
              <Rating />
              <Rating />
            </div>
            <div style={{flexGrow: 1, marginLeft: '20px'}}>
              <div className='graph-holder'>
                
                {/* ChartJS Line */}
                <Line 
                    data={{
                      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                      datasets: [
                        {
                        label: 'Landlord Ratings Over Time',
                        backgroundColor: 'rgba(224, 119, 125, 0.3)',
                        borderColor: 'rgba(224, 119, 125,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [65, 59, 80, 81, 56, 55, 40]
                        }
                      ]
                    }}
                    options={{ 
                      maintainAspectRatio: true,
                      title: {
                        text: "Landlord Ratings Over Time",
                        display: true,
                        position: 'top'
                      },
                      legend: {
                        display: false
                      },
                      scales: {
                        yAxes: [{
                          ticks: {
                            suggestedMax: 100,
                            suggestedMin: 0
                          }
                        }]
                      }
                    }}
                  />

              </div>
            </div>
          </div>
        </Minimizable>
      </div>
    </div>
  </div>)
}

const Rating = () => {

  return (<div style={{marginBottom: '10px'}}>
    <div style={{
      fontSize: '0.8rem',
      marginBottom: '5px'
    }}>Category Name</div>
    <div style={{display: 'flex'}}>
      <div
        style={{flexGrow: 1}}
      ><Progress value={0.8} /></div>
      <div style={{
        width: '25px',
        minWidth: '25px',
        fontSize: '0.7rem',
        transform: `translateY(-2px)`,
        marginLeft: '10px'
      }}>80%</div>
    </div>
  </div>)
}

export default Property