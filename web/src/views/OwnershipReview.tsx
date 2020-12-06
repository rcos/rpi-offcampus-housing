import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {HiClipboard} from 'react-icons/hi'
import {useGetOwnershipsInReviewQuery, Ownership} from '../API/queries/types/graphqlFragmentTypes'

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

  useEffect(() => {
    console.log(`TEST`)
    console.log(ownershipsInReview)
  }, [ownershipsInReview])

  return (<ViewWrapper>
    <div>
      
    <div className="section-header left-and-right" ref={headerRef}>
      <div className="icon-area"><HiClipboard /></div>
      <div className="title-area">Ownership Forms</div>
      <div className="app-label">{ownershipsInReview.length} forms</div>
    </div>

    <SortableList 
      labels={["Landlord Name", "Date Submitted", "Conflicts"]}
      init_size_ratios={[2.5, 1, 1]}
      entries={
      ownershipsInReview.map((ownership_: Ownership) => {
        return {
          "landlord-name": ownership_.landlord_doc ? `${ownership_.landlord_doc.first_name} ${ownership_.landlord_doc.last_name}` : `undef`,
          "date-submitted": {
            data: new Date(ownership_.date_submitted),
            toString: dateToString
          },
          "conflicts": "no",
          "id": ownership_._id
        }
      })
    }
      onClick={(entry: {[key: string]: EntryValue}) => {
        history.push(`/ownership/review/${entry["id"]}`)
      }}
    />

    </div>
  </ViewWrapper>)
}

const dateToString = (date_: Date): string => `${date_.getMonth()} / ${date_.getDate()} / ${date_.getFullYear()}`

export default OwnershipReview