import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_APIKEY,
  api_secret: process.env.CLOUDINARY_CLOUD_APISECRET,
});

const uploadFileCloudnary = async (localpath) => {
  try {
    if (localpath == null) return null;
    //upload file on cloudinary 
    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    // file uploaded successfully
    console.log("File uploaded successfully ", response.url);
    return response ;
  } catch (error) {
    fs.unlinkSync(localpath); // remove all the temporary saved data
  }
};

