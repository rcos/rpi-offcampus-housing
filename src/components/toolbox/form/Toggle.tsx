import React, {useState, useEffect, useRef} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

/*
Toggle
@desc A form component that is a boolean toggle. It's either on or off

@docs documentation/toolbox/form/Toggle.md
*/

interface ToggleInterface {
  initialValue?: boolean
  onLabel?: string
  offLabel?: string
  onToggle?: (arg0: boolean) => void
}

const Toggle = ({ initialValue, onLabel, offLabel, onToggle }: ToggleInterface ) => {

  const onLabelRef = useRef<HTMLElement>(null)
  const offLabelRef = useRef<HTMLElement>(null)
  const [maxLabelWidth, setMaxLabelWidth] = useState<number>(500)
  const [active, setActive] = useState<boolean>(false)
  const toggleSpring = useSpring(0, { stiffness: 120, damping: 5 })
  const toggleTranslateX = useTransform(toggleSpring, [0, 1], [0, 20], {clamp: true})

  const activeLabelTransform = useTransform(toggleSpring, [0, 1], [0, 1], {clamp: true})
  const inactiveLabelTransform = useTransform(toggleSpring, [0, 1], [1, 0], {clamp: true})

  useEffect(() => {

    // on mount, set the initial value
    if (initialValue) setActive(initialValue)

    // calculate the max length of the labels
    if (onLabelRef.current != null && offLabelRef.current != null) {
      let max_width = 0
      max_width = Math.max(max_width, onLabelRef.current!.offsetWidth)
      max_width = Math.max(max_width, offLabelRef.current!.offsetWidth)
      console.log(max_width)
      setMaxLabelWidth(max_width);
    }

  }, []);

  useEffect(() => {

    // set the toggle animation whenever active value changes
    if (active) toggleSpring.set(1)
    else toggleSpring.set(0)

    // trigger the callback function
    if (onToggle) onToggle(active)

  }, [active]);

  const handleToggle = () => {
    setActive(!active)
  }

  return (<div className="form toggle-container">
    <div className="toggle" onClick={handleToggle}>
    <motion.div 
      className="toggle-slider" 
      onClick={handleToggle}
      style={{
        translateX: toggleTranslateX
      }}  
    ></motion.div>
  </div>
  <div className="label" style={{ width: `${maxLabelWidth + 2}px` }}>

    <motion.span style={{ opacity: activeLabelTransform }} ref={onLabelRef}>{onLabel && onLabel}</motion.span>
    <motion.span style={{ opacity: inactiveLabelTransform }} ref={offLabelRef}>{offLabel && offLabel}</motion.span>

  </div>
  </div>)
}

export default Toggle