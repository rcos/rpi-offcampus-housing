import React, {useRef, useState, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface InputInterface {
  label: string
  type?: string
  onChange?: (arg0: string) => void
  icon?: any
  validators?: ((arg0: string) => boolean) []
  inputFilters?: ((arg0: string) => (string | null))[]
  initial?: string
  autoFocus?: boolean
}

const Input = ({label, initial, type, autoFocus, onChange, icon, validators, inputFilters}: InputInterface) => {

  const inputRef = useRef<HTMLInputElement>(null)
  const focusSpring = useSpring(0, {stiffness: 120, damping: 20})
  // const lineHeightTransform = useTransform(focusSpring, (x: number) => {
  //   let range = [40, 15]
  //   return `${range[1] + ((range[0] - range[1]) * (1-x))}px`
  // })
  const scaleTransform = useTransform(focusSpring, [0, 1], [1, 0.8], {clamp: false})
  const translateTrasnform = useTransform(focusSpring, [0, 1], [0, -6], {clamp: false})

  const [setInitial, setSetInitial] = useState<boolean>(true)
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState<string>("")

  const focusInput = () => {
    setFocused(true)
    if (inputRef.current != null) {
      inputRef.current.focus ()
    }
  }

  // set initial value on load
  useEffect(() => {

    if (initial) {
      setValue(initial)
    }

  }, [])

  useEffect(() => {

    if (inputRef.current) {

      // set the initial
      if (initial && setInitial && initial != "") {
        inputRef.current.value = initial
        setFocused(true)
        setSetInitial(false)
      }

      // set autoFocus
      if (autoFocus) {
        inputRef.current.focus()
        setFocused(true)
      }
    }
  }, [inputRef])

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
    if (inputFilters) {
      let result_: string | null = e.target.value
      let i = 0;
      while (result_ != null && i < inputFilters.length) {
        result_ = inputFilters[i](result_)
        ++i;
      }

      if (result_ == null) e.target.value = value
      else setValue(e.target.value)
    }
    else setValue(e.target.value)
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

// Custom Filters
export const numbersOnly = (val: string): string | null => {
  const _g = "0123456789"
  for (let i = 0; i < val.length; ++i) {
    if (val.charAt(i) == ' ' || _g.includes( `${val.charAt(i)}` )) continue;
    else return null;
  }
  return val;
}

export const alnumOnly = (val: string): string | null => {
  if (val == "") return val;
  if (val.replaceAll(' ', '').match(/^[A-Za-z0-9]+$/i)) return val;
  return null;
}

export const noSpaces = (val: string): string | null => {
  if (val.includes(' ')) return null;
  return val;
}

export const maxLen = (max_len: number): (val:string) => string | null => {
  return (val: string): string | null => {
    if (val.length > max_len) return null;
    return val;
  }
}

export const $or = (fn_1: (arg0: string) => (string | null), fn_2: (arg0: string) => (string | null) )
: (arg0: string) => (string | null) => {
  return (new_val: string) => {
    if (fn_1(new_val) != null) return new_val;
    if (fn_2(new_val) != null) return new_val;
    return null;
  }
}

export const $and = (fn_1: (arg0: string) => (string | null), fn_2: (arg0: string) => (string | null) )
: (arg0: string) => (string | null) => {
  return (new_val: string) => {
    if (fn_1(new_val) == null) return null;
    if (fn_2(new_val) == null) return null;
    return new_val;
  }
}