import React, {useEffect, useState} from 'react'
import {useMediaQuery} from 'react-responsive'
import {HiPlus} from 'react-icons/hi'
import {RiSave3Line} from 'react-icons/ri'
import {useHistory} from 'react-router'
import {useSelector} from 'react-redux'

import {OwnershipDocument} from '../API/queries/types/graphqlFragmentTypes'
import Fixate from '../components/toolbox/layout/Fixate'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useGetOwnershipLazyQuery, useGetPropertyLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import Button from '../components/toolbox/form/Button'
import Centered from '../components/toolbox/layout/Centered'
import {FloatingLogo} from '../components/Logo'
import {uploadObjects} from '../API/S3API'

interface ILandlordOwnershipDocuments {
  ownership_id: string
}

const ALLOWED_FILETYPES = [

  // PNG
  'image/png', 

  // JPG
  'image/jpeg', 
  
  // PDF
  'application/pdf',
  
  // DOCS, DOC, DOCX
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
]

const ALLOWED_FILETYPES_ABBREV = [
  '.png', '.pdf', '.jpg', '.jpeg', '.doc', '.docs', '.docx'
]

const LandlordOwnershipDocuments = ({ownership_id}:ILandlordOwnershipDocuments) => {

  const history = useHistory()
  const user = useSelector((state: ReduxState) => state.user)
  const [getOwnership, {data: ownershipData}] = useGetOwnershipLazyQuery()
  const [getProperty, {data: propertyData}] = useGetPropertyLazyQuery()
  const [uploadsInFlight, setUploadsInFlight] = useState<Document_[]>([])

  useEffect(() => {
    getOwnership({variables: { ownership_id: ownership_id }})
  }, [ownership_id])

  useEffect(() => {
    if (ownershipData && user) {
      if (user.type == "student") history.push('/')

      // check if the currently logged in user owns the data
      if (user.type == "landlord") {

        if (ownershipData.getOwnership.success) {
          if (user.user && user.user._id == ownershipData.getOwnership.data!.landlord_id) {
            // ...
            getProperty({
              variables: {
                id: `${ownershipData.getOwnership.data!.property_id}`,
                withLandlord: false,
                withReviews: false,
                reviewOffset: 0,
                reviewCount: 0
              }
            })
          }
          else {
            console.error(`User is not authorized to see another landlord's ownership information`)
            // history.push('/landlord/dashboard')
          }
        }
        // an error occurred on server
        else {
          console.error(`An error occurred retrieving ownership information`)
          history.push('/landlord/dashboard')
        }
      }

    }  
  }, [ownershipData, user])

  const reviewStatus = (): 'in-review' | 'confirmed' | '' => {
    if (!ownershipData || !ownershipData.getOwnership.data) return ''
    if (ownershipData.getOwnership.data.status == `confirmed`) return 'confirmed'
    if (ownershipData.getOwnership.data.status == `in-review`) return 'in-review'
    return ''
  }

  const getCommentColor = (): string => {
    if (reviewStatus() == `in-review`) return 'yellow'
    if (reviewStatus() == `confirmed`) return 'blue'
    return 'yellow'
  }

  const getCommentMessage = (): string => {
    if (reviewStatus() == `in-review`)
      return `Ownership documents are in review. Please upload documents
      that indicate proof of ownership of this property`;
    
    if (reviewStatus() == `confirmed`)
      return `Your ownership for this property has been successfully confirmed`

    else return `Status unknown`
  }

  const chooseDocument = () => {

    // file uploader
    const handleFileUpload = (e: any) => {
      if (e.path.length == 0) {
        console.error(`Event path is empty`)
        return;
      }
      let files_ = e.path[0].files
      if (Object.keys(files_).length == 0) {
        console.error(`Files is empty..`)
        return;
      }

      // TODO check each file extension to make sure they are file types we expect
      
      // ? Since we are going to store inflight uploads in state for the UI, 
      // ? we will only allow files to be uploaded once all currently inflight
      // ? uploads are complete.

      // ! Temporarily: No files will be uploaded if at least 1 of the files is not
      // ! of the right filetype.
      // TODO add visual error message
      let valid_files: boolean = true
      for (let i = 0; i < files_.length; ++i) {
        if (!ALLOWED_FILETYPES.includes(files_[i].type)) {
          alert (`${files_[i].name} is not of valid filetype.`)
          valid_files = false;
          break;
        }
      }

      if (valid_files) {
        // add all of them to inflight
        setUploadsInFlight( Object.keys(files_).map((file_index) => files_[file_index]).map((file: any): Document_ => {
          return {
            s3_doc_key: '',
            format: file.type,
            date_uploaded: new Date().toISOString(),
            uploaded: false,
            filename: file.name
          }
        }) )

        // call the upload api
        uploadObjects({
          files: Object.keys(files_).map((file_key) => files_[file_key]),
          restricted: true,
          landlords_access: user && user.user ? [user.user._id.toString()] : []
        })
        .then((result) => {
          if (result.data && result.data.success) {
            let files_uploaded = result.data.files_uploaded
            console.log(`Files Uploaded:`, files_uploaded)

            // TODO add these files to the ownership of the landlord
          }
          else {
            console.error(`Error uploading files...`)
            console.log(result)
          }
        })
      }
      
    }

    // loading the file uploader
    let input_ = document.createElement('input')
    input_.setAttribute('type', 'file')
    input_.setAttribute('multiple', 'true')
    input_.setAttribute(
      'accept', 
      `
      ${ALLOWED_FILETYPES_ABBREV.map((type_: string) => `${type_}, `)}
      ${ALLOWED_FILETYPES.map((type_: string) => `${type_}, `)}
      `
    )
    input_.addEventListener('change', handleFileUpload)
    input_.click()

  }

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  return (<Centered width={isMobile ? 300 : 600} height={`100%`}>
    <div style={{paddingTop: '80px'}}>
      <FloatingLogo />
      {/* Button Area */}
      <div style={{marginBottom: '20px', width: '40%'}}>
      </div>
      <div className="title-1" style={{marginBottom: '20px'}}>Property Ownership</div>

      {/* Property Location */}
      {propertyData && <div className="title-0" style={{marginBottom: '20px'}}>
        {propertyData.getProperty.data ? propertyData.getProperty.data.location : '__'}
      </div>}

      {/* Status */}
      {ownershipData && 
      <CommentBubble 
        header="status"
        message={getCommentMessage ()}
        color={getCommentColor ()}
      />}

      {/* Documents Uploaded */}
      <div style={{marginBottom: '20px'}} />

      {/* Save Changes Button */}
      <div style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        marginBottom: '20px'
        }}>
        <div style={{width: `100px`}}>
          <Fixate active={true}>
            <Button 
              text="Save"
              icon={<RiSave3Line />}
              iconLocation="right"
              background="#99E1D9"
            />
          </Fixate>
        </div>
      </div>

      <DocumentPreviews
        uploadEnabled={uploadsInFlight.length == 0}
        chooseDocument={chooseDocument}
        documents={ownershipData && ownershipData.getOwnership.data && ownershipData.getOwnership.data.ownership_documents ?
          ownershipData.getOwnership.data.ownership_documents.map((doc_) => {
            return {
              ...doc_,
              uploaded: true
            }
          })
          :[]}
        pending={uploadsInFlight}
      />
      
    </div>
  </Centered>)
}

