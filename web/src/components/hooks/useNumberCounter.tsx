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

        valueRef.current = 0;
        let ev: NodeJS.Timeout | null = null;

        if (value > 0) {
            ev = setInterval (() => {
                    valueRef.current = Math.max(
                        Math.min(value, Math.floor(valueRef.current + getTimeStep())),
                        valueRef.current + 1
                    )
                    setValueState(valueRef.current)
                    if (valueRef.current == value) clearInterval((ev as NodeJS.Timeout))
            }, UPDATE_TIME);
        }

        return () => {
            if (ev != null) clearInterval(ev)
        }
    }, [value])

    return (<React.Fragment>{valueState}</React.Fragment>)
}