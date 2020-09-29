import React, {useEffect} from 'react'

/*
RangeSelector
@desc A form component that allows users to pick values within a
range.

@docs documentation/toolbox/form/RangeSelector.md
*/

const RangeSelector = () => {

  useEffect(() => {

    window.addEventListener(`mouseup`, endDrag)

  }, [])

  const initiateDrag = (e: React.MouseEvent) => {
    console.log(`Drag initiated.`)
    // console.log(e)
  }

  const endDrag = (e: any) => {
    console.log(e)
    console.log(`Drag ended.`)
  }

  return (<div className="form range-selector">

    {/* Anchors */}
    <div className="anchor left"></div>
    <div className="anchor right"></div>

    {/* Base */}
    <div className="slider-base"></div>

    {/* Sliders */}
    <div className="slider" onMouseDown={initiateDrag}></div>

  </div>)
}

export default RangeSelector