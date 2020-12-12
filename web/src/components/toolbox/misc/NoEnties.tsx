import React from 'react'

interface NoEntriesProps {
    message: string
}

const NoEnties = ({message}: NoEntriesProps) => <div className="no-entries"><div className="message">{message}</div></div>

export default NoEnties