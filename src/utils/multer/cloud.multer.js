import multer from 'multer';

export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

export const uploadCloudFile = (fileValidation=[])=> {
    


    const storage = multer.diskStorage({})

    function fileFilter (req, file, cb) {
        if(fileValidation.includes(file.mimetype)){
            cb(null, true);
        }
        else {
            cb("Invalid file type", false);
        }
    }

    return multer({dest:'tempPath', fileFilter, storage})
}