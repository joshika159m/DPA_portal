const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "campusflow/submissions",
    allowed_formats: ["pdf", "zip", "docx", "pptx"],
  },
});

module.exports = multer({ storage });
