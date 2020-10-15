import React, {useRef, useState, useEffect} from 'react'
import {motion} from 'framer-motion'

interface InputInterface {
  label: string
  type?: string
  onChange?: (arg0: string) => void
}

const Input = ({label, type, onChange}: InputInterface) => {

  const inputRef = useRef<HTMLInputElement>(null)

  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState<string>("")

  const focusInput = () => {
    setFocused(true)
    if (inputRef.current != null) {
      inputRef.current.focus ()
    }
  }

  useEffect(() => {
    if (onChange) onChange(value)
  }, [value, onChange])

  const handleBlur = () => {
    if (value.length === 0) setFocused(false)
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
    }
  }, [focused])

  return (<div className="input-field" onClick={focusInput}>
    <motion.div 
      className={`label-area ${focused ? 'focused': ''}`}
      onClick={focusInput}>{label}</motion.div>
    <input 
      onFocus={() => {setFocused(true)}} 
      onBlur={handleBlur}
      ref={inputRef} 
      spellCheck={false} 
      onChange={handleChange}
      type={getType()}
    />
  </div>)
}

export default Input