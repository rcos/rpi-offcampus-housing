import React, {useState, useEffect} from 'react'
import {HiCheck} from 'react-icons/hi'

interface CheckboxProps {
    onCheck: (_: boolean) => void
    label: string
    initiallyChecked?: boolean
}

const Checkbox = ({onCheck, label, initiallyChecked}: CheckboxProps) => {

    const [checked, setChecked] = useState<boolean>(initiallyChecked != undefined ? initiallyChecked : false)

    useEffect(() => {
        onCheck(checked);
    }, [checked])

    const handleChecked = () => {
        setChecked(!checked)
    }

    return(<div className="app-checkbox" onClick={() => handleChecked()}>
        <div className="checkbox-container">
            <div className={`_checkbox`}>
                <div className={`checkbox-slider ${checked? 'checked' : ''}`} />
                <div className={`check-icon ${checked? 'checked' : ''}`}><HiCheck /></div>
            </div>
        </div>
        <div className="_label">{label}</div>
    </div>)
}

export default Checkbox