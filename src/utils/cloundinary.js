import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file is uploaded on cloudinary", response.url);
    // File successfully uploaded to Cloudinary, now delete the local file
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error("Error deleting the local file:", err);
        return;
      }
      console.log("Local file deleted successfully.");
    });
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath); //remove locally the locally saved temp file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
