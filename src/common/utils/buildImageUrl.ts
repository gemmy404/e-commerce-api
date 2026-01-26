import process from "node:process";

export const buildImageUrl = (image: string | string[]): string | string[] => {
    const baseUrl: string =
        `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload`;
    if (typeof image === "string") {
        return `${baseUrl}/${image}`;
    }
    const images: string[] = [];
    for (const img of image) {
        images.push(`${baseUrl}/${img}`);
    }
    return images;
}