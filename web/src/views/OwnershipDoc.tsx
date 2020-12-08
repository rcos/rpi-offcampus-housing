import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useSelector} from 'react-redux'

import {useContainerRef} from '../components/hooks/useContainerRefHook'
import {
    useGetOwnershipQuery,
    useAddOwnershipConfirmationActivityMutation,
    ConfirmationActivity,
    Ownership,
    useGetOwnershipConflictsQuery
} from '../API/queries/types/graphqlFragmentTypes'
import {HiClipboard, HiCheck, HiPhone} from 'react-icons/hi'
import {BsBoxArrowInUpRight} from 'react-icons/bs'
import {FiAlertTriangle} from 'react-icons/fi'
import SortableList from '../components/toolbox/layout/SortableList'
import Button from '../components/toolbox/form/Button'
import {objectURI} from '../API/S3API'
import { ReduxState } from '../redux/reducers/all_reducers'
import { useHistory } from 'react-router-dom'

const OwnershipDoc = ({ownership_id}: {ownership_id: string}) => {

    const confirmActivityRef = useRef<HTMLDivElement>(null)
    const history = useHistory()
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
    const {data: ownershipConflicts} = useGetOwnershipConflictsQuery({
        variables: {
            ownership_id
        }
    })
    const [AddConfirmationActivity, {data: confirmationActivityResponse}] = useAddOwnershipConfirmationActivityMutation()
    const [updater_, setUpdater_] = useState<boolean>(false)

    const forceUpdate = () => setUpdater_(!updater_)

    const [activityUpdateValue, setActivityUpdateValue] = useState<string>("")

    useEffect(() => {
        console.log(ownershipConflicts)
    }, [ownershipConflicts])

    useEffect(() => {
        if (confirmationActivityResponse 
            && confirmationActivityResponse.addOwnershipConfirmationActivity
            && confirmationActivityResponse.addOwnershipConfirmationActivity.data
            && ownershipDocData && ownershipDocData.getOwnership && ownershipDocData.getOwnership.data) {
                ownershipDocData.getOwnership.data.confirmation_activity = confirmationActivityResponse.addOwnershipConfirmationActivity.data.confirmation_activity
                forceUpdate()

                if (confirmActivityRef.current) {
                    confirmActivityRef.current.scrollTo({
                        top: confirmActivityRef.current.scrollHeight + 20
                    })
                }
        }
    }, [confirmationActivityResponse])

    useEffect(() => {
        if (confirmActivityRef.current) {
            confirmActivityRef.current.scrollTo({
                top: confirmActivityRef.current.scrollHeight
            })
        }
    }, [ownershipDocData])

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

    const getStatus = (): string => {
        if (ownershipDocData && ownershipDocData.getOwnership && ownershipDocData.getOwnership.data) {
            return ownershipDocData.getOwnership.data.status
        }
        return '';
    }

    const hasConflicts = (): boolean => {
        return (ownershipConflicts && ownershipConflicts.getOwnershipConflicts
        && ownershipConflicts.getOwnershipConflicts.data
        && ownershipConflicts.getOwnershipConflicts.data.ownerships.length > 0) as boolean;
    }

    const getConflicts = (): Ownership[] => {
        if (!hasConflicts()) return []
        return ownershipConflicts!.getOwnershipConflicts!.data!.ownerships;
    }

    const getStatusString = (): string => {
        let status: string = getStatus()
        switch (status) {
            case 'in-review':
                return "Undergoing Review";
            case "confirmed":
                return "Approved";
            case "declined":
                return "Declined"
        }
        return ''
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
                    display: 'flex'
                }}>
                    <div style={{
                        fontFamily: 'mukta',
                        fontSize: '1.3rem',
                        flexGrow: 1
                    }}>
                        {ownershipDocData!.getOwnership!.data!.property_doc!.location}
                    </div>
                    <div style={{
                        minWidth: '300px',
                        display: 'flex',
                        flexDirection: 'row-reverse'
                    }}>
                        {(getStatus() == "in-review") && <div 
                            style={{
                                width: "100px"
                            }}>
                            <Button 
                                text="Approve"
                                background="#99E1D9"
                            />
                        </div>}
                        {(getStatus() == "in-review") && <div 
                            style={{
                                width: "100px",
                                marginRight: '8px'
                            }}>
                            <Button 
                                text="Decline"
                                background="#99E1D9"
                            />
                        </div>}
                    </div>
                </div>

                {/* Show Landlord Contact */}
                <div style={{
                    display: 'flex',
                    fontSize: '0.8rem'
                }}>
                    <div style={{marginRight: '20px'}}>
                        Landlord: {ownershipDocData!.getOwnership!.data!.landlord_doc!.first_name} {ownershipDocData!.getOwnership!.data!.landlord_doc!.last_name}
                    </div>
                    <div style={{display: 'flex', marginRight: '20px'}}>
                        <div style={{
                            width: `30px`, 
                            textAlign: 'center'
                            }}><HiPhone /></div>
                        <div>(504) 800 0000</div>
                    </div>
                        <div className={`status-color ${getStatus()}`}>
                            <div className="circle_"/>
                            Status: {getStatusString ()}</div>
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

                    {!hasConflicts() &&
                    <div
                        style={{
                            transform: `translateY(-10px)`,
                            marginLeft: '10px'
                        }}
                        className="success-line">
                            <span className="icon-holder"><HiCheck /></span>
                            There are no conflicts!
                        </div>}

                    {hasConflicts() && <div className="error-line warning" style={{
                        transform: `translateY(-10px)`,
                        marginLeft: '10px'
                    }}>
                        <span className="icon-holder"><FiAlertTriangle /></span>
                        There {getConflicts().length == 1 ? 'is' : 'are'} {getConflicts().length} conflicts for this property.
                    </div>}

                    <div style={{
                        position: 'relative',
                        top: '-15px'
                    }}>
                        {
                        hasConflicts ()
                        &&
                        <SortableList 
                            labels={["Landlord Name", "Status", "Date Submitted"]}
                            init_size_ratios={[1, 1]}
                            entries={
                                getConflicts().map((ownership: Ownership) => {
                                    return {
                                        'landlord-name': 
                                            ownership.landlord_doc ? 
                                            `${ownership.landlord_doc?.first_name} ${ownership.landlord_doc?.last_name}`:
                                            ownership._id
                                        ,
                                        'status': ownership.status,
                                        'date-submitted': {
                                            data: new Date(ownership.date_submitted),
                                            toString: dateToString
                                        },
                                        '_id': ownership._id
                                    }
                                })
                            }
                            onClick={(entry_: any) => {
                                history.push(`/ownership/review/${entry_._id}`)
                            }}
                        />}
                    </div>

                    </div>

                </div>

                {/* Confirmation Activity */}
                <div>
                    <div className="submenu-title">Confirmation Activity</div>

                    <div 
                        ref={confirmActivityRef}
                        style={{
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
                            ownershipDocData!.getOwnership!.data!.confirmation_activity
                            .sort((a: ConfirmationActivity, b: ConfirmationActivity): number => new Date(a.date_submitted) > new Date(b.date_submitted)? 1 : -1)
                            .map((entry: ConfirmationActivity, i: number) => {
                            return (<div key={i}>
                                <span style={{
                                    marginRight: '5px'
                                }}>{getTimeInfo(entry.date_submitted)}</span>
                                <span style={{
                                fontWeight: 600,
                                marginRight: '5px',
                                fontFamily: 'khumbh-sans',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                letterSpacing: `0.5px`
                            }}>{entry.full_name? entry.full_name : entry.user_id}</span> {entry.message}</div>)
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

const dateToString = (date_: Date): string => `${date_.getMonth()} / ${date_.getDate()} / ${date_.getFullYear()}`;
const getTimeInfo = (iso: string): string => {
    let date_: Date = new Date(iso)
    return `${date_.getMonth()}/${date_.getDay()}/${date_.getFullYear()} ${date_.getHours()}:${date_.getMinutes()}`
}

export default OwnershipDoc