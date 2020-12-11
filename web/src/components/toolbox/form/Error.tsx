import React from 'react'
import {FiAlertTriangle} from 'react-icons/fi'
import {HiX} from 'react-icons/hi'

interface ErrorProps {
    type: 'error' | 'warning'
    message: string
}

const Error = ({type, message}: ErrorProps) => {

    return (<div className={`error-line ${type}`}>
    <span className="icon-holder">
        {type == 'warning' && <FiAlertTriangle />}
        {type == 'error' && <HiX/>}
    </span>
    {message}
</div>)
}

export default Error