import React, { useEffect, useRef, useState } from 'react'
import {HiOutlineChevronUp, HiOutlineChevronDown} from 'react-icons/hi'

interface CounterProps {
    onChange?: (arg0: number) => void
    restrictions?: ((arg0: number) => boolean)[]
    incrementBy?: number
}

export const positiveOnly = (val: number) => val > 0
export const negativeOnly = (val: number) => val < 0

interface InclusiveOption {
    inclusive: boolean
}
export const maxVal = (max_: number, {inclusive}: InclusiveOption = {inclusive: false}) => (val: number) => (inclusive ? val <= max_ : val < max_)
export const minval = (min_: number, {inclusive}: InclusiveOption = {inclusive: false}) => (val: number) =>  (inclusive ? val >= min_ : val > min_)

const Counter = ({onChange, incrementBy, restrictions}: CounterProps) => {

    const [value, setValue] = useState<number>(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = value.toString()
        }
    }, [inputRef])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = value.toString()
        }
        if (onChange) onChange(value)
    }, [value])

    const _incrementBy_ = () => incrementBy ? incrementBy : 1
    const increaseValue = () => failsRestrictions(value + _incrementBy_()) ? '' : setValue(value + _incrementBy_())
    const decreaseValue = () => failsRestrictions(value - _incrementBy_()) ? '' : setValue(value - _incrementBy_())

    const failsRestrictions = (val: number): boolean => {
        if (!restrictions) return false;
        for (let i = 0; i < restrictions.length; ++i) {
            if (!restrictions[i](val)) return true;
        }
        return false;
    }
    const updateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        // filter out non numbers first
        let allowed = "0123456789"
        let val_:string = e.target.value
        if (val_.length > 0) {
            if (!allowed.includes(val_.charAt( val_.length - 1 ))
            || failsRestrictions(parseInt(val_))) {
                val_ = val_.substring(0, val_.length - 1)

                if (inputRef.current) {
                    inputRef.current.value = val_
                }
                return;
            }
        }

        if (val_ == "") val_ = "0"
        let new_value = parseInt(val_)
        setValue(new_value)
    }

    return (<div className="form-counter">
        <input ref={inputRef} onChange={updateValue} />
        <div className="value-ctrl increase" onClick={increaseValue}><HiOutlineChevronUp /></div>
        <div className="value-ctrl decrease" onClick={decreaseValue}><HiOutlineChevronDown /></div>
    </div>)
}

export default Counter