const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
  cloud_name: "djbdxrx6g",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadFile = async (tempFilePath, fileType) => {
  try {
    let folderName = "images";
    let format = "jpg";
    let resourceType = "image";
    if (fileType == "application/pdf") {
      folderName = "pdf";
      format = "pdf";
      resourceType = "raw";
    }

    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: "mietcollege/" + folderName,
      resource_type: resourceType,
      format,
    });

    fs.unlink(tempFilePath, (err) => {
      if (err) {
        console.error("Failed to delete temporary file:", err);
      } else {
        console.log("Temporary file deleted successfully");
      }
    });

    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    return error;
  }
};

exports.deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    return error;
  }
};
