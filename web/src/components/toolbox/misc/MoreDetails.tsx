import React, {useState} from 'react'

interface MoreDetailsProp {
    details: string
}

const MoreDetails = ({details}: MoreDetailsProp) => {
    
    const [showDetails, setShowDetails] = useState<boolean>(false)


    return (<div className="more-details"
        onMouseOver={() => setShowDetails(true)}
        onMouseOut={() => setShowDetails(false)}>
        ?
        {showDetails && <div className="details-area" style={{
        }}>
            <div className="details">{details}</div>
        </div>}
    </div>)
}

export default MoreDetails