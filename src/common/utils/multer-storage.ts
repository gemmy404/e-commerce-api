import multer from "multer";
import fs from "node:fs";

export const createMulterStorage = () => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            let uploadPath = './uploads';

            if (req.url.includes('users')) {
                uploadPath += `/profiles`;
            } else if (req.url.includes('products')) {
                uploadPath += `/products`;
            }

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, {recursive: true});
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = file.mimetype.split('/')[1];
            const fileName = `${Date.now()}.${ext}`;
            cb(null, fileName);
        }
    })
}