interface Document_ extends OwnershipDocument {
  uploaded: boolean
  filename?: string
}

interface IDocumentPreviews {
  documents: Document_[]
  pending: Document_[]
  chooseDocument: Function
  uploadEnabled: boolean
}
const DocumentPreviews = ({documents, chooseDocument, uploadEnabled, pending}: IDocumentPreviews) => {

  return (<div className={`document-previews ${documents.length == 0 ? 'empty' : ''}`}>

    {/* document count */}
    <div className="title-1" style={{
      paddingLeft: '5px',
      height: '30px',
      lineHeight: '30px'
      }}>
      {documents.length} Documents <div
        style={{
          display: 'inline-block',
          fontFamily: 'mukta',
          lineHeight: '15px',
          fontWeight: 0,
          opacity: 0.6
      }}
      >
        | PDF, JPG, PNG, DOCS
      </div>
    </div>

    {
      documents.length == 0 && pending.length == 0 &&
      <div className="empty">
        <div style={{marginBottom: '10px'}}>No documents uploaded</div>
        <div>
          <Button 
            text="Upload Document(s)"
            icon={<HiPlus />}
            iconLocation="left"
            background="#99E1D9"
            onClick={uploadEnabled ? chooseDocument : () => {}}
          />
        </div>
      </div>
    }

    {
      documents.length > 0 || pending.length > 0 &&
      <div className="document-entry-grid">
        {/* Show the Uploaded */}

        {/* Show the Pending */}
        {pending.map((pending_: Document_, index: number) => {
          return (<div key={index} className="document-entry pending" aria-label={pending_.filename ? pending_.filename : ''}>
            <div className="loader"><div /></div>
            <div className="filename-area">{pending_.filename ? pending_.filename : ''}</div>
          </div>)
        })}
      </div>
    }
  </div>)
}

export default LandlordOwnershipDocuments