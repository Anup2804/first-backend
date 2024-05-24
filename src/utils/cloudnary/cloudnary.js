// This file helps to upload the file to cloudnary.
/* It has a cloudnary and fs to handle all thing */

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dyjuadp1v",
  api_key: "486653126451462",
  api_secret: "T8blYRZC_wKPH2SjtOStbh3hkxY",
});

// console.log(process.env.CLOUDNARY_CLOUD_NAME);

const uploadoncloudnary = async (localFilePath) => {
  // This function uploads the data(file of any type)

  try {
    if (!localFilePath) return null;
    const fileurl = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file uploaded successfully", fileurl.url);
    fs.unlinkSync(localFilePath);
    return fileurl;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved file as the upload operation got failed.
    return null;
  }
};

export { uploadoncloudnary };
