import React, {useState, useRef, ChangeEvent, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface ISuggestionInput {

  // the function that determines what options to show after each input
  label: string
  onChange: (value: string) => string[]
  selectOnClick?: boolean
}

const SuggestionInput = ({ label, selectOnClick, onChange }: ISuggestionInput) => {

  const [focused, setFocused] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [suggestedValues, setSuggestedValues] = useState<string[]>([])

  const suggestSpring = useSpring(0)
  const suggestHeightSpring = useTransform(suggestSpring, (x: number) => x * 40)

  const handleOptionClick = (index: number) => {
    
    // default behavior is to select on click.
    if (selectOnClick == undefined || selectOnClick == true) {
      if (inputRef.current == null) return;
      inputRef.current.value = suggestedValues[index]
      setInputValue(suggestedValues[index])
    }
  }

  const forceFocus = () => {
    // force the inputRef to be focused
    if (inputRef.current == null) return;
    inputRef.current.focus()
  }

  useEffect(() => {
    // evaluate the new suggested values
    setSuggestedValues(onChange( inputValue ))
  }, [inputValue])

  useEffect(() => {
    suggestSpring.set(suggestedValues.length)
  }, [suggestedValues])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return(<div className="suggestion-input" onClick={forceFocus}>
    
    <div className={`suggested-label ${focused ? 'focused' : ''}`}
      onClick={forceFocus}
    >{label}</div>
    
    <input
    ref={inputRef}
    onFocus={() => { setFocused(true) }}
    onBlur={() => { if (inputValue.length == 0) setFocused(false); }}
    onChange={handleChange}
    className="suggested-input" />

    {
      suggestedValues.length > 0 &&
      <motion.div 
      style={{
        height: suggestHeightSpring
      }}
      className="suggestion-list">
      {suggestedValues.map((value: string, index: number) => {
        return (<div 
          key={index}
          onClick={() => {handleOptionClick(index)}}
          className="suggestion-entry">{value}</div>)
      })}
    </motion.div>
    }
  </div>)
}

export default SuggestionInput