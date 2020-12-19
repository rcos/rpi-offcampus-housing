import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useSelector} from 'react-redux'

import ContextMenu, {TripleDotButton} from '../components/toolbox/misc/ContextMenu'
import {
    useGetOwnershipLazyQuery,
    useAddOwnershipConfirmationActivityMutation,
    ConfirmationActivity,
    StatusChangeInfo,
    Ownership,
    useGetOwnershipConflictsQuery,
    useChangeOwnershipStatusMutation
} from '../API/queries/types/graphqlFragmentTypes'
import {HiOutlineArrowNarrowRight, HiCheck, HiPhone} from 'react-icons/hi'
import {BsBoxArrowInUpRight} from 'react-icons/bs'
import {FiAlertTriangle} from 'react-icons/fi'
import {ImReply, ImForward} from 'react-icons/im'
import SortableList from '../components/toolbox/layout/SortableList2'
import Button from '../components/toolbox/form/Button'
import {objectURI} from '../API/S3API'
import { ReduxState } from '../redux/reducers/all_reducers'
import { useHistory } from 'react-router-dom'

const OwnershipDoc = ({ownership_id}: {ownership_id: string}) => {

    const confirmActivityRef = useRef<HTMLDivElement>(null)
    const history = useHistory()
    const user = useSelector((state: ReduxState) => state.user)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

    }, [ownership_id])

    const [ownershipDoc, setOwnershipDoc] = useState<Ownership | null>(null)
    const [GetOwnership, {data: ownershipDocData}] = useGetOwnershipLazyQuery({
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
    const [ChangeOwnershipStatus, {data: ownershipStatusChangeResponse}] = useChangeOwnershipStatusMutation()
    const [AddConfirmationActivity, {data: confirmationActivityResponse}] = useAddOwnershipConfirmationActivityMutation()
    const [updater_, setUpdater_] = useState<boolean>(false)

    const forceUpdate = () => setUpdater_(!updater_)

    const [activityUpdateValue, setActivityUpdateValue] = useState<string>("")

    useEffect(() => {
        GetOwnership()
    }, [])

    useEffect(() => {
        if (ownershipStatusChangeResponse && ownershipStatusChangeResponse.changeOwnershipStatus
            && ownershipStatusChangeResponse.changeOwnershipStatus.data) {
                setOwnershipDoc(ownershipStatusChangeResponse.changeOwnershipStatus.data)
            }
        // GetOwnership()
    }, [ownershipStatusChangeResponse])

    useEffect(() => {
        if (confirmationActivityResponse 
            && confirmationActivityResponse.addOwnershipConfirmationActivity
            && confirmationActivityResponse.addOwnershipConfirmationActivity.data
            && ownershipDoc) {
                ownershipDoc.confirmation_activity = confirmationActivityResponse.addOwnershipConfirmationActivity.data.confirmation_activity
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

        if (ownershipDocData && ownershipDocData.getOwnership && ownershipDocData.getOwnership.data) {
            setOwnershipDoc(ownershipDocData.getOwnership.data)
        }
    }, [ownershipDocData])

    const submitActivityUpdate = () => {
        if (activityUpdateValue.length == 0) return;
        AddConfirmationActivity({
            variables: {
                ownership_id:ownershipDoc ? ownershipDoc._id : '',
                user_id: user && user.user ? user.user._id : '',
                user_type: user && user.type ? user.type : '',
                message: activityUpdateValue,
                date_submitted: new Date().toISOString()
            }
        })
        setActivityUpdateValue("")
        if (textareaRef.current) textareaRef.current.value = ""
    }

    const getPhoneNumber = (): string => {
        if (ownershipDoc && ownershipDoc.landlord_doc && ownershipDoc.landlord_doc.phone_number) {
                let phone_number: string = ownershipDoc.landlord_doc.phone_number.trim()
                if (phone_number.length < 3) return phone_number;
                if (phone_number[0] == '+') phone_number = phone_number.substring(1)
                return `+${phone_number[0]} (${phone_number.substring(1, 4)}) ${phone_number.substring(4, 7)} ${phone_number.substring(7)}`

        }
        return ''
    }

    const getStatus = (): string => {
        if (ownershipDoc) {
            return ownershipDoc.status
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

    const getStatusString = (status: string): string => {
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

    const changeStatus = (status_action: 'approve' | 'decline' | 'set-to-review') => {
        let new_status: string = '';
        switch(status_action) {
            case 'approve':
                new_status = 'confirmed';
                break;
            case 'decline':
                new_status = 'declined';
                break;
            case 'set-to-review':
                new_status = 'in-review';
                break;
        }

        ChangeOwnershipStatus({
            variables: {
                ownership_id,
                new_status,
                status_changer_user_id: user && user.user ? user.user._id : '',
                status_changer_user_type: user && user.type ? user.type : '',
                with_landlord: true,
                with_property: true
            }
        })
    }

    const getStatusAndConfirmation = (): (ConfirmationActivity | StatusChangeInfo)[] => {
        let info_: (ConfirmationActivity | StatusChangeInfo)[] = [];

        if (ownershipDoc) {
            info_ = [
                ...ownershipDoc.status_change_history,
                ...ownershipDoc.confirmation_activity
            ]
            // sort from least to most recent
            info_.sort((a: ConfirmationActivity | StatusChangeInfo, b: ConfirmationActivity | StatusChangeInfo): number => {
                let a_date = new Date( (a as any).date_submitted ? (a as any).date_submitted : (a as any).date_changed  )
                let b_date = new Date( (b as any).date_submitted ? (b as any).date_submitted : (b as any).date_changed  )
                return a_date > b_date ? 1 : -1
            })
        }

        return info_;
    }

    return (<ViewWrapper>
        <div>

            {/* Header */}
            <div className="section-header-2" ref={headerRef}>
                <div className="title-area">Ownership Form</div>
            </div>

            {!ownershipDoc && <div>LOADING PLACEHOLDER</div>}

            {ownershipDoc &&
            (!ownershipDoc.landlord_doc
            || !ownershipDoc.property_doc)
            && <div>Error Loading...</div>}

            {ownershipDoc && ownershipDoc.landlord_doc && ownershipDoc.property_doc && <div>
                {/* Property Information */}

                <div className="card-headr">
                <div style={{
                    display: 'flex'
                }}>
                    <div style={{
                        flexGrow: 1
                    }}
                        className="title-area">
        {ownershipDoc.property_doc!.address_line} {ownershipDoc.property_doc!.address_line_2 ? `${ownershipDoc.property_doc!.address_line_2}, ` : ''}, {ownershipDoc.property_doc!.city} {ownershipDoc.property_doc!.state}, {ownershipDoc.property_doc!.zip}
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
                                textColor="white"
                                background="#6AD68B"
                                onClick={() => {changeStatus('approve')}}
                            />
                        </div>}
                        {(getStatus() == "in-review") && <div 
                            style={{
                                width: "100px",
                                marginRight: '8px'
                            }}>
                            <Button
                                textColor="white" 
                                text="Decline"
                                background="#c45e5e"
                                onClick={() => {changeStatus('decline')}}
                            />
                        </div>}
                        {getStatus() == 'confirmed' && <div>
                            <ContextMenu 
                                position="top right"
                                menuItems={[
                                    {
                                        label: "decline",
                                        icon: <ImReply/>,
                                        onClick: () => {changeStatus('decline')}
                                    }, {
                                        label: "re-review",
                                        icon: <ImReply/>,
                                        onClick: () => {changeStatus('set-to-review')}
                                    }
                                ]}
                            >{TripleDotButton}</ContextMenu>    
                        </div>}
                        {getStatus() == 'declined' && <div>
                            <ContextMenu 
                                position="top right"
                                menuItems={[
                                    {
                                        label: "approve",
                                        icon: <ImForward/>,
                                        onClick: () => {changeStatus('approve')}
                                    }, {
                                        label: "re-review",
                                        icon: <ImForward/>,
                                        onClick: () => {changeStatus('set-to-review')}
                                    }
                                ]}
                            >{TripleDotButton}</ContextMenu>    
                        </div>}
                    </div>
                </div>

                {/* Show Landlord Contact */}
                <div style={{
                    display: 'flex',
                    fontSize: '0.8rem'
                }}>
                    <div style={{marginRight: '20px'}}>
                        Landlord: {ownershipDoc.landlord_doc!.first_name} {ownershipDoc.landlord_doc!.last_name}
                    </div>
                    <div style={{display: 'flex', marginRight: '20px'}}>
                        <div style={{
                            width: `30px`, 
                            textAlign: 'center',
                            transform: `translateY(1px)`
                            }}><HiPhone /></div>
                        <div>{getPhoneNumber ()}</div>
                    </div>
                        <div className={`status-color ${getStatus()}`}>
                            <div className="circle_"/>
                            Status: {getStatusString (getStatus())}</div>
                </div>
                </div>

                {/* Ownership Documents area */}
                <div style={{marginTop: '10px'}}>
                    <div className="submenu-title">Uploaded Documents</div>
                    <div>
                        {ownershipDoc.ownership_documents.length == 0 &&
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
                        {ownershipDoc.ownership_documents.length > 0 
                        && ownershipDoc.ownership_documents.map((ownership_doc: any, i) => {
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
                            columns={["Landlord Name", "Status", "Date Submitted"]}
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
                        {ownershipDoc.confirmation_activity.length == 0 
                        && ownershipDoc.status_change_history.length == 0 
                        &&
                        <div style={{
                            fontStyle: `italic`,
                            position: `absolute`,
                            left: `50%`,
                            top: `50%`,
                            transform: `translateX(-50%) translateY(-50%)`
                        }}>
                            No activity on record
                        </div>}

                        {getStatusAndConfirmation().map((entry: ConfirmationActivity | StatusChangeInfo, i: number) => {

                            // Show status change
                            if ((entry as any).status_changer_user_id) {
                                let status_change: StatusChangeInfo = entry as StatusChangeInfo
                                return (<div key={i} className="ownership-status-change-message">
                                    <div className="icon_">
                                        <HiOutlineArrowNarrowRight />
                                    </div>
                                    <span style={{
                                        marginRight: '5px',
                                        fontWeight: 600
                                    }}>{getTimeInfo(status_change.date_changed)}</span>
                                    <span style={{textDecoration:'underline'}}>{status_change.status_changer_full_name}</span> changed the status from
                                    from {getStatusString(status_change.changed_from)} to {getStatusString(status_change.changed_to)}
                                </div>)
                            }
                            else {
                                let activity: ConfirmationActivity = entry as ConfirmationActivity
                                return (<div key={i}>
                                    <span style={{
                                        marginRight: '5px'
                                    }}>{getTimeInfo(activity.date_submitted)}</span>
                                    <span style={{
                                    fontWeight: 600,
                                    marginRight: '5px',
                                    fontFamily: 'khumbh-sans',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    letterSpacing: `0.5px`
                                }}>{activity.full_name? activity.full_name : activity.user_id}</span> {activity.message}</div>)
                            }
                        })}
                    </div>

                    <div className="textarea-holder">
                        <textarea placeholder="Enter activity update" 
                            ref={textareaRef}
                            style={{
                                resize: 'none',
                                height: '50px',
                                minHeight: '50px',
                                fontSize: `0.7rem`
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
                                background="#6AD68B"
                                textColor="white"
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