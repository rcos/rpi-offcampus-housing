import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useGetOwnershipsInReviewQuery, Ownership, Property} from '../API/queries/types/graphqlFragmentTypes'
import { useHistory } from 'react-router-dom'

import {useNumberCounter} from '../components/hooks/useNumberCounter'
import SortableList_, {EntryValue} from '../components/toolbox/layout/SortableList2'
import Input from '../components/toolbox/form/Input2'

const OwnershipReview = () => {

  const history = useHistory()
  const headerRef = useRef<HTMLDivElement>(null)
  const {data: ownershipsInReviewData} = useGetOwnershipsInReviewQuery({
    fetchPolicy: 'no-cache'
  })
  const [ownershipsInReview, setOwnershipsInReview] = useState<Ownership[]>([])

  useEffect(() => {
    if (ownershipsInReviewData && ownershipsInReviewData.getOwnershipsInReview 
      && ownershipsInReviewData.getOwnershipsInReview.data) {
        setOwnershipsInReview(ownershipsInReviewData.getOwnershipsInReview.data.ownerships)
      }
  }, [ownershipsInReviewData])


  let formCounter = useNumberCounter({
    value: ownershipsInReview ? ownershipsInReview.length : 0,
    duration: 800
  })

  const getLocation = (property: Property) => `${property.address_line} ${property.address_line_2}, ${property.city} ${property.state}, ${property.zip}`

  return (<ViewWrapper>
    <div>
      
    <div className="section-header-2" ref={headerRef}>
      <div className="title-area">Ownership Forms</div>
      <div className="counter_">{formCounter} forms</div>
      <div className="extra" style={{minWidth: `250px`, maxWidth: `300px`, width: `300px`}}>
        <Input />
      </div>
    </div>

    {!ownershipsInReviewData && <div>Loading TODO add loading animation</div>}

    {ownershipsInReviewData &&<SortableList_ 
      columns={["Landlord Name", "Address", "Date Submitted", "Documents"]}
      entries={ownershipsInReview.map((ownership_: Ownership) => {
        return {
          "landlord-name": ownership_.landlord_doc ? `${ownership_.landlord_doc.first_name} ${ownership_.landlord_doc.last_name}` : `undef`,
          "date-submitted": {
            data: new Date(ownership_.date_submitted),
            toString: dateToString
          },
          "address": ownership_.property_doc ? getLocation(ownership_.property_doc) : '',
          "documents": {
            data: ownership_.ownership_documents.length,
            toString: (data: number) => data.toString()
          },
          "id": ownership_._id,
        }
      })}
      sortConfig={{
        'date-submitted': (a: Date, b: Date) =>  a > b
      }}
      onClick={(entry: EntryValue) => {
        history.push(`/ownership/review/${entry["id"]}`)
      }}
    />}

    </div>
  </ViewWrapper>)
}

const dataToMS = (_date_: Date): string => _date_.getMilliseconds().toString()
const dateToString = (_date_: Date): string => `${_date_.getMonth()} / ${_date_.getDate()} / ${_date_.getFullYear()}`

export default OwnershipReview