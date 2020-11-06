import React, {useState, useEffect, useRef} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'
import {useOutsideAlerter} from '../../helpers/OutsideRef'
/*
Dropdown
@desc A selectable dropdown menu form component

@docs documentation/toolbox/form/Dropdown.md
*/

interface DropdownInterface {
  options: any[]
  onSelect?: (index: number) => void
  selectedIndex?: number
}

const Dropdown = ({ options, onSelect, selectedIndex }: DropdownInterface) => {

  const handleOutsideDropdownClick = (e: MouseEvent, showDropdown: boolean) => {
    console.log(`handle outside click (${showDropdown})`)
    if (showDropdown) setShowDropdown(false)
  }


  const [selectedOption, setSelectedOption] = useState<number>(-1)
  const [showDropdown, setShowDropdown] = useState<boolean>(false)

  const dropdownSpring = useSpring(0, {stiffness: 100})
  const scaleTransform = useTransform(dropdownSpring, [0, 1], [0, 1], {clamp: false})


  const dropdownRef = useRef<HTMLDivElement>(null)
  useOutsideAlerter(dropdownRef, handleOutsideDropdownClick, showDropdown)

  // on mount
  useEffect(() => {

  }, [])

  useEffect(() => {
    console.log(`SELECTED INDEX: ${selectedIndex}`)
    if (selectedIndex !== undefined) setSelectedOption(selectedIndex)
  }, [selectedIndex])

  useEffect(() => {
    // useOutsideAlerter(dropdownRef, handleOutsideDropdownClick)
    if (showDropdown) {
      // update the animation spring
      dropdownSpring.set(1)
    }
    else dropdownSpring.set(0)
  }, [showDropdown, dropdownSpring])

  useEffect(() => {
    if (onSelect && selectedOption >= 0 && selectedOption < options.length) {
      onSelect( selectedOption );
    }
  }, [selectedOption, onSelect, options])

  const selecteOption = (index: number): void => {
    console.log(`Option Selected: ${index}`)
    setSelectedOption(index)
    setShowDropdown(false)
  }

  const getOption = (): string => {
    if (selectedOption === -1) return 'select option'
    return options[selectedOption]
  }
  
  const toggleDropdown = (): void => {
    console.log(`toggle triggered`)
    
    let v_ = dropdownSpring.get()
    if (v_ === 0 || v_ === 1) setShowDropdown(!showDropdown)
  }

  return (<div className="form dropdown">
    <div className="label" onClick={toggleDropdown}>{getOption()}</div>
    <motion.div 
      ref={dropdownRef}
      className="dropdown-list" style={{
      opacity: dropdownSpring,
      scaleY: scaleTransform
    }}>
      {
        options.map((option_: any, i: number) => (<div 
          key={i} 
          onClick={() => {selecteOption(i)}}
          className={`option ${i === selectedIndex? 'selected' : ''}`}>{option_}</div>))
      }
    </motion.div>
  </div>)
}

export default Dropdown