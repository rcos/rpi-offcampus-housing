import React, { useEffect, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'

import {useContainerRef} from '../components/hooks/useContainerRefHook'
import {useGetOwnershipLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import {HiClipboard, HiPhone} from 'react-icons/hi'
import {BsBoxArrowInUpRight} from 'react-icons/bs'
import {FiAlertTriangle} from 'react-icons/fi'
import SortableList from '../components/toolbox/layout/SortableList'

const OwnershipDoc = ({ownership_id}: {ownership_id: string}) => {

    const containerRef = useRef<HTMLDivElement>(null)
    useContainerRef({ ref_: containerRef })

    const headerRef = useRef<HTMLDivElement>(null)
    const [_, {data: ownershipDocData}] = useGetOwnershipLazyQuery({
        fetchPolicy: 'no-cache',
        variables: {
            ownership_id
        }
    })

    return (<ViewWrapper>
        <div style={{
            border: `1px solid orange`
        }}>

            {/* Header */}
            <div className="section-header left-and-right" ref={headerRef}>
                <div className="icon-area"><HiClipboard /></div>
                <div className="title-area">Ownership Form</div>
            </div>

            <div ref={containerRef}>
                {/* Property Information */}
                <div style={{
                    fontFamily: 'mukta',
                    fontSize: '1.3rem'
                }}>1390 North 45th Blvd.</div>

                {/* Show Landlord Contact */}
                <div style={{
                    display: 'flex',
                    fontSize: '0.8rem'
                }}>
                    <div style={{marginRight: '20px'}}>Landlord: John Rondon</div>
                    <div style={{display: 'flex'}}>
                        <div style={{
                            width: `30px`, 
                            textAlign: 'center'
                            }}><HiPhone /></div>
                        <div>(504) 800 0000</div>
                    </div>
                </div>

                {/* Ownership Documents area */}
                <div style={{marginTop: '10px'}}>
                    <div className="submenu-title">Uploaded Documents</div>
                    <div>
                        {Array.from(new Array(10), (x, i) => {
                            return (<DocumentThumbPreview key={i} s3_key={"test"} />)
                        })}
                    </div>
                </div>

                {/* Conflicts */}
                <div>
                    <div className="submenu-title">Conflicts</div>
                    <div>
                    <div className="error-line warning" style={{
                        transform: `translateY(-10px)`,
                        marginLeft: '10px'
                    }}>
                        <span className="icon-holder"><FiAlertTriangle /></span>
                        There are 2 conflicts for this property. 
                        One conflict is for an approved ownership and another 
                        conflict is for an ownership in-review
                    </div>

                    <div style={{
                        position: 'relative',
                        top: '-15px'
                    }}>
                        <SortableList 
                            labels={["Landlord Name", "Date Submitted"]}
                            init_size_ratios={[1, 1]}
                            entries={[
                                {'landlord-name': 'Jojo Bobo', 'date-submitted': {data: new Date(0), toString: dateToString} },
                                {'landlord-name': 'Kim Baba', 'date-submitted': {data: new Date(1000000000000), toString: dateToString} }
                            ]}
                        />
                    </div>

                    </div>

                </div>

                {/* Confirmation Activity */}
                <div>
                    <div className="submenu-title">Confirmation Activity</div>
                </div>
            </div>


        </div>
    </ViewWrapper>)
}

const DocumentThumbPreview = ({s3_key}: {s3_key: string}) => {

    return (<div className="document-thumb-preview">
        <div className="meta-header">
            <div className="file-name">sample file name</div>
            <div className="expand-button"><BsBoxArrowInUpRight /></div>
        </div>
    </div>)
}

const dateToString = (date_: Date): string => `${date_.getMonth()} / ${date_.getDate()} / ${date_.getFullYear()}`

export default OwnershipDoc