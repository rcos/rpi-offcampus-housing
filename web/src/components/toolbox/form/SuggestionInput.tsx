import React, {useRef, useEffect, useState} from 'react'
import {useSpring, motion, useTransform} from 'framer-motion'

interface IDropdown {
  label: string
  type?: string
  onChange?: (arg0: string) => void
  inferenceFn?: (arg0: string) => {[key: string]: string[]}
  icon?: any
  validators?: ((arg0: string) => boolean) []
}

const Dropdown = ({label, type, onChange, inferenceFn, icon, validators}: IDropdown) => {

  const highlightRef = useRef<number>(-1)
  const [highlightIndex, setHightlightIndex] = useState<number>(-1)
  const [inferences, setInferences] = useState<{[key: string]: string[]}>({})
  const dropdownSpring = useSpring(0)
  const dropdownOffset = useTransform(dropdownSpring, [0, 1], [-5, 0])
  const dropdownVisibility = useTransform(dropdownSpring, (x: number) => {
    if (x <= 0.1) return `hidden`;
    return `visible`
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const focusSpring = useSpring(0, {stiffness: 120, damping: 20})

  const [optionClickControl, setOptionClickControl] = useState<boolean>(false)
  const [dropdownFocused, setDropdownFocused] = useState<boolean>(false)
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState<string>("")

  const focusInput = () => {
    console.log(`Focusing.`)
    setFocused(true)
    if (inputRef.current != null) {
      inputRef.current.focus ()
    }
  }

  useEffect(() => {

    console.log(`Dropdown Focused: ${dropdownFocused}`)
    if (dropdownFocused) dropdownSpring.set(1)
    else {
      dropdownSpring.set(0)
    }
    setHightlightIndex(-1)
    if (highlightRef.current) highlightRef.current = -1
  }, [dropdownFocused])

  const handleInferenceSelect = (e: any) => {
    if (e.key == "ArrowDown") {
      e.preventDefault ()
      let n_: number = Math.min(inferenceCount() - 1, highlightRef.current + 1)
      setHightlightIndex( n_ )
      highlightRef.current = n_
    }
    else if (e.key == "ArrowUp") {
      e.preventDefault ()
      let n_: number = Math.max(0, highlightRef.current - 1)
      setHightlightIndex( n_ )
      highlightRef.current = n_
    }
  }
  
  const selectValue = (value_: string) => {
    setValue(value_)
    if (inputRef.current) inputRef.current.value = value_
    if (inputRef.current) inputRef.current.blur()
  }

  const selectIndex = (index: number) => {
    let value_: string | null = getInferenceValue(index)
    if (value_ != null) {
      setValue(value_)
      if (inputRef.current) inputRef.current.value = value_
    }

    if (inputRef.current) inputRef.current.blur()
  }

  const selectHighlighted = () => {
    selectIndex(highlightRef.current)
  }

  const handleOptionSelect = (e: any) => {
    if (e.key == "Enter") {
      selectHighlighted ()
    }
  }

  useEffect(() => {

    setHightlightIndex(-1)
    if (inferenceCount() == 0 || optionClickControl) {
      setDropdownFocused(false)
      if (optionClickControl) setOptionClickControl(false)
    }
    else setDropdownFocused(true)

    // bind keypress function
    window.addEventListener('keydown', handleInferenceSelect)
    window.addEventListener('keypress', handleOptionSelect)
    return () => {
      window.removeEventListener('keydown', handleInferenceSelect)
      window.removeEventListener('keypress', handleOptionSelect)
    }
  }, [inferences])

  useEffect(() => {
    if (onChange) onChange(value)
    if (inferenceFn) {
      if (value.length == 0) setDropdownFocused(false)
      else {
        setInferences(inferenceFn(value))
      }
    }
  }, [value])

  const handleBlur = () => {
    console.log(`Blurred!`)
    if (value.length === 0) setFocused(false)
    setDropdownFocused(false)
  }

  const getType = () => {
    return type && ["text", "password"].includes(type) ? type : "text"
  }

  const handleChange = (e: any) => {
    setValue(e.target.value)
  }

  useEffect(() => {
    if (focused) {
      if (inputRef.current != null) inputRef.current.focus ()
      focusSpring.set(1)
    }
    else focusSpring.set(0)
  }, [focused])

  const inferenceCount = (): number => {
    let c_ = 0;
    for (let i = 0; i < Object.keys(inferences).length; ++i) {
      c_ += inferences[ Object.keys(inferences)[i] ].length;
    }
    return c_;
  }

  const getInferenceValue = (index: number): string | null => {
    if(index < 0) return null;
    let c_ = 0;
    for (let i = 0; i < Object.keys(inferences).length; ++i) {
      for (let j = 0; j < inferences[Object.keys(inferences)[i]].length; ++j) {
        if (c_ == index) {
          return inferences[Object.keys(inferences)[i]][j]
        }
        c_ += 1;
      }
    }
    return null;
  }

  const showOptions = () => {

    let c_ = 0
    let options: any[] = []

    for (let i = 0; i < Object.keys(inferences).length; ++i) {

      let _options_ = inferences[Object.keys(inferences)[i]]
      if (_options_.length > 0) {

        let o_: any[] = []
        o_.push(<div className="section" key={-1} onClick={() => {}/*focusInput*/}>{Object.keys(inferences)[i]}</div>)

        // options
        for (let j = 0; j < _options_.length; ++j) {
          o_.push(<div className={`option ${c_ == highlightIndex? 'hover' :  ''}`} key={j}
            onClick={() => {
              setOptionClickControl(true)
              selectValue(_options_[j])
              // focusInput()
            }}
          >{_options_[j]}</div>)

          // update the counter
          ++c_;
        }

        options.push(<div key={i} onClick={() => {}/*focusInput*/}>{o_}</div>)
      }

    }

    return options
  }

  const handleFocus = () => {
    setFocused(true)
    if (inferenceCount() > 0) {
      setDropdownFocused(true)
    }
  }

  return (<div style={{position: 'relative'}} className="dropdown-wrapper">
      <div className={`input-field ${dropdownFocused ? `focused`: ''}`} onClick={focusInput}>
      <div 
        className={`label-area ${icon ? 'icon' : ''} ${focused ? 'focused': ''}`}
        onClick={focusInput}>{label}</div>
      {icon && <div className={`icon-area ${focused ? 'focused' : ''}`}>{icon}</div>}
      <div className={`input-area ${icon ? 'icon' : ''}`}>
        <input 
          onFocus={handleFocus} 
          onBlur={handleBlur}
          ref={inputRef} 
          spellCheck={false} 
          onChange={handleChange}
          type={getType()}
        />
      </div>
    </div>

    {/* Dropdown */}
    <motion.div className="dropdown" style={{
        opacity: dropdownSpring,
        translateY: dropdownOffset,
        visibility: dropdownVisibility
      }}>

        {showOptions ()}
      </motion.div>
  </div>)
}

export default Dropdown