import React, {useRef, useState, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface InputInterface {
  label: string
  type?: string
  onChange?: (arg0: string) => void
  icon?: any
}

const Input = ({label, type, onChange, icon}: InputInterface) => {

  const inputRef = useRef<HTMLInputElement>(null)
  const focusSpring = useSpring(0, {stiffness: 120, damping: 20})
  // const lineHeightTransform = useTransform(focusSpring, (x: number) => {
  //   let range = [40, 15]
  //   return `${range[1] + ((range[0] - range[1]) * (1-x))}px`
  // })
  const scaleTransform = useTransform(focusSpring, [0, 1], [1, 0.8], {clamp: false})
  const translateTrasnform = useTransform(focusSpring, [0, 1], [0, -6], {clamp: false})

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
      focusSpring.set(1)
    }
    else focusSpring.set(0)
  }, [focused])

  return (<div className="input-field" onClick={focusInput}>
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
        onFocus={() => {setFocused(true)}} 
        onBlur={handleBlur}
        ref={inputRef} 
        spellCheck={false} 
        onChange={handleChange}
        type={getType()}
      />
    </div>
  </div>)
}

export default Input