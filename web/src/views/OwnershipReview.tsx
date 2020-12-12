import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useGetOwnershipsInReviewQuery, Ownership, Property} from '../API/queries/types/graphqlFragmentTypes'

import {useNumberCounter} from '../components/hooks/useNumberCounter'
import SortableList, {EntryValue} from '../components/toolbox/layout/SortableList'
import { useHistory } from 'react-router-dom'

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
    </div>

    {!ownershipsInReviewData && <div>Loading TODO add loading animation</div>}

    {ownershipsInReviewData && <SortableList 
      labels={["Landlord Name", "Address", "Date Submitted", "Documents", "Assigned To", "Conflicts"]}
      init_size_ratios={[2, 3, 1, 1, 1]}
      entries={
      ownershipsInReview.map((ownership_: Ownership) => {
        return {
          "landlord-name": ownership_.landlord_doc ? `${ownership_.landlord_doc.first_name} ${ownership_.landlord_doc.last_name}` : `undef`,
          "date-submitted": {
            data: new Date(ownership_.date_submitted),
            toString: dateToString
          },
          "conflicts": "no",
          "assigned-to": "-",
          "address": ownership_.property_doc ? getLocation(ownership_.property_doc) : '',
          "documents": {
            data: ownership_.ownership_documents.length,
            toString: (data: number) => data.toString()
          },
          "id": ownership_._id,
        }
      })
    }
      onClick={(entry: {[key: string]: EntryValue}) => {
        history.push(`/ownership/review/${entry["id"]}`)
      }}
    />}

    </div>
  </ViewWrapper>)
}

const dateToString = (date_: Date): string => `${date_.getMonth()} / ${date_.getDate()} / ${date_.getFullYear()}`

export default OwnershipReview