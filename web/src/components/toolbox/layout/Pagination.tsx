import React from 'react'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface IPagination {
  pageChange: (page_number: number) => void
  page: number
  page_range: {min: number, max: number}
}

const Pagination = ({pageChange, page, page_range}: IPagination) => {

  const isActive = ({prev, next}: {prev?: boolean, next?: boolean}): boolean => {
    if (prev) {
      return page > page_range.min
    }
    if (next) {
      return page < page_range.max // temporary page limiting
    }
    return false;
  }

  return (<div className="pagination">
  <div className={`left-arrow-area ${isActive({prev: true}) ? 'active' : 'inactive'} `} onClick={() => {
    if (isActive({prev: true})) pageChange(page - 1)
  }}>
    <div className="icon-area left"><IoIosArrowBack /></div>
    <div>Prev</div>
  </div>
  <div className="page-indices">
    {Array.from(new Array(Math.abs(page_range.max - page_range.min) + 1), (_, i: number) => {
      return (<div 
        key={i}
        onClick={() => {pageChange(page_range.min + i)}}
        className={`page-index ${i === page ? 'active' : ''}`}>{page_range.min + i + 1}</div>);
    })}
  </div>
  <div className={`right-arrow-area ${isActive({next: true}) ? 'active' : 'inactive'}`} onClick={() => {
    if (isActive({next: true})) pageChange(page + 1)
  }}>
    <div>Next</div>
    <div className="icon-area right"><IoIosArrowForward /></div>
  </div>
</div>)
}

export default Pagination