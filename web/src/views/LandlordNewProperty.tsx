import React, {useEffect, useState} from 'react'
import {useMediaQuery} from 'react-responsive'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router'

import {
  useVerifyAddressLazyQuery,
  useCreateOwnershipMutation
} from '../API/queries/types/graphqlFragmentTypes'
import {ReduxState} from '../redux/reducers/all_reducers'
import {BiHomeAlt} from 'react-icons/bi'
import {HiX} from 'react-icons/hi'
import Input, {noSpaces, $and, $or, numbersOnly, alnumOnly} from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import Centered from '../components/toolbox/layout/Centered'
import SuggestedInput from '../components/toolbox/form/SuggestionInput'


interface IPropertyInfo {
  city: string
  state: string
  zip_code: string
  address_line: string
  address_line_2: string
}

interface IFormError {
  hasError: boolean
  message?: string
}

let STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "AS", "DC",
  "FM", "GU", "MH", "MP", "PW", "PR", "VI"
]

const LandlordNewProperty = () => {

  const history = useHistory()
  const [verifyAddress, {data: verifiedAddress}] = useVerifyAddressLazyQuery()
  const [createOwnership, {data: ownershipData}] = useCreateOwnershipMutation()
  const user = useSelector((state: ReduxState) => state.user)
  const [formError, setFormError] = useState<IFormError>({
    hasError: false
  })
  const [propertyInfo, setPropertyInfo] = useState<IPropertyInfo>({
    city: "",
    state: "",
    zip_code: "",
    address_line: "",
    address_line_2: ""
  })

  const propertyInfoValid = ():boolean => {
    if (propertyInfo.state.length != 2) return false;
    return propertyInfo.city.length > 0 && propertyInfo.state.length > 0 
    && propertyInfo.zip_code.length > 0 && propertyInfo.address_line.length > 0
  }

  useEffect(() => {
    if (user && user.user) {
      if (!user.user.phone_number) {
        history.push({
          pathname: '/verify/phone-number',
          state: {
            redirect: '/landlord/new-property'
          }
        })
      }
    }
  }, [user])

  useEffect(() => {

    if (verifiedAddress && verifiedAddress.verifyAddress) {
      console.log(`Verify address:`)
      console.log(verifiedAddress.verifyAddress)

      if (verifiedAddress.verifyAddress.success && verifiedAddress.verifyAddress.data && user && user.user) {
        let landlord_info = user.user
        // Create ownership with the returned address
        createOwnership({
          variables: {
            landlord_id: landlord_info._id,
            address_line: verifiedAddress.verifyAddress.data.address_1.trim(),
            address_line_2: verifiedAddress.verifyAddress.data.address_2.trim(),
            city: verifiedAddress.verifyAddress.data.city.trim(),
            state: verifiedAddress.verifyAddress.data.state.trim(),
            zip_code: verifiedAddress.verifyAddress.data.zip.trim()
          }
        })
      }
      else {
        setFormError({
          hasError: true,
          message: "Invalid address provided. Please provide an existing address."
        })
      }
    }
  }, [verifiedAddress])

  useEffect(() => {

    if (ownershipData) {

      if (ownershipData.createOwnershipReview.success) {
        // TODO proceed to next stage of registration
        history.push(`/landlord/ownership-documents/${ownershipData.createOwnershipReview.data?._id}`)
      }
      else {
        console.error(`Error creating ownership`)
        setFormError({
          hasError: true,
          message: `${ownershipData.createOwnershipReview.error}`
        })
      }
    }

  }, [ownershipData])
  
  const submitPropertyRegistration = () => {
    // if the landlord doesn't have a phone number, don't submit
    if (user && user.user) {
      if (!user.user.phone_number) {
        history.push({
          pathname: '/verify/phone-number',
          state: {
            redirect: '/landlord/new-property'
          }
        })
      }
    }

    if (!propertyInfoValid()) {
      console.error(`Property information is invalid`)
      setFormError({
        hasError: true,
        message: "Invalid property information"
      })
      return;
    }
    if (!user) {
      console.error(`User is null...`)
      setFormError({
        hasError: true,
        message: "Not logged in"
      })
      return;
    }

    if (user.type && user.type == "landlord") {
      let landlord_info = user.user
      // check that the landlord information is present
      if (landlord_info == null) {
        console.error(`Landlord info is null`)
        setFormError({
          hasError: true,
          message: "Landlord information could not be found"
        })
        return;
      }

      // proceed with creating the ownership
      setFormError({ hasError: false })
      console.log(`Landlord ID: ${landlord_info._id}`)

      // ! Address Verification goes here
      verifyAddress({
        variables: {
          address_1: propertyInfo.address_line,
          address_2: propertyInfo.address_line_2,
          city: propertyInfo.city,
          state: propertyInfo.state,
          zip: propertyInfo.zip_code
        }
      })
      // TODO move createOwnership to after address verification
      /*
      createOwnership({
        variables: {
          landlord_id: landlord_info._id,
          address_line: propertyInfo.address_line,
          city: propertyInfo.city,
          state: propertyInfo.state,
          zip_code: propertyInfo.zip_code
        }
      })*/

      return;
    }
    
    setFormError({
      hasError: true,
      message: "Unknown server error"
    })
    console.error(`User may not be landlord.`, user)
  }

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  return (<Centered width={isMobile ? 300 : 400} height={500}>
    <div>

      <div className="title-1" style={{marginBottom: '20px'}}>Property Registration</div>

      {/* First And Last Name */}

      <div className="padded upper">
        <Input label="Primary Address Line" 
          icon={<BiHomeAlt />}
          onChange={(val) => { let reg2 = propertyInfo; reg2.address_line = val; setPropertyInfo(reg2) }}
          inputFilters={[
            alnumOnly
          ]}
        />
      </div>

      <div className="padded upper">
        <Input label="Secondary Address Line (optional)" 
          icon={<BiHomeAlt />}
          onChange={(val) => { let reg2 = propertyInfo; reg2.address_line_2 = val; setPropertyInfo(reg2) }}
          inputFilters={[
            alnumOnly
          ]}
        />
      </div>

      <div className="padded upper" style={{display: "flex"}}>
        <div style={{width: "30%", marginRight:"10px"}}>
          <Input label="City" 
            onChange={(val) => { let reg2 = propertyInfo; reg2.city = val; setPropertyInfo(reg2) }}
            inputFilters={[
              alnumOnly
            ]}
          />
        </div>

        <div style={{width: "30%", marginRight:"10px"}}>
          {/* <Input label="State" 
            onChange={(val) => { let reg2 = propertyInfo; reg2.state = val; setPropertyInfo(reg2) }}
            inputFilters={[
              $and(noSpaces, alnumOnly)
            ]}
          /> */}
          <SuggestedInput 
            label="State"
            onChange={(val) => { let reg2 = propertyInfo; reg2.state = val; setPropertyInfo(reg2) }}
            inferenceFn={(val: string): {[key: string]: string[]} => {
              let matched_states = STATES.filter((state_abbrev: string) => state_abbrev.toLowerCase().includes(val.toLowerCase()))
              return {"states": matched_states}
            }}
          />
        </div>

        <div style={{flexGrow: 1}}>
          <Input label="Zip Code"
            onChange={(val) => { let reg2 = propertyInfo; reg2.zip_code = val; setPropertyInfo(reg2) }}
            inputFilters={[
              $and(noSpaces, numbersOnly)
            ]}
          />
        </div>
      </div>

      {formError.hasError && <div className="error-line error">
        <span className="icon-holder"><HiX /></span> Error: {formError.message}
      </div>}
      
      <div className="padded upper" style={{width: "30%", float: "left"}}>
        <Button 
          onClick={() => {
            history.goBack()
          }}
          text="Cancel"
          background="#E4E4E4"
        />
      </div>

      <div className="padded upper" style={{width: "50%", float: "right"}}>
        <Button 
          onClick={() => {
            submitPropertyRegistration ()
          }}
          text="Next"
          iconLocation="right"
          background="#63db97"
        />
      </div>

    </div>
  </Centered>)
}

export default LandlordNewProperty