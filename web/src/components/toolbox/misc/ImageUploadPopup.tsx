import React from 'react'
import {HiX} from 'react-icons/hi'
import Popup, {PopupHeader} from './Popup'
import Button from '../form/Button'
import {objectURI} from '../../../API/S3API'

export const FileTypes = {
    PNG: `image/png`,
    JPEG: `image/jpeg`
}

interface ImageUploadPopupProps {
    object_keys: string[]
    image_types: string[]
    onFileUpload: (files: File[]) => void
    onDeleteImage: (file_key: string) => void
    show: boolean
    onClose: Function
}

const FILE_SIZE_LIMIT = 600 * 1000 // 600 kb

const ImageUploadPopup = ({
    object_keys,
    image_types,
    onFileUpload,
    onDeleteImage,
    show,
    onClose
    }: ImageUploadPopupProps) => {

    const uploadPhoto = () => {

        const handleFileUpload = (e: Event) => {
            let files_: FileList = (e.target as any).files

            // get qualified files
            let qualified_files: File[] = []
            for (let i = 0; i < files_.length; ++i) {
                if (
                    image_types.includes( files_[i].type )
                    && files_[i].size <= FILE_SIZE_LIMIT
                ) qualified_files.push(files_[i])
            }

            onFileUpload(qualified_files)
        }

        let uploadInput = document.createElement(`input`);
        uploadInput.setAttribute(`type`, `file`);
        uploadInput.setAttribute(`accept`, image_types.join());
        uploadInput.setAttribute(`multiple`, `true`);
        uploadInput.addEventListener(`change`, handleFileUpload);

        uploadInput.click ();
    }

    return (<Popup width={700} height={450} show={show}>
        <React.Fragment>
            <PopupHeader withClose={true} onClose={onClose}>Update Photos</PopupHeader>
            
            <div className="image-upload-popup">
                <div className="image-preview">
                    <div className="image-holder"></div>
                </div>
                <div className="image-thumbnails">
                    <div className="title" style={{
                        display: `flex`
                    }}>
                        <div style={{
                            flexGrow: 1,
                            transform: `translateY(5px)`
                        }}>{object_keys.length} Photos</div>
                        <div>
                            <Button 
                                text="Upload"
                                textColor="white"
                                background="#3B4353"
                                onClick={uploadPhoto}
                            />
                        </div>
                    </div>

                    {/* No Image Prompt */}
                    {object_keys.length == 0
                    && <div
                        style={{
                            height: `300px`,
                            position: `relative`
                        }}
                    >
                        <div style={{
                            position: `absolute`,
                            left: `50%`, top: `50%`,
                            transform: `translate(-50%, -50%)`,
                            fontFamily: `sans-serif`,
                            fontStyle: `italic`
                        }}>
                            No photos
                        </div>    
                    </div>}

                    <div className="thumbnails-area">
                        {object_keys.length > 0 
                        && object_keys.map((key_: string, i: number) => {
                            return (<div key={i} className="image-thumbnail">
                                <div className="delete-image-button"
                                    onClick={() => {
                                        onDeleteImage(key_)
                                    }}
                                ><HiX /></div>
                                <img 
                                    src={objectURI(key_)}
                                />
                            </div>)
                        })}
                    </div>

                </div>
            </div>
        </React.Fragment>
    </Popup>)
}

export default ImageUploadPopup