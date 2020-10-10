import React, {useState, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

/*
Dropdown
@desc A selectable dropdown menu form component

@docs documentation/toolbox/form/Dropdown.md
*/

interface DropdownInterface {
  options: string[]
  onSelect?: (arg0: string) => void
}

const Dropdown = ({ options, onSelect }: DropdownInterface) => {

  const [selectedOption, setSelectedOption] = useState<number>(-1)
  const [showDropdown, setShowDropdown] = useState<boolean>(false)

  const dropdownSpring = useSpring(0, {stiffness: 100})
  const scaleTransform = useTransform(dropdownSpring, [0, 1], [0, 1], {clamp: false})

  // on mount
  useEffect(() => {

  }, [])

  useEffect(() => {
    if (showDropdown) dropdownSpring.set(1)
    else dropdownSpring.set(0)
  }, [showDropdown])

  useEffect(() => {
    if (onSelect && selectedOption >= 0 && selectedOption < options.length) {
      onSelect( options[selectedOption] );
    }
  }, [selectedOption])

  const selecteOption = (index: number): void => {
    setSelectedOption(index)
    setShowDropdown(false)
  }

  const getOption = (): string => {
    if (selectedOption == -1) return 'select option'
    return options[selectedOption]
  }
  
  const toggleDropdown = (): void => {
    setShowDropdown(!showDropdown)
  }

  return (<div className="form dropdown">
    <div className="label" onClick={toggleDropdown}>{getOption()}</div>
    <motion.div className="dropdown-list" style={{
      opacity: dropdownSpring,
      scaleY: scaleTransform
    }}>
      {
        options.map((option_: string, i: number) => (<div 
          key={i} 
          onClick={() => {selecteOption(i)}}
          className="option">{option_}</div>))
      }
    </motion.div>
  </div>)
}

export default Dropdown