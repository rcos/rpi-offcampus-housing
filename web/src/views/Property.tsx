import React, { useEffect, useRef, useState } from 'react'

import ViewWrapper from '../components/ViewWrapper'
import Navbar from '../components/Navbar'
import Button from '../components/toolbox/form/Button'
import {BsArrowLeft} from 'react-icons/bs'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import Minimizable from '../components/toolbox/misc/Minimizable'
import Progress from '../components/toolbox/misc/Progress'

interface IProperty {
  property_id: string
}

const Property = ({ property_id }: IProperty) => {

  useEffect(() => {
    console.log(`Prop ID: ${property_id}`)
  }, [property_id])

  return (<ViewWrapper>
    <Navbar />
    
    
    <div style={{display: 'flex'}}>

      <div
        style={{width: "40%", minWidth: "40%"}}
      ><PropertyPageLeftSide /></div>
      <div
        style={{flexGrow: 1, marginLeft: '20px'}}
      ><PropertyPageRightSide /></div>

    </div>

  </ViewWrapper>)
}

const PropertyPageLeftSide = () => {

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
    <div style={{width: "170px", marginBottom: '20px'}}>
      <Button 
        text="Back to Search"
        icon={<BsArrowLeft />}
        background="white"
        border="black"
        iconLocation="left"
      />
    </div>
    
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
          className={`image-preview-thumbnail ${index == propertyImageIndex ? 'active' : ''}`} />)
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

const PropertyPageRightSide = () => {

  const detailsRef = useRef<HTMLDivElement>(null)
  const [detailViewHeight, setDetailViewHeight] = useState<number>(0)

  useEffect(() => {
    calculateDetailViewHeight ()
    setTimeout(() => {calculateDetailViewHeight ()}, 10)
    setTimeout(() => {calculateDetailViewHeight ()}, 100)
    setTimeout(() => {calculateDetailViewHeight ()}, 500)
    setTimeout(() => {calculateDetailViewHeight ()}, 1000)

    window.addEventListener('resize', onResizeFunction)
  }, [])

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

  return (<div>
    
    {/* Property Address Line */}
    <div style={{
      fontWeight: 600,
      fontSize: '1.2rem',
      marginBottom: '30px'
    }}>
      212 15th St, Troy NY 12180
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
                INTERACTABLE GRAPH GOES HERE
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
                INTERACTABLE GRAPH GOES HERE
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