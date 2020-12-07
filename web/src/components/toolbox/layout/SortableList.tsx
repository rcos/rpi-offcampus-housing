import React, { useEffect, useRef, useState } from 'react'

export type EntryAbstraction = {value: string, data: any}
export type EntryTransformation = {data: any, toString: (data: any) => string}
export type EntryValue = string | EntryAbstraction | EntryTransformation

interface ISortableList {
    labels: string[]
    init_size_ratios?: number[]
    entries: {[key: string]: EntryValue} []
    sortConfig?: {[key: string]: (a: any, b: any, dir: number) => boolean}
    onClick?: (entry: {[key: string]: EntryValue}) => void
}

const SortableList = ({labels, entries, init_size_ratios, sortConfig, onClick}: ISortableList) => {

    /**
     * sortState ->
     *  @param dir = -1 | 1: If dir is -1, then the sort should be in descending order.
     *  If it is 1, then it should be in asdcending order.
     * @param label: string => The label column that the list should sort by. 
     */
    const [sortState, setSortState] = useState<{dir: number, label: string}>({dir: 1, label: ""})
    const [columnWidths, setColumnWidths] = useState<number[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const [minColWidth, setMinColWidth] = useState<number>(0)
    const activeResizer = useRef<{initX: number, resizerIndex: number}>({initX: 0, resizerIndex: -1})

    useEffect(() => {
        updateMinColWidth()
    }, [])

    useEffect(() => {
        setColumnWidths(labels.map((_: string, id: number) => {
            if (!containerRef.current) return 0;
            if (labels.length == 0) return 0;
            if (init_size_ratios) {
                return containerRef.current.getBoundingClientRect().width * normalizedRatios()[id]
            }
            return containerRef.current.getBoundingClientRect().width / labels.length
        }))

        updateResizersHeight();
    }, [labels])

    useEffect(() => {
        updateResizersHeight()
    }, [entries])

    useEffect(() => {

        window.addEventListener('resize', updateColumnWidths)

        return () => {
            window.removeEventListener('resize', updateColumnWidths)
        }
    }, [columnWidths])

    /**
     * The min col width specified the minimum width that
     * each column can be. It should update to scale accordingly
     * when the window is resized.
     */
    const updateMinColWidth = () => {
        if (!containerRef.current) return;
        let new_min_col = Math.max(0.65 * containerRef.current.getBoundingClientRect().width / labels.length, 100);
        setMinColWidth(new_min_col);
    }

    /**
     * Base don the width of the containerRef, scale the columnsWidths proportionally
     * such that the sum of the numbers in the list is equal to the width of the containerRef.
     */
    const updateColumnWidths = () => {
        updateMinColWidth();

        if (!containerRef.current) return;
        let container_width: number = containerRef.current.getBoundingClientRect().width
        let old_width = columnWidths.reduce((acc_, curr_) => acc_ + curr_)
        setColumnWidths(columnWidths.map((width: number): number => (width/old_width) * container_width ))
    }

    /**
     * updateResizersHeight
     * @desc Update the height of the resizer div elements to span the entire height of the table so that
     * users can access the resize from any edge of the table's columns.
     */
    const updateResizersHeight = () => {
        if (!containerRef.current) return;
        // Set the resizers to span the entire table's height
        let resizers: HTMLCollectionOf<HTMLDivElement> = document.getElementsByClassName('resizer') as HTMLCollectionOf<HTMLDivElement>
        for (let i = 0; i < resizers.length; ++i) {
            resizers[i].style.height = `${containerRef.current.getBoundingClientRect().height}px`;
        }
    }

    /**
     * Given an array of init_size_ratios, return a new array
     * where the sum of the numbers in the array are equal to 1.
     * 
     * If init_size_ratios.length != labels.length, fill in any missing
     * in init_size ratios with 1, then normalize. If it exceeds, then 
     * truncate the excess
     */
    const normalizedRatios = (): number[] => {
        if (!init_size_ratios) return []

        let normalized_: number[] = [...init_size_ratios];
        while (normalized_.length < labels.length) normalized_.push(1)
        normalized_ = normalized_.slice(0, labels.length)

        let sum_ = normalized_.reduce((acc_, curr_) => acc_ + curr_)
        return normalized_.map((val: number) => val / sum_)
    }

    /**
     * getColumnValue => Given an object with string keys and string values, find the
     * value whose key is associated with label.
     * @param entry The entry document to look through
     * @param label The label key we are searching for
     */
    const getColumnValue = (entry: {[key:string]: EntryValue}, label: string): string => {
        let searchable_label = label.toLowerCase().replace(' ', '-')
        if (Object.keys(entry).includes(searchable_label)) {
            let val: EntryValue = entry[searchable_label]

            if (typeof val == typeof "") return val as string;
            else if (Object.prototype.hasOwnProperty.call(val, 'value')) return (val as EntryAbstraction).value
            else if (Object.prototype.hasOwnProperty.call(val, 'toString')) return (val as EntryTransformation).toString((val as EntryTransformation).data)
        }
        return "null"
    }

    /**
     * getColumnData => Given an object with string keys and string values, find the
     * data whose key is associated with label.
     * @param entry The entry document to look through
     * @param label The label key we are searching for
     */
    const getColumnData = (entry: {[key:string]: EntryValue}, label: string): any => {
        let searchable_label = label.toLowerCase().replace(' ', '-')
        if (Object.keys(entry).includes(searchable_label)) {
            let val: EntryValue = entry[searchable_label]

            if (typeof val == typeof "") return val as string;
            else if (Object.prototype.hasOwnProperty.call(val, 'data')) return (val as EntryAbstraction | EntryTransformation).data
        }
        return "null"
    }

    /**
     * sortedEntries
     * @desc Given the sortState and the entries, return a new array of entries with
     * the data sorted either by the function provided in sortConfig, or, by default,
     * lexological order.
     */
    const sortedEntries = (): {[key:string]: EntryValue}[] => {
        // if there is no sort state ...
        if (!labels.includes(sortState.label)) {
            return entries;
        }

        let sort_fn: (a: any, b: any, dir: number) => boolean = 
            // sort function provided in config
            sortConfig && Object.prototype.hasOwnProperty.call(sortConfig, sortState.label) ? 
            sortConfig[sortState.label]
            : 
            // default sort function: lexological sort
            Sorts.lexological;

        // apply the sort function on the list of entries
        let new_entries = [...entries]
        new_entries.sort((a: any, b: any) => sort_fn(getColumnData(a, sortState.label), getColumnData(b, sortState.label), sortState.dir) ? 1 : -1)
        return new_entries;
    }

    const initResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, col_num: number) => {
        activeResizer.current = {initX: e.clientX, resizerIndex: col_num};
        document.addEventListener('mousemove', resizeColumn)
        document.addEventListener('mouseup', endResize)
    }

    /**
     * @return the key form of a label
     */
    const getLabelKey = (key: string): string => key.toLowerCase().replace(' ', '-')

    const resizeColumn = (e: MouseEvent) => {
        let d_x = activeResizer.current.initX - e.clientX
        let updated_client_widths = [...columnWidths];

        if (updated_client_widths[activeResizer.current.resizerIndex] - d_x < minColWidth
        ||  updated_client_widths[activeResizer.current.resizerIndex + 1] + d_x < minColWidth) return;

        updated_client_widths[activeResizer.current.resizerIndex] -= d_x
        updated_client_widths[activeResizer.current.resizerIndex + 1] += d_x
        setColumnWidths(updated_client_widths)
    }
    
    const endResize = () => {
        document.removeEventListener('mousemove', resizeColumn)
        document.removeEventListener('mouseup', endResize)
    }

    return (<div className="sortable-list" ref={containerRef}>

        <table style={{width: '100%'}}>
            <tbody style={{width: '100%'}}>
                <tr className="list-labels">
                    {labels.map((label: string, id: number) => (<th 
                        style={{
                            width: `${columnWidths[id]}px`
                        }}
                        key={id} className="list-label">
                        
                        <div onClick={() => {
                                setSortState({label, dir: sortState.label == label ? sortState.dir * -1 : 1})
                            }}>
                            <div className="label-text">
                                {label}
                                <div className={`up-sort ${label == sortState.label && sortState.dir == 1 ? 'active' : ''}`} />
                                <div className={`down-sort ${label == sortState.label && sortState.dir == -1 ? 'active' : ''}`} />
                            </div>
                        </div>

                        {id < labels.length - 1 && <div className="resizer" onMouseDown={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => 
                            {initResize(e, id)}} />}
                    </th>) )}
                </tr>

                {/* Show entries */}
                {
                    sortedEntries().map((entry: {[key:string]: EntryValue}, id: number) => {
                        return (<tr className="entry" key={id} onClick={() => {
                            if (onClick) onClick(entry)
                        }}>

                            {labels.map((label: string, id: number) => {
                                return (<td key={id}>{getColumnValue(entry, label)}</td>)
                            })}

                        </tr>)
                    })
                }
            </tbody>
        </table>
        
    </div>)
}

export const Sorts = {
    lexological: (a: any, b: any, dir: number): boolean => dir == 1? a > b :  b > a
}

export default SortableList