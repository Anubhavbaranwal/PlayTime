import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_APIKEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_APISECRET 
});


const uploadFileCloudnary = async (localpath) => {
  // console.log(localpath);
  try {
    if (localpath == null) return null;
    console.log(localpath + " a");

    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localpath);
    console.log(response);
    return response;
  } catch (error) {
    fs.unlinkSync(localpath); // remove all the temporary saved data
    return null;
  }
};

export { uploadFileCloudnary };
