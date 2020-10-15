import React from 'react'

interface IProgress {
  value: number
}

const Progress = ({ value }: IProgress) => {

  return (<div className="progress-bar">
    <div className="progress-value"
      style={{
        width: `${Math.min(value * 100, 100)}%`
      }}
    ></div>
  </div>)
}

export default Progress