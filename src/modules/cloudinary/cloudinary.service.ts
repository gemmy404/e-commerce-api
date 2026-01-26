import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {v2 as cloudinary, UploadStream} from 'cloudinary';
import {CloudinaryResponse} from "./cloudinary-response";
import {UploadApiErrorResponse, UploadApiResponse} from "cloudinary";
import streamifier from "streamifier";
import {Cron} from "@nestjs/schedule";

@Injectable()
export class CloudinaryService {

    private readonly logger = new Logger(CloudinaryService.name);

    uploadFile(file: Express.Multer.File, tags: string[] = []): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream: UploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER_NAME,
                    public_id: Date.now().toString(),
                    use_filename: true,
                    unique_filename: true,
                    tags,
                },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async uploadFiles(files: Express.Multer.File[]) {
        const results = await Promise.allSettled(
            files.map(file => this.uploadFile(file, ['temp']))
        );

        const uploaded = results
            .filter(res => res.status === 'fulfilled')
            .map(res => (res as PromiseFulfilledResult<UploadApiResponse>).value);

        const failed = results.some(r => r.status === 'rejected');

        if (failed) {
            throw new BadRequestException('Images upload failed');
        }

        return uploaded;
    }


    removeTags(uploadedPublicIds: string[]) {
        cloudinary.uploader.remove_tag(
            'temp',
            uploadedPublicIds
        );
    }

    @Cron('0 * * * *')
    async cleanupOldTempImages() {
        this.logger.log('Starting Cloudinary temp cleanup...');
        const quartHourAgo = new Date(Date.now() - 15 * 60 * 1000);

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'e-commerce/',
            tags: true,
            max_results: 100,
        });

        const toDelete = result.resources.filter(img =>
            img.tags?.includes('temp') &&
            new Date(img.created_at) < quartHourAgo
        );

        await Promise.all(
            toDelete.map(img =>
                cloudinary.uploader.destroy(img.public_id)
            )
        );

        this.logger.log(
            `Deleted ${toDelete.length || 0} temp images`
        );
    }

}
