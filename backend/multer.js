const multer = require("multer");
const path = require("path");

// Store configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // burada sorun yok, relative path kabul edilir
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // orijinal dosya uzantısı ekleniyor
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

// Initialize multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
