import React, { useEffect, useRef, useState } from 'react'

import ViewWrapper from '../components/ViewWrapper'
import Navbar from '../components/Navbar'
import Button from '../components/toolbox/form/Button'
import {BsArrowLeft} from 'react-icons/bs'
import CommentBubble from '../components/toolbox/misc/CommentBubble'

const Property = () => {

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

  return (<div>
    
    {/* Property Address Line */}
    <div style={{
      fontWeight: 600,
      fontSize: '1.2rem'
    }}>
      212 15th St, Troy NY 12180
    </div>
    <div className="padded upper">
      <CommentBubble 
        header="Notice"
        message="1 Room available for sublet starting November 2020"
        action="Mode Info"
        onActionClick={() => {console.log(`Show more info!`)}}
      />
    </div>
  </div>)
}

export default Property