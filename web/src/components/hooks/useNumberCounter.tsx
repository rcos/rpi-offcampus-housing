import React, {useRef, useState, useEffect} from 'react'

interface CounterProps {
    value: number
    duration?: number
}

export const useNumberCounter = ({
    value, duration
}: CounterProps) => {

    const valueRef = useRef<number>(0)
    const [valueState, setValueState] = useState<number>(valueRef.current)
    const UPDATE_TIME = 150

    const getDuration = () => duration ? duration : 1500 // in ms
    const getTimeStep = () => value / (getDuration() / UPDATE_TIME)
    useEffect(() => {

        let ev = setInterval (() => {
            valueRef.current = Math.min(value, Math.floor(valueRef.current + getTimeStep()))
            setValueState(valueRef.current)
            if (valueRef.current == value) clearInterval(ev)
        }, UPDATE_TIME);

        return () => {
            clearInterval(ev)
        }
    }, [value])

    return (<React.Fragment>{valueState}</React.Fragment>)
}