import React, { useEffect, useState, useRef } from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {HiClipboard} from 'react-icons/hi'
import {useGetOwnershipsInReviewQuery, Ownership} from '../API/queries/types/graphqlFragmentTypes'

import SortableList, {Sorts, EntryValue} from '../components/toolbox/layout/SortableList'

const OwnershipReview = () => {

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
      entries={[
        {"landlord-name": "Sample 1a", "date-submitted": {data: new Date(0), toString: dateToString}, "conflicts": "sample 3a"},
        {"landlord-name": "Sample 1b", "date-submitted": {data: new Date(1000), toString: dateToString}, "conflicts": "sample 3b"},
        {"landlord-name": "Sample 1c", "date-submitted": {data: new Date(1000000), toString: dateToString}, "conflicts": "sample 3c"}
        ,{"landlord-name": "Sample 1d", "date-submitted": {data: new Date(1000000000000), toString: dateToString}, "conflicts": "sample 3d"}
      ]}
      onClick={(entry: {[key: string]: EntryValue}) => {
        console.log(entry)
      }}
      // sortConfig={{
      //   "Landlord Name": Sorts.alphabetical,
      //   "Date Submitted": Sorts.alphabetical,
      //   "Conflicts": Sorts.alphabetical
      // }}
    />

    </div>
  </ViewWrapper>)
}

const dateToString = (date_: Date): string => `${date_.getMonth()} / ${date_.getDate()} / ${date_.getFullYear()}`

export default OwnershipReview