import React from 'react'
import Popup, {PopupHeader} from './Popup'

const ImageUploadPopup = () => {


    return (<Popup width={700} height={450} show={true}>
        <React.Fragment>
            <PopupHeader withClose={true}>Update Photos</PopupHeader>
            
            <div className="image-upload-popup">
                <div className="image-preview">
                    <div className="image-holder"></div>
                </div>
                <div className="image-thumbnails">
                    <div className="title">
                        10 Photos
                    </div>

                    <div className="thumbnails-area">
                        {Array.from(new Array(20), (_: any, i: number) => {
                            return (<div className="image-thumbnail" />)
                        })}
                    </div>

                </div>
            </div>
        </React.Fragment>
    </Popup>)
}

export default ImageUploadPopup