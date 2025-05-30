const cloudinary = require("cloudinary").v2;
//These all data you find on your cloudinary account.
cloudinary.config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
});

module.exports = {cloudinary};
