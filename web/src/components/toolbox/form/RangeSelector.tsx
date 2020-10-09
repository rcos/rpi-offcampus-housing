import React, {useEffect, useState, useRef} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'
import { NumberLiteralType } from 'typescript'

/*
RangeSelector
@desc A form component that allows users to pick values within a
range.

@docs documentation/toolbox/form/RangeSelector.md
*/

const clamp = (a: number, b: number, c: number) => {
  return Math.min(Math.max(a, b), c)
}

interface RangeSelectorInterface {
  step_size?: number
}

const RangeSelector = ({ step_size }: RangeSelectorInterface) => {

  const [dragPos, setDragPos] = useState<number | null>(null)
  const [sliderWidth, setSliderWidth] = useState<number>(0)
  const mStepSize = step_size ? step_size : 0.05

  const leftAnchor = useRef<HTMLDivElement>(null)
  const rightAnchor = useRef<HTMLDivElement>(null)

  // the offset for the actual slider
  const [sliderOffset, setSliderOffset] = useState<number>(0)

  const slideSpring = useSpring(0)
  const slideTranslate = useTransform(slideSpring, (x) => {
    return x * sliderWidth
  })

  useEffect(() => {
    console.log(`Slider offset: ${sliderOffset}`)
    slideSpring.set(sliderOffset)
  }, [sliderOffset])

  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    // setup the width properties of the slider
    if (leftAnchor.current != null && rightAnchor.current != null) {
      let leftRect = leftAnchor.current.getBoundingClientRect();
      let rightRect = rightAnchor.current.getBoundingClientRect();

      let width_ = rightRect.x - leftRect.x
      setSliderWidth(width_)
    }

  }, [])

  useEffect(() => {
    console.log(`DragPos changed to ${dragPos}`)

    if (dragPos != null) {
      window.addEventListener('mousemove', trackDrag)
      window.addEventListener('mouseup', endDrag)
    }
  }, [dragPos])

  const initiateDrag = (e: React.MouseEvent) => {
    console.log(`Drag initiated.`)
    e.preventDefault();

    console.log(`Drag started at: ${e.clientX}`)
    setDragPos(e.clientX);
  }

  const trackDrag = (e: MouseEvent) => {
    // (1) get the difference from the start position

    console.log(sliderOffset)

    let delta = e.clientX - dragPos!
    let ratio = delta/sliderWidth
    if (Math.abs(ratio) >= mStepSize) {
      console.log(`MOVE !`)
      moveSlider(delta > 0)

    }
  }

  const endDrag = (e: MouseEvent) => {
    console.log(`Drag ended.`)

    window.removeEventListener('mousemove', trackDrag)
    window.removeEventListener('mouseup', endDrag)

    setDragPos(null);
  }

  const moveSlider = (forward: boolean) => {
    /*
    Move the slider by 1 step size, w
    */
   setSliderOffset(clamp(sliderOffset + mStepSize * (forward ? 1 : -1), 0 , 1))

  }

  return (<div className="form range-selector">

    {/* Anchors */}
    <div className="anchor left" ref={leftAnchor}></div>
    <div className="anchor right" ref={rightAnchor}></div>

    {/* Base */}
    <div className="slider-base"></div>

    {/* Sliders */}
    <motion.div className="slider" 
    style={{
      translateX: slideTranslate
    }}
    onMouseDown={initiateDrag} ref={sliderRef}>
    </motion.div>

  </div>)
}

export default RangeSelector