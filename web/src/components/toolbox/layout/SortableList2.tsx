import React, {useRef, useState} from 'react'

/**
 * An even classier sortable list ;)
 */
export interface DataItem {
    data: any
    toString: (_: any) => string
}
export type EntryValue = {[key: string]: string | DataItem }

interface SortableListProps {
    columns: string[]
    entries: EntryValue[]
    sortConfig?: {[key: string]: (_: any, __: any) => boolean}
    onClick?: (_: {[key: string]: string | DataItem}) => void
}

const SortableList = ({
    columns,
    entries,
    sortConfig,
    onClick
}: SortableListProps) => {

    const getColKey = (key_: string): string => key_.toLowerCase().replaceAll(' ', '-')
    const [sortState, setSortState] = useState<{direction: number, colIndex: number}>({
        direction: 1,
        colIndex: -1
    })

    const getSortClass = (col_ind: number): string => {
        if (col_ind == sortState.colIndex) return sortState.direction == 1 ? `ascending` : `descending`
        return ``
    }
    const getSortedEntries = () => {
        if (sortState.colIndex < 0 || sortState.colIndex >= columns.length) return entries;

        let col_id = getColKey(columns[sortState.colIndex])
        let _entries = [...entries]

        _entries.sort((a: {[key: string]: string | DataItem}, b: {[key: string]: string | DataItem}): number => {

            if (sortConfig && Object.prototype.hasOwnProperty.call(sortConfig, col_id)) {
                console.log(`Non default sort`)
                return sortConfig[col_id](getData(a, col_id), getData(b, col_id)) ? 1 * sortState.direction : -1 * sortState.direction
            }

            console.log(`default sort`)
            return getValue(a, col_id) < getValue(b, col_id) ? -1 * sortState.direction : 1 * sortState.direction
        })
        return _entries
    }

    const isDataItem = (_: any) => Object.prototype.hasOwnProperty.call (_, `data`) && Object.prototype.hasOwnProperty.call(_, `toString`)
    const getData = (entry: {[key: string]: string | DataItem}, col_id: string): any => {
        if (!Object.prototype.hasOwnProperty.call(entry, col_id)) return `unidentified`
        let data_: string | DataItem = entry[col_id]
        if (isDataItem(data_)) {
            return (data_ as DataItem).data
        }

        // otherwise just return the string
        return data_ as string
    }
    const getValue = (entry: {[key: string]: string | DataItem}, col_id: string): string => {
        
        if (Object.prototype.hasOwnProperty.call(entry, col_id)) {
            let cell_entry: string | DataItem = (entry as any)[col_id]
            
            // if this is a data item ...
            if (Object.prototype.hasOwnProperty.call(cell_entry, `data`) && Object.prototype.hasOwnProperty.call(cell_entry, `toString`)) {
                return cell_entry.toString((cell_entry as DataItem).data)
            }
            else return cell_entry as string
        }
        return `no-value`
    }

    return (<div className="sortable-list-2">
        <div className="header">
            {columns.map((col_name: string, i: number) => {
                return <div key={i} className={`h_i ${getSortClass(i)}`}
                    onClick={() => {
                        setSortState({
                            direction: sortState.colIndex == i && sortState.direction == 1 ? -1 : 1,
                            colIndex: i
                        })
                    }}
                    style={{
                        width: `${(1/columns.length) * 100}%`
                    }}
                >{col_name}</div>
            })}
        </div>

        {/* List Entries */}
        <div>
            {getSortedEntries().map( (entry: {[key: string]: string | DataItem}, i_: number) => {
                return (<div className="list-item" key={i_} onClick={onClick ? () => onClick(entry) : () => {}}>
                    
                    {columns
                        .map((col_name: string) => getColKey(col_name))
                        .map((col_id: string, _i_: number) => {

                            let val_ = getValue (entry, col_id);
                            return (<div 
                                className="l_i"
                                key={_i_}
                                style={{width: `${100 * (1/ (columns.length == 0 ? 1 : columns.length) )}%`}}>
                                {val_}
                            </div>)

                        })
                    }
                </div>)
            })}
        </div>

    </div>)
}

export default SortableList