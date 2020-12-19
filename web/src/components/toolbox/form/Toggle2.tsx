import React, {useState, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface ToggleOptions {
    on_label: string
    off_label: string
    onToggle: (_: boolean, __: string) => void
    initialValue?: boolean
}

const Toggle2 = ({
    on_label, off_label, onToggle, initialValue
}: ToggleOptions) => {

    const [toggleOn, setToggleOn] = useState<boolean>(initialValue != undefined ? initialValue : true)

    useEffect(() => {

        if (toggleOn) toggleSpring.set(0)
        else toggleSpring.set(1)

        onToggle(toggleOn, toggleOn ? on_label : off_label)

    }, [toggleOn])

    const toggleSpring = useSpring(toggleOn ? 0 : 1)
    const translateTransform = useTransform(toggleSpring, [0, 1], [3, 23])

    return (<div className="form-toggle-2">
        <div className="toggle-container" onClick={() => {
            setToggleOn(!toggleOn)
        }}>
            <motion.div 
                style={{
                    translateX: translateTransform
                }}
                className="toggle-ball" />
            {/* Labels */}
            <div className="on-label">{on_label}</div>
            <div className="off-label">{off_label}</div>
        </div>
    </div>)
}

export default Toggle2