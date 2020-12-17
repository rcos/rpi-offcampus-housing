import React, {useEffect, useState} from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useHistory} from 'react-router'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {PropertyDetails, Property, 
    PropertyImageInfo,
    useGetPropertyOwnedByLandlordLazyQuery,
    useAddImagesToPropertyMutation,
    useRemoveImageFromPropertyMutation} from '../API/queries/types/graphqlFragmentTypes'
import Button from '../components/toolbox/form/Button'
import {HiOutlineArrowNarrowRight, HiCheck} from 'react-icons/hi'
import {DashboardSidebar} from './LandlordDashboard'
import ImageUploadPopup, {FileTypes} from '../components/toolbox/misc/ImageUploadPopup'
import {uploadObjects, deleteObject} from '../API/S3API'

const PropertyDetailsView = (
    {property_id}: {property_id: string}
) => {

    const history = useHistory()
    const user = useSelector((state: ReduxState) => state.user)
    const [showUpdateImagePopup, setShowUpdateImagePopup] = useState<boolean>(false)
    const [GetPropertyOwnedByLandlord, {data: propertyResponse}] = useGetPropertyOwnedByLandlordLazyQuery()
    const [property, setProperty] = useState<Property | null>(null)
    const [AddImagesToProperty, {data: addImagesToPropertyResponse}] = useAddImagesToPropertyMutation()
    const [RemoveImageFromProperty, {data: removeImageFromPropertyResponse}] = useRemoveImageFromPropertyMutation()

    const isSet = (_: any) => _ != null && _ != undefined

    const propertyDetailsSet = (details: PropertyDetails | null | undefined): boolean => isSet(details)

    useEffect(() => {

        if (addImagesToPropertyResponse && addImagesToPropertyResponse.addImagesToProperty
            && addImagesToPropertyResponse.addImagesToProperty.data) {
                setProperty(addImagesToPropertyResponse.addImagesToProperty.data)
            }

    }, [addImagesToPropertyResponse])

    useEffect(() => {

        console.log(removeImageFromPropertyResponse)
        if (removeImageFromPropertyResponse && removeImageFromPropertyResponse.removeImageFromProperty
            && removeImageFromPropertyResponse.removeImageFromProperty.data) {
                setProperty(removeImageFromPropertyResponse.removeImageFromProperty.data)
            }

    }, [removeImageFromPropertyResponse])

    useEffect(() => {
        if (user && user.user) {
            if (user.type == 'landlord') {
                GetPropertyOwnedByLandlord({
                    variables: {
                        property_id,
                        landlord_id: user.user._id
                    }
                })
            }
            else {
                history.push('/')
            }
        }
    }, [property_id, user])

    useEffect(() => {
        if (propertyResponse && propertyResponse.getPropertyOwnedByLandlord) {
            if (propertyResponse.getPropertyOwnedByLandlord.error || !propertyResponse.getPropertyOwnedByLandlord.success
            || !propertyResponse.getPropertyOwnedByLandlord.data) {
                console.error(`Error retrieving property`)
                history.push('/')
            }
            else {
                /**
                 * If the property details have not been set, take them to the page to
                 * set the initial details of the property.
                 */
                if (!propertyDetailsSet(propertyResponse.getPropertyOwnedByLandlord.data.details)) {
                    history.push(`/landlord/property/${property_id}/new`)
                }
                else {
                    setProperty(propertyResponse.getPropertyOwnedByLandlord.data)
                }
            }
        }
    }, [propertyResponse])


    const handleFileUpload = (files_: File[]) => {

        // TODO
        uploadObjects({
            files: files_,
            restricted: false
        })
        .then((result) => {
            if (result && result.status == 200 && result.data) {
                let files_uploaded = result.data.files_uploaded;

                let s3_keys = files_uploaded.map((file_: any) => file_.key)
                AddImagesToProperty({
                    variables: {
                        property_id,
                        s3_keys
                    }
                })
            }
        })
    }

    const handleDeleteFile = (file_key: string) => {
        deleteObject({
            s3_key: file_key
        })
        .then((res: any) => {
            console.log(res)
            if (res && res.data && res.data.success) {
                RemoveImageFromProperty({
                    variables: {
                        property_id,
                        s3_key: file_key
                    }
                })
            }
        })
        .catch((err: any) => {
            console.log(err)
        })
    }

    return (<ViewWrapper
        sidebar_content={<DashboardSidebar
            landlord_id={user && user.user ? user.user._id : null}
        />}
    >
        <React.Fragment>
            {/* Photos Update Popup */}
            <ImageUploadPopup
                show={showUpdateImagePopup}
                onClose={() => setShowUpdateImagePopup(false)}
                image_types={[FileTypes.PNG,FileTypes.JPEG]}
                object_keys={
                    property && property.details ? 
                    property.details.property_images.map(
                        (property_image: PropertyImageInfo) => {
                            return property_image.s3_key
                        })
                    : []
                }
                onFileUpload={handleFileUpload}
                onDeleteImage={handleDeleteFile}
            />

            {/* View Layout */}
            {property != null &&
                <div className="property-details-view">
                    
                    {/* Property Header */}
                    <div className="header-container">
                        <div className="primary-banner" />
                        <div className="header-text">
                            <div className="address-line">{property.address_line} {property.address_line_2 ? `, ${property.address_line_2}` : ''}</div>
                            <div className="address-rest">{property.city} {property.state}, {property.zip}</div>
                        </div>
                    </div>

                    <div className="split-body">
                        <div className="left">
                            <Card header="Leases">
                                <LeaseInfo id={1} info={true} />
                                <LeaseInfo id={2} info={true} />
                                <LeaseInfo id={3} info={false} />
                            </Card>
                        </div>

                        <div className="right">
                            {/* Info Card */}
                            <Card 
                                header="Info">
                                    <div className="sub-section">
                                        <div className="sub-header">Description</div>
                                        <div className="paragraph">
                                            {property.details!.description}
                                        </div>
                                        <div className="kv-pair">
                                            <div className="key_">Square Feet</div>
                                            <div className="value_">{property.details!.sq_ft}</div>
                                        </div>
                                        <div className="kv-pair">
                                            <div className="key_">Rooms</div>
                                            <div className="value_">{property.details!.rooms}</div>
                                        </div>
                                        <div className="kv-pair">
                                            <div className="key_">Bathrooms</div>
                                            <div className="value_">{property.details!.bathrooms}</div>
                                        </div>
                                        <div className="sub-header">Amenities</div>
                                        <div className="paragraph">
                                            {Object.keys(property.details!).map((key: string) => {
                                                return [key, (property.details! as any)[key]]
                                            }).filter( (val: any) => val[1] === true)
                                            .map((val: any, ind: number) => {
                                                let key_ = val[0]
                                                let details_map = {
                                                    "furnished": "Furnished",
                                                    "has_washer": "Washing Machine",
                                                    "has_heater": "Insulation",
                                                    "has_ac": "Air Conditioning"
                                                }
                                                let _str_: string = Object.keys(details_map).includes(key_) ? 
                                                    (details_map as any)[(key_ as string)] : "__none__"
                                                
                                                return (<div key={ind} className="check-list">
                                                    <div className="check_"><HiCheck /></div>
                                                    <div className="_val_">{_str_}</div>
                                                </div>)
                                            })}
                                        </div>
                                    </div>
                            </Card>

                            {/* Photos Card */}
                            <Card 
                                header="Photos"
                                right_side={<Button 
                                    text="Update"
                                    onClick={() => setShowUpdateImagePopup(true)}
                                    textColor="white"
                                    background="#3B4353"/>}>
                                <div className="image-placeholder">
                                    {Array.from(new Array(8), (_: any, i: number) => {
                                        return <div key={i} className="image-placeholder" />
                                    })}
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
            }
        </React.Fragment>
    </ViewWrapper>)
}


interface CardProps {
    children: any
    header: string
    right_side?: any
}
const Card = ({children, header, right_side}: CardProps) => {

    return <div className="content-card">

        <div className="header_">
            <div className="left_">{header}</div>
            {right_side && <div className="right_">
                {right_side}
            </div>}
        </div>
            <div className="body-holder">
                {children}
            </div>
    </div>
}

const LeaseInfo = ({info, id}: {info: boolean, id: number}) => {

    return (<div className="lease-info">
        <div className="header__">
            <div className="left__">Room {id}</div>
            {info && <div className="right__">
                <Button textColor="white" background="#8AE59C" text="Create Lease" />    
            </div>}
        </div>
        {!info && <div className="body__">
            <div className="paragraph-text">
                Active from December 10th, 2020 through March 1st, 2021.
                <div className="leased-by"><span className="icon"><HiOutlineArrowNarrowRight /></span>
                Leased by Abdul-Muiz Yusuff</div>

                <div className="lease-card">
                    <div className="institute-img"></div>
                    <div className="txt__">
                        <div>Abdul-Muiz Yusuff</div>
                        <div>Rensselaer Polytechnic Institute</div>
                    </div>
                </div>
            </div>    
        </div>}
    </div>)
}

export default PropertyDetailsView