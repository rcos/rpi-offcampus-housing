import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useSelector} from 'react-redux'

import {useContainerRef} from '../components/hooks/useContainerRefHook'
import {
    useGetOwnershipQuery,
    useAddOwnershipConfirmationActivityMutation,
    ConfirmationActivity
} from '../API/queries/types/graphqlFragmentTypes'
import {HiClipboard, HiPhone} from 'react-icons/hi'
import {BsBoxArrowInUpRight} from 'react-icons/bs'
import {FiAlertTriangle} from 'react-icons/fi'
import SortableList from '../components/toolbox/layout/SortableList'
import Button from '../components/toolbox/form/Button'
import {objectURI} from '../API/S3API'
import { ReduxState } from '../redux/reducers/all_reducers'

const OwnershipDoc = ({ownership_id}: {ownership_id: string}) => {

    const user = useSelector((state: ReduxState) => state.user)
    const containerRef = useRef<HTMLDivElement>(null)
    useContainerRef({ ref_: containerRef })
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const headerRef = useRef<HTMLDivElement>(null)
    const {data: ownershipDocData} = useGetOwnershipQuery({
        fetchPolicy: 'no-cache',
        variables: {
            ownership_id
        }
    })
    const [AddConfirmationActivity, {data: confirmationActivityResponse}] = useAddOwnershipConfirmationActivityMutation()
    const [updater_, setUpdater_] = useState<boolean>(false)

    const forceUpdate = () => setUpdater_(!updater_)

    const [activityUpdateValue, setActivityUpdateValue] = useState<string>("")

    useEffect(() => {
        console.log(ownershipDocData)
    }, [ownershipDocData])

    useEffect(() => {
        if (confirmationActivityResponse 
            && confirmationActivityResponse.addOwnershipConfirmationActivity
            && confirmationActivityResponse.addOwnershipConfirmationActivity.data
            && ownershipDocData && ownershipDocData.getOwnership && ownershipDocData.getOwnership.data) {
                ownershipDocData.getOwnership.data.confirmation_activity = confirmationActivityResponse.addOwnershipConfirmationActivity.data.confirmation_activity
                forceUpdate()
        }
    }, [confirmationActivityResponse])

    const submitActivityUpdate = () => {
        if (activityUpdateValue.length == 0) return;
        AddConfirmationActivity({
            variables: {
                ownership_id: ownershipDocData && ownershipDocData.getOwnership.data ? ownershipDocData.getOwnership.data._id : '',
                user_id: user && user.user ? user.user._id : '',
                user_type: user && user.type ? user.type : '',
                message: activityUpdateValue,
                date_submitted: new Date().toISOString()
            }
        })
        setActivityUpdateValue("")
        if (textareaRef.current) textareaRef.current.value = ""
    }

    return (<ViewWrapper>
        <div>

            {/* Header */}
            <div className="section-header left-and-right" ref={headerRef}>
                <div className="icon-area"><HiClipboard /></div>
                <div className="title-area">Ownership Form</div>
            </div>

            {!ownershipDocData && <div>LOADING PLACEHOLDER</div>}

            {ownershipDocData &&
            (!ownershipDocData.getOwnership.data 
            || !ownershipDocData.getOwnership.data.landlord_doc
            || !ownershipDocData.getOwnership.data.property_doc)
            && <div>Error Loading...</div>}

            {ownershipDocData 
            && ownershipDocData.getOwnership.data
            && ownershipDocData.getOwnership.data.landlord_doc
            && ownershipDocData.getOwnership.data.property_doc && <div ref={containerRef}>
                {/* Property Information */}
                <div style={{
                    fontFamily: 'mukta',
                    fontSize: '1.3rem'
                }}>
                    {ownershipDocData!.getOwnership!.data!.property_doc!.location}
                </div>

                {/* Show Landlord Contact */}
                <div style={{
                    display: 'flex',
                    fontSize: '0.8rem'
                }}>
                    <div style={{marginRight: '20px'}}>
                        Landlord: {ownershipDocData!.getOwnership!.data!.landlord_doc!.first_name} {ownershipDocData!.getOwnership!.data!.landlord_doc!.last_name}</div>
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
                        {ownershipDocData!.getOwnership!.data!.ownership_documents.length == 0 &&
                        <div style={{
                            height: '200px',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: `50%`,
                                left: `50%`,
                                transform: `translateX(-50%) translateY(-50%)`,
                                fontStyle: 'italic',
                                fontFamily: 'mukta'
                            }}>
                                No documents uploaded
                            </div>
                        </div>}
                        {ownershipDocData!.getOwnership!.data!.ownership_documents.length > 0 
                        && ownershipDocData!.getOwnership!.data!.ownership_documents.map((ownership_doc: any, i) => {
                            return (<DocumentThumbPreview key={i} s3_key={ownership_doc.s3_doc_key} />)
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

                    <div style={{
                        height: `150px`,
                        overflowY: `scroll`,
                        position: `relative`,
                        border: `1px solid #e3e3e3`,
                        marginBottom: `10px`,
                        fontFamily: `mukta`,
                        fontSize: `0.8rem`,
                        padding: `3px 8px`
                    }}>
                        {ownershipDocData!.getOwnership!.data!.confirmation_activity.length == 0 &&
                        <div style={{
                            fontStyle: `italic`,
                            position: `absolute`,
                            left: `50%`,
                            top: `50%`,
                            transform: `translateX(-50%) translateY(-50%)`
                        }}>
                            No activity on record
                        </div>}

                        {ownershipDocData!.getOwnership!.data!.confirmation_activity.length > 0 && 
                            ownershipDocData!.getOwnership!.data!.confirmation_activity.map((entry: ConfirmationActivity) => {
                            return (<div>{entry.full_name? entry.full_name : entry.user_id}: {entry.message}</div>)
                            })
                        }
                    </div>

                    <div className="textarea-holder">
                        <textarea placeholder="Enter activity update" 
                            ref={textareaRef}
                            style={{
                                resize: 'none',
                                height: '50px',
                                minHeight: '50px'
                            }}
                            onChange={(e: any) => {
                                setActivityUpdateValue(e.target.value)
                            }}
                        />
                        <div style={{
                            width: '200px',
                            float: 'right',
                            marginTop: '5px'
                        }}>
                            <Button 
                                text="Submit"
                                background="#99E1D9"
                                onClick={submitActivityUpdate}
                            />
                        </div>
                    </div>
                </div>
            </div>}


        </div>
    </ViewWrapper>)
}

const DocumentThumbPreview = ({s3_key}: {s3_key: string}) => {


    return (<div className="document-thumb-preview" onClick={() => {window.open(objectURI(s3_key), '_blank')}}>
        <div className="meta-header">
            <div className="file-name">{s3_key}</div>
            <div className="expand-button"><BsBoxArrowInUpRight /></div>
        </div>
    </div>)
}

const dateToString = (date_: Date): string => `${date_.getMonth()} / ${date_.getDate()} / ${date_.getFullYear()}`

export default OwnershipDoc