import { PRIORITY_NORMAL } from 'constants';
import { range } from 'lodash';
import React, {useState, useEffect, useRef} from 'react'

interface RangeSelectorInterface {
  initialLeft?: number
  initialRight?: number
  min: number
  max: number
  labelPrefix?: string
  labelPostfix?: string
  onSlide?: ((arg0: number, arg1: number) => void) | ((arg0: any, arg1: any) => void)
  onChange?: Function

  /* 
  Range that is based on a collection of values, rather
  than numbers.
  */
  rangeArray?: any[]
  valueTransform?: (arg0: any) => string
}

const clamp = (a: number, b: number, c: number) => {
  return Math.min(Math.max(a, b), c);
}

const RangeSelector = ({min, max, labelPrefix, 
  labelPostfix, onSlide, onChange,
rangeArray, valueTransform,
initialLeft, initialRight}: RangeSelectorInterface) => {

  const [minVal, setMinVal] = useState<number>(0)
  const [maxVal, setMaxVal] = useState<number>(0)
  const [leftVal, setLeftVal] = useState<number>(0.3)
  const [rightVal, setRightVal] = useState<number>(0.7)
  const [sliderWidth, setSliderWidth] = useState<number>(0)
  const [valueChange, setValueChange] = useState<number>(0)

  const sliderBoundRef = useRef<HTMLDivElement>(null);
  const leftPinRef = useRef<HTMLDivElement>(null);
  const rightPinRef = useRef<HTMLDivElement>(null);

  /**
  * @param state => leftVal: number -> The position (b/w 0 and 1) of the left pin
  * @param state => rightval: number -> The position (b/w 0 and 1) of the right pin
  * @desc Given leftVal and rightVal, the respective positions of the left and right
  * range positions, determine what the width of the area between the range
  * pin selectors are.
  * @return The width in pixels of the selected region
  */

  const getLeftBound = (): number => {
    return ((maxVal-minVal) * leftVal) + minVal
  }

  const getRightBound = (): number => {
    return ((maxVal-minVal) * (rightVal)) + minVal
  }

  const getLeftBoundStr = (): string => {
    if (rangeArray && valueTransform) {
      let i = Math.floor(clamp(leftVal, 0, 1) * rangeArray.length)
      if (i >= rangeArray.length) i = rangeArray.length-1

      if (i >= 0 && i < rangeArray.length) {
        return valueTransform(rangeArray[i])
      }
    }
    return `${labelPrefix? labelPrefix : ''}${getLeftBound().toFixed(2)}${labelPostfix? labelPostfix : ''}`
  }

  const getRightBoundStr = (): string => {
    if (rangeArray && valueTransform) {
      let i = Math.floor(clamp(rightVal, 0, 1) * rangeArray.length)
      if (i >= rangeArray.length) i = rangeArray.length-1

      if (i >= 0 && i < rangeArray.length) {
        return valueTransform(rangeArray[i])
      }
    }
    return `${labelPrefix? labelPrefix : ''}${getRightBound().toFixed(2)}${labelPostfix? labelPostfix : ''}`
  }

  const getRangeWidth = ():number => {
    let width_: number = sliderWidth;
    return (rightVal * width_) - (leftVal * width_);
  }

  useEffect(() => {

    // initialize the min and max of the range slider
    let actual_min = min ? min : 0
    let actual_max = max ? max : 1
    setMinVal(actual_min)
    setMaxVal(actual_max)

    // set the slider width
    if (sliderBoundRef.current == null) {
      console.error(`Range bound ref is null`)
    }
    else {
      console.log(`Range ref is no longer null`)
      let rect = sliderBoundRef.current.getBoundingClientRect()
      setSliderWidth(rect.width)
      setTimeout(() => {setSliderWidth(rect.width)}, 10)
      setTimeout(() => {setSliderWidth(rect.width)}, 100)
      setTimeout(() => {setSliderWidth(rect.width)}, 500)
      setTimeout(() => {setSliderWidth(rect.width)}, 1000)
      console.log(`Width: ${rect.width}`)
    }
  }, []);

  useEffect(() => {
    let actual_min = minVal
    let actual_max = maxVal
    if (initialLeft) {
      setLeftVal( clamp((initialLeft - actual_min)/(actual_max - actual_min), 0, 1) )
    }

    if (initialRight) {
      setRightVal( clamp((initialRight - actual_min)/(actual_max - actual_min), 0, 1) )
    }
  }, [initialLeft, initialRight])

  useEffect(() => {

  }, [minVal, maxVal])

  useEffect(() => {
    setMinVal(min)
    setMaxVal(max)
  }, [min, max])

  useEffect(() => {
    if (onSlide) {
      if (rangeArray && valueTransform) {
        onSlide(rangeArray[leftArrayIndex()], rangeArray[rightArrayIndex()])
      }
      else onSlide (getLeftBound(), getRightBound())
    }
  }, [leftVal, rightVal])

  useEffect(() => {
    if (onChange) {
      if (rangeArray && valueTransform) {
        onChange(rangeArray[leftArrayIndex()], rangeArray[rightArrayIndex()])
      }
      else onChange (getLeftBound(), getRightBound())
    }
  }, [valueChange])

  const leftArrayIndex = (): number => {
    if (rangeArray && valueTransform) {
      let i = Math.floor(clamp(leftVal, 0, 1) * rangeArray.length)
      return i >= rangeArray.length ? rangeArray.length - 1 : i
    }
    else return -1;
  }

  const rightArrayIndex = (): number => {
    if (rangeArray && valueTransform) {
      let i = Math.floor(clamp(rightVal, 0, 1) * rangeArray.length)
      return i >= rangeArray.length ? rangeArray.length - 1 : i
    }
    else return -1;
  }

  const initDragPin = (e: React.MouseEvent, pin_id: string): void => {
    e.preventDefault();
    
    // bind the deinitializer on mouse up
    if (pin_id == "left") {
      window.addEventListener("mouseup", deinitDragPin_Left)
      window.addEventListener("mousemove", moveDragPin_Left)
    }
    else if (pin_id == "right") {
      window.addEventListener("mouseup", deinitDragPin_Right)
      window.addEventListener("mousemove", moveDragPin_Right)
    }
  }

  const moveDragPin = (pin_id: string, e: MouseEvent): void => {
    setSliderWidth(sliderBoundRef.current!.getBoundingClientRect().width)
    // console.log(e.clientX)
    let rect = null;
    if (pin_id == "left") rect = leftPinRef.current?.getBoundingClientRect()
    if (pin_id == "right") rect = rightPinRef.current?.getBoundingClientRect()
    if (rect == null || sliderBoundRef.current == null) return;

    let sliderRect = sliderBoundRef.current?.getBoundingClientRect()
    let pos_ratio = ( e.clientX - sliderRect.left ) / sliderWidth
    // console.log(`${e.clientX} - ${sliderRect.left} / ${sliderWidth} = ${pos_ratio}`)

    // console.log(`Pos value: ${pos_ratio}`)
    if (pin_id == "left") setLeftVal( clamp(pos_ratio, 0, rightVal - 0.05) )
    if (pin_id == "right") setRightVal( clamp(pos_ratio, leftVal + 0.05, 1) )
  }

  const deinitDragPin = (pin_id: string, e: MouseEvent): void => {

    setValueChange(valueChange == 0 ? 1 : 0)

    if (pin_id == "left") {
      window.removeEventListener("mouseup", deinitDragPin_Left)
      window.removeEventListener("mousemove", moveDragPin_Left)
    }
    if (pin_id == "right") {
      window.removeEventListener("mouseup", deinitDragPin_Right)
      window.removeEventListener("mousemove", moveDragPin_Right)
    }
  }

  const deinitDragPin_Left = deinitDragPin.bind(null, "left")
  const deinitDragPin_Right = deinitDragPin.bind(null, "right")
  const moveDragPin_Left = moveDragPin.bind(null, "left")
  const moveDragPin_Right = moveDragPin.bind(null, "right")

  const getLeftValue = (): string => {
    if (rangeArray) {
      if (valueTransform && rangeArray.length > 0) return valueTransform(rangeArray[0])
      return "" + (rangeArray.length > 0 ? rangeArray[0] : 'null')
    }
    return "" + (labelPrefix ? labelPrefix : '') + minVal + (labelPostfix ? labelPostfix : '');
  }

  const getRightValue = (): string => {
    if (rangeArray) {
      if (valueTransform && rangeArray.length > 0) return valueTransform(rangeArray[rangeArray.length - 1])
      return "" + (rangeArray.length > 0 ? rangeArray[rangeArray.length-1] : 'null')
    }
    return "" + (labelPrefix ? labelPrefix : '') + maxVal + (labelPostfix ? labelPostfix : '');
  }

  return (<div className="form range-selector">
    <div>{getLeftValue()}</div>
    <div className="slider">

      <div className="slider-bar" ref={sliderBoundRef}/>

      <div className="range-region" style={{
          width: `${getRangeWidth()}px`,
          transform: `translateX(${leftVal * sliderWidth}px)`
        }}>
        <div className="range-slider-bar"></div>
        <div className="left-pin"
          ref={leftPinRef}
          onMouseDown={(e) => {initDragPin(e, "left")}}
        >
          <div className="value-label">{getLeftBoundStr()}</div>
        </div>
        <div className="right-pin"
          ref={rightPinRef}
          onMouseDown={(e) => {initDragPin(e, "right")}}
        >
          <div className="value-label">{getRightBoundStr()}</div>
        </div>
      </div>

    </div>
    <div>{getRightValue()}</div>
  </div>)
}

export default RangeSelector