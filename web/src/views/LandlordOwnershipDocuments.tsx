import React, {useEffect} from 'react'
import {useMediaQuery} from 'react-responsive'
import {HiArrowLeft} from 'react-icons/hi'
import {useHistory} from 'react-router'

// import {} from '../API/queries/types/graphqlFragmentTypes'
import Button from '../components/toolbox/form/Button'
import Centered from '../components/toolbox/layout/Centered'

const LandlordOwnershipDocuments = () => {

  const history = useHistory()

  useEffect(() => {

  })

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  return (<Centered width={isMobile ? 300 : 400} height={`100%`}>
    <div style={{paddingTop: '80px'}}>
      {/* Button Area */}
      <div style={{marginBottom: '20px', width: '40%'}}>
        <Button 
          onClick={() => {
            history.push('/landlord/dashboard')
          }}
          text="Home"
          icon={<HiArrowLeft />}
          iconLocation="left"
          background="#E4E4E4"
        />
      </div>
      <div className="title-1" style={{marginBottom: '20px'}}>Property Ownership</div>
      
    </div>
  </Centered>)
}

export default LandlordOwnershipDocuments