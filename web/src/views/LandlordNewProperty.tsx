import React, {useEffect, useState} from 'react'
import {useMediaQuery} from 'react-responsive'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router'

import {useCreateOwnershipMutation} from '../API/queries/types/graphqlFragmentTypes'
import {ReduxState} from '../redux/reducers/all_reducers'
import {BiHomeAlt} from 'react-icons/bi'
import {BsAt} from 'react-icons/bs'
import {HiArrowRight} from 'react-icons/hi'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import Centered from '../components/toolbox/layout/Centered'

interface IPropertyInfo {
  city: string
  state: string
  zip_code: string
  address_line: string
}

interface IFormError {
  hasError: boolean
  message?: string
}

const LandlordNewProperty = () => {

  const history = useHistory()
  const [createOwnership, {data: ownershipData}] = useCreateOwnershipMutation()
  const user = useSelector((state: ReduxState) => state.user)
  const [formError, setFormError] = useState<IFormError>({
    hasError: false
  })
  const [propertyInfo, setPropertyInfo] = useState<IPropertyInfo>({
    city: "",
    state: "",
    zip_code: "",
    address_line: ""
  })

  const propertyInfoValid = ():boolean => {
    return propertyInfo.city.length > 0 && propertyInfo.state.length > 0 
    && propertyInfo.zip_code.length > 0 && propertyInfo.address_line.length > 0
  }

  useEffect(() => {

    if (ownershipData) {

      if (ownershipData.createOwnershipReview.success) {
        // TODO proceed to next stage of registration
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

      createOwnership({
        variables: {
          landlord_id: landlord_info._id,
          address_line: propertyInfo.address_line,
          city: propertyInfo.city,
          state: propertyInfo.state,
          zip_code: propertyInfo.zip_code
        }
      })

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
      {formError.hasError && <div style={{marginBottom: "20px"}}>
        <CommentBubble 
          message={formError.message ? formError.message : ""}
          header="error"
          color="red"
        />
      </div>}

      <div className="title-1" style={{marginBottom: '20px'}}>Property Registration</div>

      {/* First And Last Name */}

      <div className="padded upper">
        <Input label="Address" 
          icon={<BiHomeAlt />}
          onChange={(val) => { let reg2 = propertyInfo; reg2.address_line = val; setPropertyInfo(reg2) }}
        />
      </div>

      <div className="padded upper" style={{display: "flex"}}>
        <div style={{width: "30%", marginRight:"10px"}}>
          <Input label="City" 
            onChange={(val) => { let reg2 = propertyInfo; reg2.city = val; setPropertyInfo(reg2) }}
          />
        </div>

        <div style={{width: "30%", marginRight:"10px"}}>
          <Input label="State" 
            onChange={(val) => { let reg2 = propertyInfo; reg2.state = val; setPropertyInfo(reg2) }}
          />
        </div>

        <div style={{flexGrow: 1}}>
          <Input label="Zip Code"
            onChange={(val) => { let reg2 = propertyInfo; reg2.zip_code = val; setPropertyInfo(reg2) }}
          />
        </div>
      </div>

      
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
          icon={<HiArrowRight />}
          iconLocation="right"
          background="#63db97"
        />
      </div>

    </div>
  </Centered>)
}

export default LandlordNewProperty