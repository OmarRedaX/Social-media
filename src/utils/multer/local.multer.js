import path from 'node:path';
import fs from 'node:fs'
import multer from 'multer';

export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

export const uploadFileDisk = (customPath="general",fileValidation=[])=> {

    const basePath = `uploads/${customPath}`;
    const fullPath = path.resolve(`./src/${basePath}`);

    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null, fullPath)
        },
        filename:(req,file,cb)=>{
            const finalFileName = Date.now() + '-' + Math.round(Math.random()*1E9) + '-' + file.originalname;
            file.finalPath = path.join(basePath,finalFileName);
            cb(null, finalFileName )
        }
    })

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