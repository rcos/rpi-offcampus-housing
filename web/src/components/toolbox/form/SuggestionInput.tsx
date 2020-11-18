import React, {useState, useRef, ChangeEvent, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface ISuggestionInput {

  // the function that determines what options to show after each input
  label: string
  onChange: (value: string) => void
  selectOnClick?: boolean
  suggestedList: string[]
  icon: any
}

const SuggestionInput = ({ label, icon, selectOnClick, suggestedList, onChange }: ISuggestionInput) => {

  const inputRef = useRef<HTMLInputElement>(null)
  const focusSpring = useSpring(0, {stiffness: 120, damping: 20})
  const suggestionFocusSpring = useSpring(0, {stiffness: 120, damping: 20})
  // const lineHeightTransform = useTransform(focusSpring, (x: number) => {
  //   let range = [40, 15]
  //   return `${range[1] + ((range[0] - range[1]) * (1-x))}px`
  // })
  const scaleTransform = useTransform(focusSpring, [0, 1], [1, 0.8], {clamp: false})
  const translateTrasnform = useTransform(focusSpring, [0, 1], [0, -6], {clamp: false})
  const dropdownAppearTransform = useTransform(suggestionFocusSpring, [0, 1], [0, 1])
  
  const listUpdateSpring = useSpring(0)
  const listHeightTransform = useTransform(listUpdateSpring, (x: number) => {
    return 30 * x
  })

  const [focused, setFocused] = useState(false)
  const [suggestionFocused, setSuggestionFocused] = useState(false)
  const [value, setValue] = useState<string>("")

  const focusInput = () => {
    setFocused(true)
    if (inputRef.current != null) {
      inputRef.current.focus ()
    }
  }

  const setInputValue = (new_value: string) => {
    if (selectOnClick && inputRef.current != null) {
      setValue(new_value)
    }
  }


  useEffect(() => {

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key == `Enter`) {
        setSuggestionFocused(false)
      }
    }

    window.addEventListener(`keypress`, handleEnter)

    const unsubFocusSpring = suggestionFocusSpring.onChange((x: number) => {
      if (x == 0) {
        listUpdateSpring.set(0)
      }
    })

    return () => {
      unsubFocusSpring()
      window.removeEventListener(`keypress`, handleEnter)
    }
  }, [])

  useEffect(() => {
    listUpdateSpring.set(suggestedList.length)
  }, [suggestedList])

  useEffect(() => {
    if (onChange) onChange(value)
  }, [value, onChange])

  const handleBlur = () => {
    if (value.length === 0) setFocused(false)
    setSuggestionFocused(false)
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
  
  useEffect(() => {

    if (suggestionFocused) suggestionFocusSpring.set(1)
    else suggestionFocusSpring.set(0)
  }, [suggestionFocused])

  return (<div className="input-field suggestion" onClick={focusInput}>
    <motion.div 
      style={{
        // lineHeight: lineHeightTransform,
        scale: scaleTransform,
        translateY: translateTrasnform
      }}
      className={`label-area ${icon ? 'icon' : ''} ${focused ? 'focused': ''}`}
      onClick={focusInput}>{label}</motion.div>
    {icon && <div className={`icon-area ${focused ? 'focused' : ''}`}>{icon}</div>}
    <div className={`input-area ${icon ? 'icon' : ''}`}>
      <input 
        onFocus={() => {setFocused(true); setSuggestionFocused(true);}} 
        onBlur={handleBlur}
        ref={inputRef} 
        spellCheck={false} 
        onChange={handleChange}
        type="text"
        value={value}
      />
    </div>
    

    <motion.div className="suggestion-box" 
      onClick={() => {focusInput()}}
      style={{
        opacity: dropdownAppearTransform,
        height: listHeightTransform,
        overflow: 'hidden'
      }}>
      {suggestedList.map((entry_: string, i: number) => (<div key={i} onClick={() => {
        focusInput();
        setInputValue(entry_) 
      }} className="entry">{entry_}</div>))}
    </motion.div>
  </div>)
}

export default SuggestionInput